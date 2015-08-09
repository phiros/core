var config = require('config')
var senecaForwarder = require('../../senecaForwarder.js')
var ReadWriteLock = require('rwlock')

module.exports = function () {
  var retrieveLock = new ReadWriteLock()
  var forwarder = senecaForwarder.bind(undefined, 'jobs')

  return [{
    path: config.apiPrefix + 'jobs',
    method: 'GET',
    handler: function (request, reply) {
      var payload = request.payload

      forwarder('get', payload, function (err, results) {
        if (err) reply('').code(503) // Service Unavailable
        else reply(results)
      })
    }
  }, {
    path: config.apiPrefix + 'jobs/retrieve',
    method: 'GET',
    handler: function (request, reply) {
      var payload = request.payload
      retrieveLock.writeLock(function (release) {
        // needs to be protected; microservices are async.
        forwarder('retrieve', payload, function (err, results) {
          if (err) reply('').code(503) // Service Unavailable
          else reply(results)
        })
        release()
      })
    }
  }, {
    path: config.apiPrefix + 'jobs/{id}',
    method: 'PUT',
    handler: function (request, reply) {
      var id = request.params.id
      var payload = request.payload

      forwarder('update', {id: id, data: payload}, function (err, results) {
        if (err) reply('').code(503) // Service Unavailable
        else reply(results)
      })
    }
  }]
}
