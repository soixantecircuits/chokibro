'use strict'

var portfinder = require('portfinder')
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
const ip = require('ip')
var finalPort

const spacebro = require('./spacebro')
const watcher = require('./watcher')

let init = (settings) => {
  portfinder.basePort = settings.server.port
  var serve = serveStatic(settings.folder, { 'index': ['index.html', 'index.htm'] })

  // Create server
  var server = http.createServer(function (req, res) {
    var done = finalhandler(req, res)
    serve(req, res, done)
  })
  portfinder.getPort(function (err, port) {
    finalPort = port
    spacebro.init(settings.service.spacebro, port, settings.folder, settings.server.host)
    watcher.init(settings.folder)
    server.listen(finalPort)
    console.log(`Serving file on http://${ip.address()}:${finalPort}`)
    if (err) {
      console.error(err)
    }
  })
}

module.exports = {
  init
}
