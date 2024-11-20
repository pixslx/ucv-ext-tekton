import { VelocityApi } from '@velocity/api-client'
import log4js from '@velocity/logger'

const LOGGER = log4js.getLogger('UCVClient')

export default class UCVClient {
  static async initialize (serverUrl, securityToken) {
    if (!this.binding) {
      LOGGER.info('Initializing Velocity API Client for the template integration.')
      try {
        this.binding = new VelocityApi(serverUrl, securityToken, { insecure: true, useBearerToken: true })
      } catch (error) {
        LOGGER.error(error)
        throw error
      }
    }
  }

  static async uploadIssues (issueDataIn) {
    LOGGER.debug(`Issue sync data: ${JSON.stringify(issueDataIn)}`)
    try {
      const result = await this.binding.mutation.uploadIssueData({ data: issueDataIn })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadPullRequests (pullRequestDataIn) {
    LOGGER.debug(`Pull Request sync data: ${JSON.stringify(pullRequestDataIn)}`)

    try {
      const result = await this.binding.mutation.uploadPullRequests({ data: pullRequestDataIn })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadCommits (commitDataIn) {
    LOGGER.debug(`Commit sync data: ${JSON.stringify(commitDataIn)}`)

    try {
      const result = await this.binding.mutation.uploadCommits({ data: commitDataIn })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadBuild (buildDataIn) {
    LOGGER.debug(`Build sync data: ${JSON.stringify(buildDataIn)}`)

    try {
      const result = await this.binding.mutation.uploadBuildData({ data: buildDataIn })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadBuildBulk (buildArrayDataIn) {
    LOGGER.debug(`Build sync data: ${JSON.stringify(buildArrayDataIn)}`)

    try {
      const result = await this.binding.mutation.uploadBuildDataBulk({ data: buildArrayDataIn })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async createMetricDefinition (metricDefinitionId, tenantId) {
    try {
      const metricDefinition = {
        id: metricDefinitionId,
        name: metricDefinitionId,
        category: 'quality',
        tenantId: tenantId
      }
      LOGGER.debug(`Creating metric definition with the following input: ${JSON.stringify(metricDefinition)}.`)
      await this.binding.mutation.createMetricDefinition({ input: metricDefinition })
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async doesMetricDefinitionExist (metricDefinitionId, tenantId) {
    const queryArgs = {
      id: metricDefinitionId,
      tenantId: tenantId
    }

    LOGGER.debug(`Running metricDefinition query with query arguments ${JSON.stringify(queryArgs)}`)
    try {
      const metricDefinition = await this.binding.query.metricDefinition({ query: queryArgs })
      LOGGER.debug(`Metric definition found: ${JSON.stringify(metricDefinition)}`)
    } catch (error) {
      LOGGER.debug('No metric definition found.')
      return false
    }

    return true
  }

  static async uploadMetrics (metricDataIn) {
    LOGGER.debug(`Metric sync data: ${JSON.stringify(metricDataIn)}.`)
    try {
      await this.binding.mutation.uploadMetrics({ data: metricDataIn })
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }

  static async uploadProperties (integrationId, eventName, properties) {
    try {
      const result = await this.binding.mutation.updateIntegrationState({ integrationId, eventName, properties })
      return result
    } catch (error) {
      LOGGER.error(error)
      throw error
    }
  }
}
