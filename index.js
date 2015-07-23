'use strict'

require('rootpath')()

var Hapi = require('hapi')
var Primus = require('primus')
var config = require('config')
var Drone = require('models/drone')
var logger = require('lib/log.js')(module)
var apiRoutes = require('config/apiRoutes')
var server = new Hapi.Server()

server.connection({
  port: config.port
})

var primus = Primus(server.listener, {})

primus.on('connection', function (spark) {
  spark.write('ping')
  spark.on('data', function (data) {
    logger.info(data)
  })
})

server.route(apiRoutes(config))

if (!module.parent) {
  server.start(function (err) {
    if (err) {
      return console.error(err)
    }

    logger.info('Server started', server.info.uri)
  })
}

module.exports = server
