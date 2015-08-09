module.exports = function (options) {
  var seneca = this
  seneca.use('lib/microservices/droneManagement')
  seneca.use('lib/microservices/githubInterface')
  seneca.use('lib/microservices/jobs')
  return 'microservices'
}
