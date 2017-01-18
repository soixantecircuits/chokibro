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
var config
try {
  config = require('./config')
} catch (e) {
  config = require('./config.example')
}

var portfinder = require('portfinder')
portfinder.basePort = config.server.port

var checkIntegrityTimeout

var watcher = chokidar.watch(config.folder, {
  ignored: /[/\\]\./,
  persistent: true,
  ignoreInitial: true
})

// Serve up public/ftp folder
var serve = serveStatic(config.folder, { 'index': ['index.html', 'index.htm'] })

// Create server
var server = http.createServer(function (req, res) {
  var done = finalhandler(req, res)
  serve(req, res, done)
})

var getNormalizedFilePath = function (filePath) {
  let path = pathHelper.normalize(pathHelper.sep + filePath.replace(config.folder, ''))
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
  let filepath = getNormalizedFilePath(path)
  let fileURL = 'http://' + ip.address() + ':' + finalPort + filepath
  spacebroClient.emit('new-media', {
    namespace: pathHelper.dirname(filepath).replace('/', ''),
    src: fileURL,
    path: pathHelper.resolve(process.cwd(), path)
  })
  log(`File ${path} has been sent`)
}

//spacebroClient.registerToMaster([{name: 'new-media'}], 'chokibro')
spacebroClient.connect({clientName:'chokibro', channelName: config.channelName})

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
  .on('unlink', path => log(`File ${path} has been removed`))

// More possible events.
watcher
  .on('addDir', path => log(`Directory ${path} has been added`))
  .on('unlinkDir', path => log(`Directory ${path} has been removed`))
  .on('error', error => log(`Watcher error: ${error}`))
  .on('ready', () => log('Initial scan complete. Ready for changes'))
  .on('raw', (event, path, details) => {
    log('Raw event info:', event, path, details)
  })

// Listen
portfinder.getPort(function (err, port) {
  finalPort = port
  server.listen(finalPort)
})
