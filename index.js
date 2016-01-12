'use strict'

var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
var spacebroClient = require('spacebro-client')
var chokidar = require('chokidar')
var pathHelper = require('path')

var config = {
  folder: '/Users/gabrielstuff/Sources/node/testio/tmp',
  server: {
    port: 3030
  }
}

var watcher = chokidar.watch(config.folder, {
  ignored: /[\/\\]\./,
  persistent: true,
  ignoreInitial: true
})

var ip = require('ip')

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

spacebroClient.registerToMaster([{name: 'new-media'}], 'chokibro')

var log = console.log.bind(console)
// Add event listeners.
watcher
  .on('add', path => {
    log(`File ${path} has been added`)
    let filepath = getNormalizedFilePath(path)
    let fileURL = 'http://' + ip.address() + ':' + config.server.port + filepath
    spacebroClient.emit('new-media', {namespace: pathHelper.dirname(filepath).replace('/', ''), src: fileURL})
  })
  .on('change', path => log(`File ${path} has been changed`))
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
server.listen(config.server.port)
