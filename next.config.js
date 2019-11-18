const withCSS = require('@zeit/next-css')
module.exports = withCSS()

module.exports = withCSS({
  target: 'serverless'
})
