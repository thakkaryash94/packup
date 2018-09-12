const express = require('express')
const next = require('next')

var npmRegistryClient = require("npm-registry-client")

var client = new npmRegistryClient({})

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express()

    server.get('/', (req, res) => {
      return app.render(req, res, '/', req.query)
    })

    server.get('/api/repo', (req, res) => {
      var uri = `https://registry.npmjs.org/${req.query.reponame}`
      var params = { timeout: 30000 }
      client.get(uri, params, function (error, data, raw, clientRes) {
        return res.send(data)
      })
    })

    server.get('/about', (req, res) => {
      return app.render(req, res, '/about', req.query)
    })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
