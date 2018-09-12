import React, { Component } from 'react'
import axios from 'axios'
import semver from 'semver'
import { Flex, Box } from 'rebass'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: `
    {
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
    }
    `,
      finalData: {}
    }
  }

  handleChange = (event) => {
    this.setState({ value: event.target.value })
  }

  handleSubmit = async (event) => {
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
        return `>${ver}` || version

      case '^':
        ver = semver.maxSatisfying(Object.keys(versions), version)
        if (version.charAt(1) == 0) {
          let newVersion = `>${version.substr(1)}`
          ver = semver.maxSatisfying(Object.keys(versions), newVersion)
        }
        return ver ? `^${ver}` : version

      case '~':
        ver = semver.maxSatisfying(Object.keys(versions), version)
        return `~${ver}` || version

      default:
        return version
    }
  }

  render() {
    return (
      <Flex>
        <Box width={1 / 2} px={2}>
          <form onSubmit={this.handleSubmit}>
            <label>
              Your Package JSON
          <br />
              <textarea type="text" style={{ height: '300px', width: '400px' }} value={this.state.value} onChange={this.handleChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </Box>
        <Box width={1 / 2} px={2}>
          <pre>{JSON.stringify(this.state.finalData, null, 2)}</pre>
        </Box>
      </Flex>
    )
  }
}

export default App
