'use strict'
var standardSettings = require('standard-settings')
var settings = standardSettings.getSettings()
const chokibro = require('../')

chokibro.init(settings, (err, config) => {
  if (err) {
    console.error(err)
  } else {
    console.log(`chokibro runs on ${config.port}`)
    chokibro.changeDirectory('/tmp')
  }
})
