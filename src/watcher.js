'use strict'

const chokidar = require('chokidar')
const pathHelper = require('path')
const mediainfo = require('mediainfo-q')
const commandExistsSync = require('command-exists').sync
let canCheckIntegrity = false
let watchedFolder = ''
var spacebro = require('./spacebro')
let watcher
let cb = null

if (commandExistsSync('mediainfo')) {
  canCheckIntegrity = true
} else {
  console.warn('!!!! MISSING COMMAND LINE TOOL !!!!')
  console.warn('Please install mediainfo. brew install mediainfo, apt-get install mediainfo')
  console.warn('!!!! ------------------------- !!!!')
}

var checkIntegrityTimeout = null

var checkIntegrity = (path, cb) => {
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

var log = console.log.bind(console)

var resolveHome = (filepath) => {
  if (filepath[0] === '~') {
    return pathHelper.join(process.env.HOME, filepath.slice(1))
  }
  return filepath
}

const update = (folder) => {
  watcher.unwatch(watchedFolder)
  watchedFolder = folder
  watcher.add(folder)
}
const isVideo = (path) => {
  return pathHelper.extname(path) === '.mp4' || pathHelper.extname(path) === '.MP4'
}

const init = (folder, callback) => {
  cb = callback
  watchedFolder = resolveHome(folder)
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
    .on('add', path => {
      log(`File ${path} has been added`)
      if (isVideo(path) && (canCheckIntegrity)) {
        checkIntegrity(path, function () {
          spacebro.send(path)
        })
      } else {
        console.warn('No integrity file check')
        spacebro.send(path)
      }
    })
    .on('change', path => {
      log(`File ${path} has been changed`)
      if (isVideo(path) && (canCheckIntegrity)) {
        checkIntegrity(path, function () {
          spacebro.send(path)
        })
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
