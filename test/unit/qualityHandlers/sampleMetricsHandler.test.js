const expect = require('chai').expect
const handler = require('../../../src/qualityHandlers/sampleMetricsHandler')
const nock = require('nock')
const path = require('path')

const sampleDataPath = path.join('sample-data', 'sampleParserData.json')
const samplePayload = {
  tenantId: '5ade13625558f2c6688d15ce',
  application: {
    name: 'Sample Plugin App'
  },
  record: {
    pluginType: 'samplePluginHandler',
    dataFormat: 'samplePluginHandler'
  }
}

const sampleOpts = {
  testArtifact: {
    path: path.join(__dirname, '..', '..', '..', sampleDataPath)
  }
}

const expectedMetrics = [
  {
    tenantId: '5ade13625558f2c6688d15ce',
    dataSet: 'Sample Plugin Metrics Dataset',
    application: 'Sample Plugin App',
    record: {
      metricDefinitionId: 'Sample Plugin Metrics Definition',
      recordName: 'Sample Parser Test 1',
      dataFormat: 'samplePluginHandler',
      executionDate: 1589091055363,
      valueType: 'countset',
      value: {
        pass: 1,
        fail: 2
      },
      entries: [
        {
          suite: 'sample-test-1',
          status: 'success'
        },
        {
          suite: 'sample-test-2',
          status: 'failure'
        },
        {
          suite: 'sample-test-3',
          status: 'failure'
        }
      ]
    }
  },
  {
    tenantId: '5ade13625558f2c6688d15ce',
    dataSet: 'Sample Plugin Metrics Dataset',
    application: 'Sample Plugin App',
    record: {
      metricDefinitionId: 'Sample Plugin Metrics Definition',
      recordName: 'Sample Parser Test 2',
      dataFormat: 'samplePluginHandler',
      executionDate: 1589091055562,
      valueType: 'countset',
      value: {
        pass: 1,
        fail: 0
      },
      entries: [
        {
          suite: 'sample-test-1',
          status: 'success'
        }
      ]
    }
  }
]

describe('sampleMetricsHandler', () => {
  after(() => {
    nock.restore()
  })
  it('passes payload to application API', async () => {
    const result = await handler.execute(samplePayload, sampleOpts)
    expect(result).to.deep.equal(expectedMetrics)
  })
})
