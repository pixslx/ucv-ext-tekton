
var expect = require('chai').expect
let plugin = require('../../src/index')

describe('Validate Plugin Endpoints', function () {
  it('Each endpoint should have the required fields', function (done) {
    plugin.endpoints.forEach(endpoint => {
      expect(endpoint.name).to.be.a('string')
      expect(endpoint.method).to.be.a('string')
      expect(endpoint.execute).to.be.a('function')
      expect(endpoint.path).to.be.a('string')
      expect(endpoint.path).to.not.have.string(' ')
      expect(endpoint.path).to.not.have.string('<')
      expect(endpoint.path).to.not.have.string('>')
      expect(endpoint.path).to.not.have.string('#')
      expect(endpoint.path).to.not.have.string('%')
      expect(endpoint.path).to.not.have.string('{')
      expect(endpoint.path).to.not.have.string('}')
      expect(endpoint.path).to.not.have.string('|')
      expect(endpoint.path).to.not.have.string('\\')
      expect(endpoint.path).to.not.have.string('^')
      expect(endpoint.path).to.not.have.string('~')
      expect(endpoint.path).to.not.have.string('[')
      expect(endpoint.path).to.not.have.string(']')
      expect(endpoint.path).to.not.have.string('`')
      expect(endpoint.path).to.not.have.string('?')
      expect(endpoint.path).to.not.have.string(';')
      expect(endpoint.path).to.not.have.string('@')
      expect(endpoint.path).to.not.have.string('=')
      expect(endpoint.path).to.not.have.string('&')

      expect(['GET', 'PUT', 'POST', 'DELETE']).to.include(endpoint.method.toUpperCase())
    })

    done()
  })
})

describe('Validate Plugin Quality Handlers', function () {
  it('Each quality handler should have the required fields', function (done) {
    plugin.qualityHandlers.forEach(qualityHandler => {
      expect(qualityHandler.name).to.be.a('string')
      expect(qualityHandler.description).to.be.a('string')
      expect(typeof qualityHandler.execute).to.equal('function')
      expect(qualityHandler.type).to.be.a('string')
      expect(qualityHandler.type).to.not.have.string(' ')
    })

    done()
  })
})
