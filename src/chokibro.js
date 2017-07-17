'use strict'

var portfinder = require('portfinder')
var express = require('express')
const ip = require('ip')
var packageInfos = require('../package.json')

const spacebro = require('./spacebro')
const watcher = require('./watcher')
const stateServe = require('./state-serve')

var finalPort
var app = express()

let init = (settings, cb) => {
  portfinder.basePort = process.env.PORT || settings.server.port
  //var serve = serveStatic(settings.folder, { 'index': ['index.html', 'index.htm'] })

  // Create server
  /*var server = http.createServer(function (req, res) {
    var done = finalhandler(req, res)
    serve(req, res, done)
  })*/

  portfinder.getPort(function (err, port) {
    if (err) {
      console.error(err)
      cb && cb(err)
    } else {
      finalPort = port
      spacebro.init(settings.service.spacebro, port, settings.folder, settings.server.host)
      app.use(express.static(settings.folder))
      stateServe.init(app, {
        app: {
          name: packageInfos.name,
          version: packageInfos.version,
          site: {
            url: packageInfos.repository.url,
            name: packageInfos.name
          }
        }
      })

      app.listen(finalPort)
      //server.listen(finalPort)
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
