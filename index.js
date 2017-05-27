'use strict'

var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
var spacebroClient = require('spacebro-client')
var chokidar = require('chokidar')
var pathHelper = require('path')
var ip = require('ip')
var process = require('process')
var mediainfo = require('mediainfo-q')
var finalPort
var standardSettings = require('standard-settings')
var settings = require('nconf').get()

var portfinder = require('portfinder')
portfinder.basePort = settings.server.port

var checkIntegrityTimeout

var watcher = chokidar.watch(settings.folder, {
  ignored: /[/\\]\./,
  persistent: true,
  ignoreInitial: true
})

// Serve up public/ftp folder
var serve = serveStatic(settings.folder, { 'index': ['index.html', 'index.htm'] })

// Create server
var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

var getNormalizedFilePath = function (filePath) {
  let path = pathHelper.normalize(pathHelper.sep + filePath.replace(settings.folder, ''))
  return path
}

var checkIntegrity = function (path, cb) {
  clearTimeout(checkIntegrityTimeout)
  checkIntegrityTimeout = setTimeout(function () {
    mediainfo(path)
      .then(function (res) {
        // console.log(res)
        if (res[0].duration && res[0].duration.length > 0) {
          cb()
        }
      }).catch(function (err) {
        console.error(err)
      })
  }, 1000)
}

var send = function (path) {
  let host = settings.server.host || ip.address()
  let filepath = getNormalizedFilePath(path)
  let fileURL = 'http://' + host + ':' + finalPort + filepath
  spacebroClient.emit(settings.service.spacebro.outputMessage, {
    namespace: pathHelper.dirname(filepath).replace('/', ''),
    src: fileURL, // deprecated
    url: fileURL,
    path: pathHelper.resolve(process.cwd(), path),
    file: pathHelper.basename(path)
  })
  log(`File ${path} has been sent`)
}

spacebroClient.connect(settings.service.spacebro.address, settings.service.spacebro.port, {
  clientName: settings.service.spacebro.clientName,
  channelName: settings.service.spacebro.channelName,
  verbose: false
})

spacebroClient.on('connect', () => {
  console.log(`spacebro: ${settings.service.spacebro.clientName} connected to ${settings.service.spacebro.address}:${settings.service.spacebro.port}#${settings.service.spacebro.channelName}`)
})

spacebroClient.on('new-member', (data) => {
  console.log(`spacebro: ${data.member} has joined.`)
})

spacebroClient.on('disconnect', () => {
  console.error('spacebro: connection lost.')
})

var log = console.log.bind(console)
// Add event listeners.
watcher
  .on('add', path => {
    log(`File ${path} has been added`)
    if (pathHelper.extname(path) === '.mp4') {
      checkIntegrity(path, function () {
        send(path)
      })
    } else {
      send(path)
    }
  })
  .on('change', path => {
    log(`File ${path} has been changed`)
    if (pathHelper.extname(path) === '.mp4') {
      checkIntegrity(path, function () {
        send(path)
      })
    }
  })
  .on('unlink', path => {
    log(`File ${path} has been removed`)
    spacebroClient.emit('unlink-media', { path: path })
  })

// More possible events.
watcher
  .on('addDir', path => log(`Directory ${path} has been added`))
  .on('unlinkDir', path => log(`Directory ${path} has been removed`))
  .on('error', error => log(`Watcher error: ${error}`))
  .on('ready', () => log(`Initial scan ${settings.folder} complete. Ready for broadcast change`))
  .on('raw', (event, path, details) => {
    log('Raw event info:', event, path, details)
  })

// Listen
portfinder.getPort(function (err, port) {
  finalPort = port
  server.listen(finalPort)
  if (err) {
    console.error(err)
  }
})
