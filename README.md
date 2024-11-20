# Sample Template Plugin

This template serves as an example of how to write a NodeJS plugin for UrbanCode Velocity. The sample plugin code provides examples for importing issues, builds, and metrics into UrbanCode Velocity. The files in this sample plugin are documented with comments that explain each line of code in detail. The sample plugin code can be used as a hands on example, demonstrating how to define properties, plugin interfaces, how to interact with the GraphQL API, and how the plugin and data are displayed in the UI.

- [Building the Sample Plugin](#building-the-sample-plugin)
  * [Prerequisites](#prerequisites)
  * [Docker Buildkit](#docker-buildkit)
  * [How to build the code](#how-to-build-the-code)
    - [Debugging the plugin build](#debugging-the-plugin-build)
- [Installing the Sample Plugin](#installing-the-sample-plugin)
- [Configuring the Sample Plugin](#configuring-the-sample-plugin)
- [Running the Sample Plugin](#running-the-sample-plugin)
- [Plugin Structure](#plugin-structure)
- [Interfaces](#interfaces)
  * [Endpoints](#endpoints)
  * [The Sample Plugin Endpoints](#the-sample-plugin-endpoints)
    + [Running the sample plugin endpoints](#running-the-sample-plugin-endpoints)
      - [Sample Metric Upload Endpoint](#sample-metric-upload-endpoint)
  * [Quality Handlers](#quality-handlers)
    + [What a QualityHandler Does](#what-a-qualityhandler-does)
    + [QualityHandler exports](#qualityhandler-exports)
    + [Payload](#payload)
    + [Async Await](#async-await)
    + [Async Await with array](#async-await-with-array)
    + [Async Await with custom error handling](#async-await-with-custom-error-handling)
  * [The Sample Plugin Quality Handler](#the-sample-plugin-quality-handler)
    + [Running the sample quality handler](#running-the-sample-quality-handler)
  * [Scheduled Events](#scheduled-events)
  * [The Sample Plugin Scheduled Events](#the-sample-plugin-scheduled-events)
    + [Running the sample scheduled events](#running-the-sample-scheduled-events)
  * [Task Definitions](#task-definitions)
  * [Event Triggers](#event-triggers)
  * [Properties](#properties)
- [Pipeline Definition](#pipeline-definition)

## Building the Sample Plugin
### Prerequisites
1. [Node.js](https://nodejs.org/) (version 12 or greater)
1. [NPM](https://www.npmjs.com/) (version 6 or greater)
1. [Docker](https://www.docker.com/) (latest version available on your platform)

### Docker BuildKit
Beginning with Docker 2.4.0.0, Docker has enabled their "BuildKit" feature by default. This feature is meant to enable faster builds with more caching capabilities. However, the template plugin currently does not support this feature.
* If you are running Docker 2.4.0.0 or greater, you will need to disable the BuildKit feature.
* Docker provides excellent documentation for enabling and disabling the feature: [Build images with Buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/)
* As per the documentation the `DOCKER_BUILDKIT=0` environment variable will disable the BuildKit in your current terminal, and you can permanently disable it for your Docker daemon by editing its configuration with the `"buildkit": false` feature flag.
### How to build the code
Once you have extracted the sample template into a directory, you can build the plugin by executing the following command:
* `docker build . -t <image>:<tag>`
    * The docker build will execute the necessary commands to build the plugin code and create an image.

#### Debugging the plugin build
If you're having troubles building your plugin code, it can help determine the problem by replicating some of the commands locally that the docker build is running. Here are a few commands, to be executed in order, that may help you debug a failing build or a failing plugin install:
* `npm install`
    * Running this command will execute a `preinstall` script beforehand that goes through and installs all of the dependencies in the `local-dependencies` directory.
    * The local dependencies will show up in the `node_modules/@velocity` directory when they are successfully installed.
* `npm run dist-runnable`
    * This command will build and minify the plugin code so that it can be executed in a docker container.
    * After this command succeeds you will find two files in your `dist-runnable` directory. One with a `.min.js` extension and the other with a `.min.js.map` extension.
* `node dist-runnable/ucv-ext-sdk-template-runnable.min.js -- getManifest`
    * If the `dist-runnable` command was executed successfully, the next thing you'll want to try is getting the manifest of your plugin.
    * When a plugin is installed into UrbanCode Velocity, the server will get its manifest and save it in the database. This manifest consists of the image, all of the properties, and the interfaces defined in your plugin.
    * This command will provide more useful error output when it fails than when you try to install a faulty plugin into UrbanCode Velocity.

## Installing the Sample Plugin
After the plugin is built and a plugin image is successfully created, you can install the plugin through the UI.
* Navigate to the `<velocity-url>/settings/integrations` page and select the `Plugins` tab.
* Click the `Load Plugin` button near the top of the page, and enter in your image and tag, in the format `<image>:<tag>`.
* Select `Submit` and the plugin will be installed into UrbanCode Velocity. You will then see the `Sample Template Plugin` in the list of plugins.

## Configuring the Sample Plugin
After the plugin has been built and installed into the server, you can now add an integration of that plugin type.

* Navigate to the `<velocity-url>/settings/integrations` page and select the `Plugins` tab.
* If the plugin is installed you will see the `Sample Template Plugin` in the list of plugins.
* Click `Add Integration`.

Each property will display a description when you hover over the information icon.

By default, sample data will not be uploaded when the plugin is executed. To upload sample data, you will need to check the `Upload Sample Data` checkbox. When selecting this option you will need to provide a `UrbanCode Velocity Access Key`.

## Running the Sample Plugin
The sample plugin defines different types of interfaces (scheduled events, endpoints, and quality handlers (AKA parsers)) that each function in a different manner. How each of these interfaces are executed is explained under their corresponding sub-section in the [Interfaces](#interfaces) section.

Full details are provided for executing each sample plugin interface later in this document, but here are a few general tips to help you while running the sample plugin code:
* You can use the hidden DEBUG option to view the full structure of data being sent into UrbanCode Velocity.
    * While creating your integration or editing your integration, select the `Show Hidden Properties` checkbox at the bottom of the dialog and select `DEBUG` from the `Logging Level` dropdown.
    * After this option is configured, when the integration is executed you will now see a print out of all of the data being synced into UrbanCode Velocity.
    * This option provides a good demonstration of how UrbanCode Velocity sees the incoming data, and it is a great way to debug any potential errors with your plugin.
* The plugin will not sync sample data by default.
    * The configuration of this plugin includes a checkbox titled `Upload Sample Data`. Only when this box is checked will the sample issues, builds, or metrics be uploaded into UrbanCode Velocity.
    * As explained later in this document, `Quality Handlers (parsers)` behave independent of any integration or integration properties. For this reason the `Upload Sample Data` property on the plugin does not have any effect on the `Quality Handler`. Quality handlers cannot be configured int this way, therefore the sample data will always be synced when the sample quality handler is executed. Please see the [The Sample Plugin Quality Handler](#the-sample-plugin-quality-handler) section for more information.

## Plugin Structure

These plugins are simple packages that expose modules that follow simple interfaces. This is done by exposing all of your implementations in the `index.js` file as seen here:

```
module.exports = {
  properties: [
    {
      label: 'URL',
      name: 'Url',
      type: 'String',
      description: 'This is a url (optional),
      required: true,
      defaultValue: 'https://fake:99999/fake (optional)'
    }
  ],
  endpoints: [sampleEndpoint, secondEndpoint],
  scheduledEvents: [simpleScheduledEvent],
  taskDefinitions: [],
  eventTriggers: [],
  qualityHandlers: [ normalizedEnricher ],
  displayName: "Sample Template for Plugins",
  pluginId: "templatePlugin",
  description: "This is a template for basic npm plugin packages for UrbanCode Velocity"
};
```
Please see the [index.js](/src/index.js) file of the sample plugin code for a full example.

## Interfaces

### Endpoints

These are modules that will expose a REST endpoint on the Reporting Consumer. This can be used for callbacks from various tools. Endpoints should throw any errors as they will be handled by whatever invokes the plugin. Each endpoint is a module that looks like this:

```
function handleEndpoint(body, opts) {
  try {
    // do some logic
  } catch (e) {
    // log e if necessary
    throw e
  }
}

module.exports = {
  execute: handleEndpoint,
  name: "Sample Endpoint",
  path: "sampleEndpoint",
  method: "GET"
};
```

Methods are GET, POST, PUT, or DELETE. The path is the path for the endpoint. Currently, an integration is required for the endpoint to be served; as a result the URL for the endpoint will be like this:

```
http://<UCV Reporting Consumer>/pluginEndpoint/<Integration ID>/<path field exposed by the endpoint>
```

### The Sample Plugin Endpoints
For full examples of plugin endpoints please see either of the two files:
* [sampleMetricsEndpoint.js](/src/endpoints/sampleMetricsEndpoint.js)
    * This endpoint provides a full example of syncing metrics into UrbanCode Velocity.
* [secondSampleEndpoint.js](/src/endpoints/secondSampleEndpoint.js)
    * This endpoint provides a much more simple example, and only serves to show how to define a plugin with multiple endpoints.

#### Running the sample plugin endpoints
To be able to run an endpoint you must first create an integration using the plugin. Please see the [Configuring the Sample Plugin](#configuring-the-sample-plugin) section.

Endpoints can be executed by sending HTTP requests to the provided endpoint path. You can view full details of a plugin endpoint, including the path and method, by navigating to the Integrations tab on the `<velocity-url>/settings/integrations` page and clicking the details arrow to the left of the integration.


##### Sample Metric Upload Endpoint
The endpoint defined in the [sampleMetricsEndpoint.js](/src/endpoints/sampleMetricsEndpoint.js) file can be executed by sending an HTTP POST request to `<velocity-url>/reporting-consumer/pluginEndpoint/<integration-id>/sampleMetricUploadPath`. This sample endpoint doesn't expect any specific fields to be specified in the request body. Instead you can pass any valid JSON and it will print it out for demonstrative purposes.

An example curl request:<br>
`curl --insecure --request POST --data '{"prop1":"val1", "prop2":"val2"}' --url https://localhost/reporting-consumer/pluginEndpoint/5ecd609c5bdd70f19bf32bc3/sampleMetricUploadPath`

This endpoint will upload sample data if the `Upload Sample Data` option is checked and the `UrbanCode Access Key` is defined on the integration as well.

### Quality Handlers

#### What a QualityHandler Does

1. POST --form data (with or without file) -> /reporting-consumer/qualityData
1. reporting consumer validates the payload using joi, see routes/qualityData
1. optionally, the plugin validates its own additionalOptions as with junit
1. reporting consumer executes the plugin, which means resolving a promise that parses the file and returns either a single result or n array of results. in the case of normalized (aka no files, just raw data), nothing happens (open re-api PR will fix this, and no form post yay!)
    1. usually, a qualityHandler with multiple parsers will dispatch different parsers based on `dataFormat`
1. the plugin then resolves the promise to reporting consumer
1. reporting consumer POSTS the data either singularly or in parallel if its an array, to prevent duplicate ad-hoc app condition


These are the enrichers used for the specific purpose of handling incoming quality data from various tools. This is a fairly narrowly scoped functionality and should be used strictly by the Ingest endpoint on the UCV Reporting Consumer.

They expect a function that returns a promise, with either a single quality data record or an array of quality data records that ensure metadata is mapped properly. Rejection handles with a 500 error for the HTTP endpoint.

```js
function handleQualityData(payload, opts) {
  return new Promise((resolve, reject)  => file.parse(opts.testArtifact.file)
    .then(value => resolve({
      metricName: "Example Metric",
      record: {
        recordName: `Example Metric - ${Date.toTimeString()}`,
        category: 'EXAMPLE_METRIC_TYPE',
        value,
        valueType: 'percent',
        dataFormat: 'exampleXml',
        pluginType: 'exampleMetric'
      }
    }))
    .catch(reject)
  )
}

module.exports = {
  execute: handleQualityData,
  name: "Example Quality Data",
  getOptionsSchema: ({ Joi, options, payload }) => ({ additionalOption: Joi.boolean().default(true) })
  description: "This handles a simple json doc that will be handed to the Application API",
  type: "exampleMetric"
};
```

#### QualityHandler exports

**`getOptionsSchema`**: is an optional function that returns a `Joi` object to validate extra `options` to be passed by your plugin. The returned result is wrapped in `Joi.object.keys()`, and validated against `payload.options`. `payload.options` is not required by your plugin consumers
**`type`** : `record.pluginType` is used to map to this value in the payload.
**`execute`**: is the function

#### Payload

These are the values that a plugin cares about and should pass on. The rest of the valid metadata your plugin users specify is passed on transparently:

```js
return {
  // required: Used to map metrics to a tenant
  tenantId: '5ade13625558f2c6688d15ce',
  // required: Metrics are mapped to applications
  application: {
    // Either the name or id must be specified
    name: "My Application",
    // Either the name or the id must be specified
    id: "my-id"
  },
  //optional:  Used for dots display, other displays
  metricName: 'Example Metric',
  // record object is meant to specify per-object values
  record: {
    // optional: used for dots display
    recordName: `Example Metric - ${Date.toTimeString()}`,
    // required: Maps to translated messages for UI
    category: 'EXAMPLE_METRIC_TYPE',
    // required: { key: value, key2: value } dictionary, the pattern of keys are specified by `valueType`
    value: {
      numerator: 123,
      denominator: 123
    },
    // required: value's keys are driven by this value, which also leads to
    // different mongo aggregation pipelines and formatting
    valueType: 'percent',
    // required: data format and filetype is ideally specified, otherwise `${pluginType}Default`
    dataFormat: 'exampleXml',
    // optional: pluginHandler.type - this is your specified handler.type by default
    // (indicated by pluginType in payload)
    pluginType: 'exampleMetric'
  }
}
```

#### Async Await

This is the equivalent using async/await, and works in node natively, and because exceptions are handled upstream, this would work fine:

```js
async function handleQualityData(payload, opts) {
  const value = await file.parse(opts.testArtifact.file)
  return {
    tenantId: '5ade13625558f2c6688d15ce',
    application: {
      name: 'My Application'
    },
    metricName: 'Example Metric',
    record: {
      recordName: `Example Metric - ${Date.toTimeString()}`,
      category: 'EXAMPLE_METRIC_TYPE',
      value,
      valueType: 'percent',
      dataFormat: 'exampleXml',
      pluginType: 'exampleMetric'
    }
  }
}
```

#### Async Await with array

an async function that returns an array is handy when you expect multiple values.
this pattern demonstrates a way of dispatching different categories for each value,
a common pattern thusfar - but not a required one.

```js
const METRIC_TYPES = {
  example: 'EXAMPLE_METRIC_TYPE',
  anotherExample: 'ANOTHER_EXAMPLE_METRIC_TYPE'
}
// `parsedData.value`, and thus `doc.record.value` looks like:
// { numerator: 1, denominator: 2 }
// automatic normalizedValue after sending to graphql will be:
// [{ key: "numerator", value: 1 }, { key: "denominator", value: 2 }]
function formatMetricData(parsedData) {
  return {
    tenantId: '5ade13625558f2c6688d15ce',
    application: {
      name: 'My Application'
    },
    metricName: 'Example Metric',
    record: {
      recordName: `Example Metric (${parsedData.metricType}) - ${Date.toTimeString()}`,
      category: METRIC_TYPES[parsedData.metricType],
      value: parsedData.value,
      valueType: 'percent',
      dataFormat: 'exampleXml',
      pluginType: 'exampleMetric'
    }
  }
}
/**
 * Returns an array of formated values
 * */
async function handleQualityData(payload, opts) {
  const values = await file.parse(opts.testArtifact.file)
  return values.map(formatMetricData)
}
```

#### Async Await with custom error handling

and if you want custom error handling, this will return a 400 and log the message you throw:

```js

async function handleQualityData(payload, opts) {
  let parser
  try {
    parser = myParsers[payload.dataFormat].getParser(opts)
  }
  catch(err) {
    throw Error('Parser not found')
  }
  try {
    const value = await parser.parse(opts.testArtifact.file)
    return {
      tenantId: '5ade13625558f2c6688d15ce',
      application: {
        name: 'My Application'
      },
      metricName: "Example Metric",
      record: {
        category: 'EXAMPLE_METRIC_TYPE',
        value,
        valueType: 'percent',
        dataFormat: 'exampleXml',
        pluginType: 'exampleMetric'
      }
    }
  }
  catch(err) {
      throw Error(`Error parsing file ${opts.testArtifact.filename}`)
  }
}
```
### The Sample Plugin Quality Handler
The following quality handler file provides a full example of implementing a quality handler:
* [sampleMetricsHandler.js](/src/qualityHandlers/sampleMetricsHandler.js)
    * This quality handler uploads sample metrics to UrbanCode Velocity when executed.
#### Running the sample quality handler
Quality handlers defined in a plugin do not require that an integration is created before they can be executed. Once the plugin is installed, the quality handler can be executed, please see the section [Installing the Sample Plugin](#installing-the-sample-plugin).

All quality handlers are executed using the same HTTP endpoint in UrbanCode Velocity:
`<velocity-server>/reporting-consumer/metrics`. When that endpoint is hit, the plugin quality handler that will be executed depends on the `pluginType` field specified in the payload sent with the request.

Quality handler endpoints expect two separate forms to be sent in an HTTP POST request. The first form contains the payload, and the second form contains the file to be parsed. A full explanation of these two forms can be found in the [sampleMetricsHandler.js](/src/qualityHandlers/sampleMetricsHandler.js) file.

An example curl request to execute the sample metrics handler:<br>
```
curl
--request POST
--url <velocity-url>/reporting-consumer/metrics
--form 'payload={
  "tenant_id": "5ade13625558f2c6688d15ce",
  "application": {
    "name": "Sample Plugin App"
  }
  "record": {
    "pluginType": "samplePluginHandler",
    "dataFormat": "samplePluginHandler"
  }
}'
--form 'testArtifact=@sample-data/sampleParserData.json
```
* The `sample-data.json` file is provided along with the template in the `sample-data` directory.
* This file demonstrates how quality handlers parse test artifacts to create metrics in UrbanCode Velocity.

For a full example and description please see the [sampleMetricsHandler.js](/src/qualityHandlers/sampleMetricsHandler.js) file.

### Scheduled Events

These are events set to run on a specific interval.  Scheduled events should throw errors so integrations using the plugin can be marked as failing if there is a problem gathering data.

```js
function execute() {
  try {
    console.log('do some work here')
  } catch (e) {
    throw e
  }
}

module.exports = {
    execute: execute,
    name: 'distinct name required',
    description: 'this is a simple schedule event that logs every 5 minutes',
    interval: 5
}
```

### The Sample Plugin Scheduled Events
For full examples of scheduled events please see either of the two files in the sample plugin code:
* [sampleIssuesEvent.js](/src/scheduledEvents/sampleIssuesEvent.js)
    * This scheduled event provides an example of syncing issues into UrbanCode Velocity.
* [sampleBuildsEvent.js](/src/scheduledEvents/sampleBuildsEvent.js)
    * This scheduled event provides an example of syncing builds into UrbanCode Velocity.

#### Running the sample scheduled events
In order to execute scheduled events you must create an integration using the plugin that defines the events. Please see the [Configuring the Sample Plugin](#configuring-the-sample-plugin) section for more information.

Once an integration is created all scheduled events defined in the plugin will execute on a timed interval. The interval is defined in minutes in the scheduled event object exported from the scheduled event file. For example: [sampleIssuesEvent.js](/src/scheduledEvents/sampleIssuesEvent.js).

### Task Definitions

**Still to come...**

### Event Triggers

**Still to come...**

### Properties

These are integration specific properties needed for the integration to run. Examples of properties might be the integrations location, a username to use with the integration or a password to use with the integration

A property could be defined as shown below:

```
{
    label: 'URL',
    name: 'Url',
    type: 'String',
    description: 'This is a url (optional),
    required: true,
    defaultValue: 'https://fake:99999/fake (optional)'
}
```
You can see full examples for defining plugin properties in the [index.js](/src/index.js) file of the sample plugin code.

## Pipeline Definition

Plugins can also be used to sync data for running processes from an UrbanCode Velocity pipeline. These processes need to be synced from the plugin, and this can be done using a scheduled event (see the [Scheduled Events](#scheduled-events) section for more information). Note that the sample plugin doesn't yet provide an example for syncing processes

For a plugin that syncs processes into UCV, it may also be necessary to sync the context in which that process will be executed. This context comes in the form of applications, environments, or versions. Again, you will need to utilize scheduled events to sync these entities into UCV.

While configuring a pipeline, the dialog options will change based on which of the above context entities a plugin is importing. If a plugin imports applications, environments, and versions, dialogs will be displayed to select these imported entities.

This dynamic pipeline configuration is based on the plugin's `pipelineDefinition` field. Let's take a look at an example:

```
pipelineDefinition: {
  importsApplications: false,
  importsVersions: false,
  importsEnvironments: false
}
```

The above `pipelineDefinition` will tell us that when configuring your pipeline with processes from this plugin, there are no applications, environments, or versions necessary. So, to configure the pipeline to run a process the only thing you need to select is just that, a process.

However, for a tool that imports all of the context entities for a process to run, we may want a `pipelineDefinition` such as the following:

```
pipelineDefinition: {
  importsApplications: true,
  importsVersions: true,
  importsEnvironments: true
}
```

Note that not all plugins will have a `pipelineDefinition`. This field is only necessary for configuring processes in a pipeline. If your plugin is not going to be running any processes, then it should not have a `pipelineDefinition`. The plugin will only be configurable in a pipeline if this field is specified.

Take a look at the `pipelineDefinition` configured in the [index.js](/src/index.js) file for information on how to add this information into your own plugin.