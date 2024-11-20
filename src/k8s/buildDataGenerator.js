const CREATION_DATE = 1589091055363

export default class BuildDataGenerator {
  static async initialize (integrationId, tenantId, appLabel) {
    if (!this.integrationId && !this.tenantId && !this.appLabel) {
      this.integrationId = integrationId
      this.tenantId = tenantId
      this.appLabel = appLabel
    }
  }

  static translateStatus(tektonStatus) {
    switch (tektonStatus) {
      case "Started":
        return "start"
      case "Running":
        return "in_progress"
      case "Cancelled":
        return "failure"
      case "Succeeded":
        return "success"
      case "Completed":
        return "success"
      case "Failed":
        return "failure"
      case "PipelineRunTimeout":
        return "failure"
      case "CreateRunFailed":
        return "failure"
      default:
        return "in_progress"
    }
  }

  static getStepsData (taskRun) {
    return {
      name: taskRun.name,
      status: this.translateStatus(taskRun.body.status.conditions[0].reason),
      message: taskRun.body.status.conditions[0].message,
      isFatal: false
    }
  }

  static getBuildData (pipelineRun) {
    return {
      id: pipelineRun.metadata.name,
      tenantId: this.tenantId,
      name: pipelineRun.metadata.name,
      versionName: pipelineRun.metadata.name,
      status: this.translateStatus(pipelineRun.status.conditions[0].reason),
      application: {
        name: pipelineRun.metadata.labels[this.appLabel],
        integration_id: this.integrationId
      },
      url: "",
      startTime: pipelineRun.metadata.creationTimestamp,
      endTime: pipelineRun.status.completionTime,
      requestor: pipelineRun.metadata.annotations["pipeline.openshift.io/started-by"],
      revision: "",
      labels: ['tekton-plugin', 'pipelinerun'],
      source: "TEKTON-PLUGIN",
      branch: "",
      steps: []
    }
  }
}
