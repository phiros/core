var senecaForwarder = require('../senecaForwarder.js')
var logger = require('../../lib/log.js')(module)

module.exports = function (options) {
  var seneca = this
  seneca.add({role: 'jobs', cmd: 'get'}, getJobs)
  seneca.add({role: 'jobs', cmd: 'retrieve'}, retrieveJob)
  seneca.add({role: 'jobs', cmd: 'update'}, updateJob)
  seneca.add({role: 'jobs', cmd: 'new'}, newJob)
  seneca.add({role: 'jobs', cmd: 'stop'}, stopJob)

  function getJobs (data, done) {
    var jobs = seneca.make('jobs')
    jobs.list$({sort$: {enqueued_at: -1}}, function (err, list) {
      if (err) done(null, {})
      else {
        done(null, list.map(function (entry) {
          return {
            id: entry.id,
            data: entry.data
          }
        }))
      }
    })
  }

  function retrieveJob (data, done) {
    var forwarder = senecaForwarder.bind(undefined, 'jobs')
    var jobs = seneca.make('jobs')

    jobs.list$({'status': 'enqueued', sort$: {'enqueued_at': -1}}, function (err, list) {
      if (err) {
        done(null, {})
        return
      } else {
        var job = {}
        if (list.length > 0) {
          job = {
            id: list[0].id,
            data: list[0].data
          }
          forwarder('update', {id: job.id, status: 'started', data: job.data}, function (err, results) {
            if (err) {
              logger.warn('Could not update job: ', job.id)
              job = {}
            }
            done(null, job)
          })
        }
      }
    })
  }

  function updateJob (data, done) {
    var jobs = seneca.make('jobs')
    jobs.load$(data.id, function (err, list) {
      if (err) {
        // couldn't find this job...
        done(null, {})
        return
      } else {
        jobs.status = data.status
        jobs.updated_at = new Date().getTime()
        data.data = data.data
        jobs.save$(function (err, job) {
          if (err) done(err, {})
          else done(null, {id: job.id, status: 'updated'})
        })
      }
    })
  }

  function newJob (data, done) {

    var jobs = seneca.make('jobs')
    jobs.data = data.data
    jobs.status = 'enqueued'
    jobs.enqueued_at = new Date().getTime()

    jobs.save$(function (err, job) {
      if (err) done(err, {})
      else done(null, {id: job.id, status: 'ok'})
    })
  }

  function stopJob (data, done) {
    var jobs = seneca.make('jobs')
    jobs.data = data.data
    jobs.save$(function (err, job) {
      if (err) done(null, {})
      else done(null, {id: data.id, onPostAuth: true, status: 'ready' })
    })
  }
  return 'jobs'
}
