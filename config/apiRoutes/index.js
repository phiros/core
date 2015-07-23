require('rootpath')()
var droneManagement = require('config/apiRoutes/droneManagement.js')

module.exports = function (config) {
  console.log(config)
  return [].concat(droneManagement(config))
}
