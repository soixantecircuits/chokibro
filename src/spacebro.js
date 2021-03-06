'use strict'

const ip = require('ip')
const spacebroClient = require('spacebro-client')
const pathHelper = require('path')
var globParent = require('glob-parent')
const untildify = require('untildify')
let finalPort = null
let watchedFolder = ''
let serverHost = ''
const log = console.log.bind(console)
let spacebroConfig = {}
const getNormalizedFilePath = function (filePath) {
  let pathCompound = pathHelper.sep + 'static' + pathHelper.sep + filePath.replace(untildify(globParent(watchedFolder)), '')
  const path = pathHelper.normalize(pathCompound)
  return path
}

const send = (path, message) => {
  const host = serverHost || ip.address()
  const filepath = getNormalizedFilePath(path)
  const fileURL = 'http://' + host + ':' + finalPort + filepath
  let event = spacebroConfig.client.out.outMedia.eventName
  if (message === 'unlink') {
    event = spacebroConfig.client.out.unlinkMedia.eventName
  }

  spacebroClient.emit(event, {
    namespace: pathHelper.dirname(filepath).replace('/', ''),
    src: fileURL, // deprecated
    url: fileURL,
    path: pathHelper.resolve(process.cwd(), path),
    file: pathHelper.basename(path)
  })
  log(`File ${path} has been sent`)
  log(`Url ${fileURL} has been sent`)
}

const init = (spacebroConf, port, folder, host) => {
  spacebroConfig = spacebroConf
  watchedFolder = folder
  serverHost = host
  finalPort = port
  spacebroClient.connect(spacebroConfig.host, spacebroConfig.port, {
    client: spacebroConfig.client,
    channelName: spacebroConfig.channelName,
    verbose: false
  })

  spacebroClient.on('connect', () => {
    console.log(`spacebro: ${spacebroConfig.client.name} connected to ${spacebroConfig.host}:${spacebroConfig.port}#${spacebroConfig.channelName}`)
  })

  spacebroClient.on('newClient', (data) => {
    console.log(`spacebro: ${data.name} has joined.`)
  })

  spacebroClient.on('disconnect', () => {
    console.error('spacebro: connection lost.')
  })
}

module.exports = {
  init,
  send,
  emit: spacebroClient.emit
}
