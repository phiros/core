require('rootpath')()
var droneManagement = require('config/apiRoutes/droneManagement.js')

module.exports = function () {
  return [].concat(droneManagement())
}
