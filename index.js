'use strict'

var Hapi = require('hapi')
var Primus = require('primus')
var config = require('config')
var EventEmitter = require('eventemitter3')
var logger = require('./lib/log.js')(module)
var apiRoutes = require('./lib/routes/api')
var eventHandlers = require('./lib/eventHandlers')
var server = new Hapi.Server()

server.connection({
  port: config.port
})

var emitter = new EventEmitter()
eventHandlers(emitter)

var primus = Primus(server.listener, {})
primus.on('connection', function (spark) {
  spark.write('ping')
  spark.on('data', function (data) {
    logger.info(data)
  })
})

server.route(apiRoutes(emitter))
if (process.argv[2] === 'server') {
  server.start(function (err) {
    if (err) {
      return console.error(err)
    }

    logger.info('Server started', server.info.uri)
  })
}

module.exports = server
