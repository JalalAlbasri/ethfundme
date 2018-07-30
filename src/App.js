import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import CreateCampaignButtonContainer from './containers/CreateCampaignButtonContainer'

import './App.css'

class App extends Component {
  constructor(props, context) {
    super(props)
    this.contracts = context.drizzle.contracts
    this.dataKey = this.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
  }

  render() {
    console.log('App Render')
    const drizzleStatus = this.props.drizzleStatus
    const EthFundMe = this.props.EthFundMe


    // if (drizzleStatus.initialized) {
    if (!(this.dataKey in this.props.EthFundMe.getNumCampaigns)) {
      return <span> Loading </span>
    }

    var numCampaigns = EthFundMe.getNumCampaigns[this.dataKey].value

    return (
      <div className="App">
        <p> truffle react app </p>
        <p> AccounData Component</p>
        <AccountData accountIndex="0" unit="ether" precision="3" />
        <p> ContractData Component </p>
        getNumCampaigns: <ContractData contract="EthFundMe" method="getNumCampaigns" />
        <br />
        getNumAdmins: <ContractData contract="EthFundMe" method="getNumAdmins" />
        <p>
        <CreateCampaignButtonContainer />
        </p>
        <p>
          numCampaigns: {numCampaigns}
        </p>
      </div>
    )
  }
}

App.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    EthFundMe: state.contracts.EthFundMe
  }
}

const AppContainer = drizzleConnect(App, mapStateToProps)
export default AppContainer
