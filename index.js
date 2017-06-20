'use strict'
var standardSettings = require('standard-settings')
var settings = standardSettings.getSettings()

const chokibro = require('./src/chokibro')
chokibro.init(settings)
