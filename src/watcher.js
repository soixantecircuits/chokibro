'use strict'

const chokidar = require('chokidar')
const pathHelper = require('path')
//const mediainfo = require('mediainfo-q')
const ffprobe = require('node-ffprobe')
const ffprobeInstaller = require('@ffprobe-installer/ffprobe')
ffprobe.FFPROBE_PATH = ffprobeInstaller.path
ffprobe.SYNC = true
const untildify = require('untildify')
const mime = require('mime-types')
let watchedFolder = ''
let shouldCheckIntegrity = false
var spacebro = require('./spacebro')
let watcher
let cb = null

const checkIntegrityAsync = async path => {
  try {
    const result = await ffprobe(path)
    // console.log(result)
    if (isVideo(path) && result.streams && result.streams.length > 0 && result.format.duration && Number(result.format.duration) > 0) {
      return true
    } else if (isImage(path)) {
      return result.format.nb_streams > 0
    } else if (isSound(path) && result.streams && result.streams.length > 0 && result.format.duration && Number(result.format.duration) > 0) {
      return true
    } else {
      console.warn('looks like it is not a media or it is corrupted')
      return false
    }
  } catch (err) {
    console.error(err)
    return false
  }
}

var log = console.log.bind(console)

const update = folder => {
  watcher.unwatch(watchedFolder)
  watchedFolder = folder
  watcher.add(folder)
}
const isVideo = path => {
  return mime.lookup(path) && mime.lookup(path).indexOf('video') > -1
}

const isImage = path => {
  return mime.lookup(path) && mime.lookup(path).indexOf('image') > -1
}

const isSound = path => {
  return mime.lookup(path) && mime.lookup(path).indexOf('audio') > -1
}

const init = (settings, callback) => {
  cb = callback
  watchedFolder = untildify(settings.folder)
  shouldCheckIntegrity = settings.checkIntegrity
  watcher = chokidar.watch(watchedFolder, {
    ignored: /[/\\]\./,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  })

  watcher
    .on('add', async path => {
      log(`File ${path} has been added`)
      if (shouldCheckIntegrity) {
        let integrity = await checkIntegrityAsync(path)
        if (integrity === true) {
          spacebro.send(path)
        } else {
          console.error('file is not ok')
        }
      } else {
        console.warn('No integrity file check')
        spacebro.send(path)
      }
    })
    .on('change', async path => {
      log(`File ${path} has been changed`)
      if (shouldCheckIntegrity) {
        let integrity = await checkIntegrityAsync(path)
        if (integrity === true) {
          spacebro.send(path)
        } else {
          console.error('file is not ok')
        }
      } else {
        console.warn('No integrity file check')
        spacebro.send(path)
      }
    })
    .on('unlink', path => {
      log(`File ${path} has been removed`)
      spacebro.send(path, 'unlink')
    })

  // More possible events.
  watcher
    .on('addDir', path => log(`Directory ${path} has been added`))
    .on('unlinkDir', path => log(`Directory ${path} has been removed`))
    .on('error', error => log(`Watcher error: ${error}`))
    .on('ready', () => {
      log(`Scan of ${watchedFolder} complete. Ready for broadcast change`)
      cb && cb(null)
    })
    .on('raw', (event, path, details) => {
      log('Raw event info:', event, path, details)
    })
}

module.exports = {
  init,
  update,
  watchedFolder
}
