# Tekton Plugin

This plugin provides integration between UC Velocity and Tekton CI pipelines deployed on Kubernetes or Openshift. It collects the data about PipelineRuns and uploads it to UC Velocity,

- [Building the Tekton Plugin](#building-the-tekton-plugin)
  * [Prerequisites](#prerequisites)
  * [Docker Buildkit](#docker-buildkit)
  * [How to build the code](#how-to-build-the-code)
    - [Debugging the plugin build](#debugging-the-plugin-build)
- [Installing the Tekton Plugin](#installing-the-tekton-plugin)
- [Configuring the Tekton Plugin](#configuring-the-tekton-plugin)
- [Running the Tekton Plugin](#running-the-tekton-plugin)

## Building the Tekton Plugin
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
Once you have cloned the Tekton plugin code into a directory, you can build the plugin by executing the following command:
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

## Installing the Tekton Plugin
After the plugin is built and a plugin image is successfully created, you can install the plugin through the UI.
* Navigate to the `<velocity-url>/settings/integrations` page and select the `Plugins` tab.
* Click the `Load Plugin` button near the top of the page, and enter in your image and tag, in the format `<image>:<tag>`.
* Select `Submit` and the plugin will be installed into UrbanCode Velocity. You will then see the `Tekton Plugin` in the list of plugins.

## Configuring the Tekton Plugin
After the plugin has been built and installed into the server, you can now add an integration of that plugin type.

* Navigate to the `<velocity-url>/settings/integrations` page and select the `Plugins` tab.
* If the plugin is installed you will see the `Tekton Plugin` in the list of plugins.
* Click `Add Integration`.

Each property will display a description when you hover over the information icon.

## Running the Tekton Plugin
The Tekton plugin defines scheduled events interface that collect information about Tekton's PipelineRuns in a scheduled manner.

Here are a few general tips to help you while running the Tekton plugin code:
* You can use the hidden DEBUG option to view the full structure of data being sent into UrbanCode Velocity.
    * While creating your integration or editing your integration, select the `Show Hidden Properties` checkbox at the bottom of the dialog and select `DEBUG` from the `Logging Level` dropdown.
    * After this option is configured, when the integration is executed you will now see a print out of all of the data being synced into UrbanCode Velocity.
    * This option provides a good demonstration of how UrbanCode Velocity sees the incoming data, and it is a great way to debug any potential errors with your plugin.
* The following properties needs to be defined for integration:
   * Kubernetes API URL - This is the URL to Kubernetes or Openshift API through which the plugin will collect all information about PipelineRuns
   * Kubernetes API Token - This is the Bearer token for authenticating to Kubernetes API. Usually you can create a ServiceAccount and input its token here. The ServiceAccount needs proper RBAC policy to be able to read the required PipelineRun object in Kubernetes.
   * Label for identifying application name - this is a label name on PipelineRun object which contains application name. Tekton usually generates label `tekton.dev/pipeline` automatically which hold the name of the Pipeline object.
   * Namespace where the builds are running - namespace or Openshift project where the plugin looks for PipelineRun objects. If you want to monitor multiple namespaces for PipelineRuns, one Integration for each is required.
