'use strict'

var portfinder = require('portfinder')
var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')
const ip = require('ip')
var finalPort

const spacebro = require('./spacebro')
const watcher = require('./watcher')

let init = (settings, cb) => {
  portfinder.basePort = settings.server.port
  var serve = serveStatic(settings.folder, { 'index': ['index.html', 'index.htm'] })

  // Create server
  var server = http.createServer(function (req, res) {
    var done = finalhandler(req, res)
    serve(req, res, done)
  })

  portfinder.getPort(function (err, port) {
    if (err) {
      console.error(err)
      cb && cb(err)
    } else {
      finalPort = port
      spacebro.init(settings.service.spacebro, port, settings.folder, settings.server.host)
      server.listen(finalPort)
      watcher.init(settings.folder, (err) => {
        if (!err) {
          cb && cb(null, {port: port})
        } else {
          cb && cb(err)
        }
      })
      console.log(`Serving file on http://${ip.address()}:${finalPort}`)
    }
  })
}

let changeDirectory = (watchedFolder) => {
  watcher.update(watchedFolder)
}

module.exports = {
  init,
  changeDirectory
}
