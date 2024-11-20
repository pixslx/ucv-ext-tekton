import log4js from '@velocity/logger'
import UCVClient from '../api/ucvClient'
import BuildDataGenerator from '../k8s/buildDataGenerator';
import { createKubeConfigOptions } from '../k8s/k8sOptions'

const LOGGER = log4js.getLogger('TektonPipelines')
const k8s = require('@kubernetes/client-node');
const TEKTON_GROUP = "tekton.dev"
const TEKTON_VERSION = "v1"
const TEKTON_PIPELINERUN_PLURAL = "pipelineruns"
const TEKTON_TASKRUN_PLURAL = "taskruns"

async function execute (state, properties) {
  LOGGER.debug(`Starting execute`)
  LOGGER.debug(`State: ${JSON.stringify(state)}`)
  LOGGER.debug(`Properties: ${JSON.stringify(properties)}`)

  LOGGER.info('Tekton PipelineRuns build data will be uploaded to UrbanCode Velocity.')

  const kc = new k8s.KubeConfig()
  kc.loadFromOptions(createKubeConfigOptions(properties.k8sAPI, properties.k8sAPIToken))
  const k8sClient = kc.makeApiClient(k8s.CustomObjectsApi)

  const pipelineRuns = await k8sClient.listNamespacedCustomObject(TEKTON_GROUP, TEKTON_VERSION, properties.namespace, TEKTON_PIPELINERUN_PLURAL)
  LOGGER.debug(`K8s client response from list pipelineruns: ${JSON.stringify(pipelineRuns)}`)
  UCVClient.initialize(process.env.GRAPHQL_URL, process.env.BEARER_TOKEN)
  BuildDataGenerator.initialize(state.trackerId, state.tenantId, properties.appLabel)
  var buildDataArray = []
  for (const pipelineRun of pipelineRuns.body.items) {
    LOGGER.debug(`Starting to process pipelinerun ${pipelineRun.metadata.name}`)

    var buildData = BuildDataGenerator.getBuildData(pipelineRun)
    for (const task of pipelineRun.status.childReferences) {
      LOGGER.debug(`Starting to process taskrun ${task.name}`)
      const taskRun = await k8sClient.getNamespacedCustomObject(TEKTON_GROUP, TEKTON_VERSION, properties.namespace, TEKTON_TASKRUN_PLURAL, task.name)
      LOGGER.debug(`K8s client response from get taskrun: ${JSON.stringify(taskRun)}`)
      buildData.steps.push(BuildDataGenerator.getStepsData(taskRun))
    }
    buildDataArray.push(buildData)
  };

  LOGGER.info(`Resulting build data for upload to UCV is ${JSON.stringify(buildDataArray)}`)  
  await UCVClient.uploadBuildBulk(buildDataArray)
  LOGGER.info('Tekton PipelineRuns uploaded successfully.')
}

export default {
  execute: execute,
  name: 'TektonPipelinesUploadEvent',
  description: 'This is a timed event that uploads Tekton PipelineRuns.',
  interval: 5
}
