import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import CreateCampaignButtonContainer from './CreateCampaignButton'
// import CampaginContainer from './Campaign'
import Campaigns from './campaign/Campaigns'

import './App.css'

console.log(`web3 version: ${web3.version.api}`)

class App extends Component {
  constructor(props, context) {
    super(props)
    console.log(`typeof context.drizzle: ${typeof context.drizzle}`)
    this.contracts = context.drizzle.contracts
    this.dataKey = this.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
  }

  render() {
    console.log('App Render')
    const drizzleStatus = this.props.drizzleStatus
    const EthFundMe = this.props.EthFundMe


    // if (drizzleStatus.initialized) {
    if (!(this.dataKey in EthFundMe.getNumCampaigns)) {
      return <span> Loading </span>
    }

    var numCampaigns = EthFundMe.getNumCampaigns[this.dataKey].value

    var campaigns = new Array()
    for (var i = 0; i < numCampaigns; i++) {
      campaigns.push(i)
    }

    console.log(campaigns.length)

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
        {/* {
          campaigns.map((campaign, index) => 
            <CampaignContainer key={index} index={index} />
          )
        } */}

        <Campaigns />

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
