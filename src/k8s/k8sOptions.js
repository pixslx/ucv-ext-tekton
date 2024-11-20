
export function createKubeConfigOptions(apiURL, apiToken ){
  return {
    clusters: [{
      name: "cluster",
      server: apiURL,
      skipTLSVerify: true
    }],
    contexts: [{
      cluster: "cluster",
      name: "ctx",
      user: "user"
    }],
    users: [{
      name: "user",
      token: apiToken
    }],
    currentContext: "ctx"
  }
}