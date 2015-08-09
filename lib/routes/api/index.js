var droneManagement = require('./droneManagement.js')
var githubEndpoint = require('./githubEndpoint.js')
var jobs = require('./jobs.js')

module.exports = function () {
  return [].concat(droneManagement(), githubEndpoint(), jobs())
}
