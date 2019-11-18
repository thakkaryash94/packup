import React, { Component } from 'react'
import axios from 'axios'
import copy from 'copy-to-clipboard'
import semver from 'semver'
import Layout from '../components/layout'
import { Text, TextInput, Heading, Button, Box, Grid } from '@primer/components'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isModalVisible: true,
      value:
        `{
  "name": "package-updater",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@babel/core": "^7.0.0-beta53",
    "axios": "^0.16.0",
    "react": "~16.3.0",
    "react-dom": ">14.5.0",
    "react-scripts": "1.1.5"
  },
  "devDependencies": {
    "eslint": "^4.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  }
}`,
      finalData: {}
    }
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value })
  }

  handleSubmit = async (event) => {
    this.setState({
      finalData: {}
    })
    event.preventDefault()
    try {
      const InputPackage = JSON.parse(this.state.value)
      let TempPackage = InputPackage
      const { dependencies, devDependencies } = InputPackage
      if (dependencies) {
        const depPromises = Object.keys(dependencies).map(dependency => axios.get(`/api/repo?reponame=${dependency}`))
        const depResponses = await axios.all(depPromises)
        depResponses.forEach(depResponse => {
          const { data: { name, versions } } = depResponse
          TempPackage.dependencies[name] = this.getPackageVersion(versions, InputPackage.dependencies[name])
        })
      }
      if (devDependencies) {
        const devDepPromises = Object.keys(devDependencies).map(dependency => axios.get(`/api/repo?reponame=${dependency}`))
        const devDepResponses = await axios.all(devDepPromises)
        devDepResponses.forEach(devDepResponse => {
          const { data: { name, versions } } = devDepResponse
          TempPackage.devDependencies[name] = this.getPackageVersion(versions, InputPackage.devDependencies[name])
        })
      }
      this.setState({
        finalData: TempPackage
      })
    } catch (err) {
      console.error('err', err)
    }
  }

  getPackageVersion(versions, version) {
    let ver = version
    switch (version.charAt(0)) {

      case '>':
        ver = semver.maxSatisfying(Object.keys(versions), version)
        return ver ? `>${ver}` : version

      case '^':
        ver = semver.maxSatisfying(Object.keys(versions), version)
        if (version.charAt(1) == 0) {
          let newVersion = `>${version.substr(1)}`
          ver = semver.maxSatisfying(Object.keys(versions), newVersion)
        }
        return ver ? `^${ver}` : version

      case '~':
        ver = semver.maxSatisfying(Object.keys(versions), version)
        return ver ? `~${ver}` : version

      default:
        return version
    }
  }

  handleCopyClipboard = () => {
    copy(JSON.stringify(this.state.finalData, null, 2))
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value })
  }

  render() {
    const { finalData } = this.state
    return (
      <Layout>
        <Grid gridTemplateColumns="repeat(2, auto)" gridGap={3}>
          <Box p={3}>
            <Heading fontSize={30}>Current package.json</Heading>
            <TextInput as="textarea" rows={25} style={{ width: '400px', fontSize: '14px' }} value={this.state.value} onChange={this.handleChange} />
            <br /><br />
            <Button default onClick={this.handleSubmit}>Submit</Button>
          </Box>
          <Box p={3}>
            {JSON.stringify(finalData, null, 2) !== '{}' ?
              <>
                <Heading>Updated package.json</Heading>
                <textarea rows={25} style={{ width: '400px', fontSize: '14px' }} value={JSON.stringify(finalData, null, 2)} />
                <br /><br />
                <Button default onClick={this.handleCopyClipboard}>Copy to Clipboard</Button>
              </>
              : null}
          </Box>
        </Grid>
      </Layout>
    )
  }
}

export default App
