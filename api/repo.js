var npmRegistryClient = require("npm-registry-client")

module.exports = (req, res) => {
  const client = new npmRegistryClient({})
  var uri = `https://registry.npmjs.org/${req.query.reponame}`
  var params = { timeout: 30000 }
  client.get(uri, params, function (error, data, raw, clientRes) {
    return res.send(data)
  })
};
