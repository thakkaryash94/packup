import React, { Component } from 'react'
import axios from 'axios'
import semver from 'semver'
import Layout from '../components/layout'
import { Grid, Row, Col } from '@zendeskgarden/react-grid'
import { Button } from '@zendeskgarden/react-buttons'
import { Textarea } from '@zendeskgarden/react-textfields'
import { XXL, XL } from '@zendeskgarden/react-typography'
import { Modal, Header, Body, Footer, Close, FooterItem } from '@zendeskgarden/react-modals'
import copy from 'copy-to-clipboard'

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
        <div>
          <Grid>
            <Row>
              <Col xl={6} xl={6} >
                <h2>
                  Your Package JSON
                </h2>
                <Textarea resizable={false} style={{ height: '400px', width: '400px', fontSize: '14px' }} value={this.state.value} onChange={this.handleChange} />
                <br />
                <Button default onClick={this.handleSubmit}>Submit</Button>
              </Col>
              <Col xl={6} xl={6} >
                {JSON.stringify(finalData, null, 2) !== '{}' ?
                  <>
                    <h2>Updated package.json</h2>
                    <Textarea disabled={true} style={{ height: '400px', width: '400px', fontSize: '14px' }} value={JSON.stringify(finalData, null, 2)} />
                    <br />
                    <Button default onClick={this.handleCopyClipboard}>Copy to Clipboard</Button>
                  </>
                  : null}
                <br />
              </Col>
            </Row>
          </Grid>
          {/* {this.state.isModalVisible && (
            <Modal onClose={this.onModalClose}>
              <Header>Example Header</Header>

            </Modal>
          )} */}
        </div>
      </Layout>
    )
  }
}

export default App
