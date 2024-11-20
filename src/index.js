import tektonPipelinesEvent from './scheduledEvents/tektonPipelinesEvent'

export default {
  properties: [
    {
      name: 'k8sAPI',
      label: 'Kubernetes API URL',
      type: 'String',
      description: 'URL to Kubernetes API endpoint.',
      required: true
    },
    {
      name: 'k8sAPIToken',
      label: 'Kubernetes API Token',
      type: 'Secure',
      description: 'Token for authenticating against Kubernetes API.',
      required: true
    },
    {
      name: 'appLabel',
      label: 'Label for identifying application name',
      type: 'String',
      description: 'Label on PipelineRun object which contains application name.',
      required: true
    },
    {
      name: 'namespace',
      label: 'Namespace where the builds are running',
      type: 'String',
      description: 'Namespace where the builds are running.',
      required: true
    }
  ],
  endpoints: [],
  scheduledEvents: [tektonPipelinesEvent],
  taskDefinitions: [],
  eventTriggers: [],
  qualityHandlers: [],
  displayName: 'Tekton Plugin',
  pluginId: 'ucv-ext-tekton',
  description: 'This is a plugin for Tekton pipelines for UrbanCode Velocity.',
  features: {
    deltaTimeSync: true
  },
  pipelineDefinition: {
    importsApplications: false,
    importsVersions: false,
    importsEnvironments: false
  }  
}
