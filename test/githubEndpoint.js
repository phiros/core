'use strict'
// post on testing hapi https://medium.com/the-spumko-suite/testing-hapi-services-with-lab-96ac463c490a

var tape = require('tape')
var server = require('../index.js')
var config = require('config')
var pull_request = require('./fixtures/github/pull_request.js')

var apiPrefix = config.apiPrefix
tape('githubEndpoint - handleWebhook - receive pull request', function (t) {
  var options = {
    url: apiPrefix + 'github',
    method: 'POST',
    headers: {
      'X-Github-Event': 'pull_request'
    },
    payload: JSON.stringify(pull_request)
  }
  server.inject(options, function (res) {
    var data = res.result
    t.equal(res.statusCode, 200)
    t.ok(data === null, 'empty response as expected')
    t.end()
  })
})

tape('githubEndpoint - handleWebhook - receive second pull request', function (t) {
  pull_request.pull_request.html_url = 'foo'
  var options = {
    url: apiPrefix + 'github',
    method: 'POST',
    headers: {
      'X-Github-Event': 'pull_request'
    },
    payload: JSON.stringify(pull_request)
  }
  server.inject(options, function (res) {
    var data = res.result
    t.equal(res.statusCode, 200)
    t.ok(data === null, 'empty response as expected')
    t.end()
  })
})

tape('githubEndpoint - handleWebhook - jobs should be enqueued', function (t) {
  var options = {
    url: apiPrefix + 'jobs',
    method: 'GET',
    payload: JSON.stringify(pull_request)
  }
  server.inject(options, function (res) {
    var data = res.result
    t.equal(res.statusCode, 200)
    t.ok(data && Array.isArray(data), 'Data is array')
    t.ok(data.length > 0, 'Data has results')
    t.equal(data[0].data.status, 'enqueued')
    t.equal(data[0].data.source, 'github')
    t.equal(data[0].data.event, 'pull_request')
    t.end()
  })
})

tape('githubEndpoint - handleWebhook - retrieve enqueed job', function (t) {
  var options = {
    url: apiPrefix + 'jobs/retrieve',
    method: 'GET'
  }
  server.inject(options, function (res) {
    var data = res.result
    t.equal(res.statusCode, 200)
    t.equal(data.data.status, 'enqueued')
    t.equal(data.data.source, 'github')
    t.equal(data.data.event, 'pull_request')
    t.end()
  })
})

tape('githubEndpoint - handleWebhook - retrieve second enqueed job', function (t) {
  var options = {
    url: apiPrefix + 'jobs/retrieve',
    method: 'GET'
  }
  server.inject(options, function (res) {
    var data = res.result
    t.equal(res.statusCode, 200)
    t.equal(data.data.trigger.url, 'foo')
    t.equal(data.data.status, 'enqueued')
    t.equal(data.data.source, 'github')
    t.equal(data.data.event, 'pull_request')
    t.end()
  })
})
