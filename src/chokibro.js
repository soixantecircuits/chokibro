'use strict'

var portfinder = require('portfinder')
var express = require('express')
const ip = require('ip')
const packageInfos = require('../package.json')
const pathHelper = require('path')
const spacebro = require('./spacebro')
const watcher = require('./watcher')
const stateServe = require('./state-serve')
var globParent = require('glob-parent')

var finalPort
var app = express()

var resolveHome = (filepath) => {
  if (filepath[0] === '~') {
    return pathHelper.join(process.env.HOME, filepath.slice(1))
  }
  return filepath
}

const init = (settings, cb) => {
  portfinder.basePort = process.env.PORT || settings.server.port

  portfinder.getPort(function (err, port) {
    if (err) {
      console.error(err)
      cb && cb(err)
    } else {
      finalPort = port
      spacebro.init(settings.service.spacebro, port, settings.folder, settings.server.host)
      app.use(express.static(globParent(resolveHome(settings.folder))))
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
      watcher.init(settings.folder, (err) => {
        if (!err) {
          cb && cb(null, { port: port })
        } else {
          cb && cb(err)
        }
      })
      console.log(`Serving file on http://${ip.address()}:${finalPort}`)
    }
  })
}

const changeDirectory = (watchedFolder) => {
  watcher.update(watchedFolder)
  app.use(express.static(resolveHome(watchedFolder)))
}

module.exports = {
  init,
  changeDirectory
}
