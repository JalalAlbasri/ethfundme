import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import Navbar from './Navbar'
import CreateCampaignButton from './CreateCampaignButton'
import Campaigns from './Campaigns'

// TASK: Contribute Button
// TASK: End Campaign Button
// TASK: Filter Campaigns by status
// TASK: Add Campaign details to store
// TASK: Approve/Reject for Admins + Reveal
// TASK: Basic UI Styling
// TASK: Withdraw Funds

class App extends Component {
  constructor(props, context) {
    super(props)
    this.contracts = context.drizzle.contracts
    this.dataKey = this.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
  }

  render() {
    const drizzleStatus = this.props.drizzleStatus
    const EthFundMe = this.props.EthFundMe

    // if (drizzleStatus.initialized) {
    if (!(this.dataKey in EthFundMe.getNumCampaigns)) {
      return <span> Loading </span>
    }

    let numCampaigns = EthFundMe.getNumCampaigns[this.dataKey].value

    return (
      <div className="App">
        <Navbar />
        <div className="container">
          <p> ContractData Component </p>
          getNumCampaigns: <ContractData contract="EthFundMe" method="getNumCampaigns" />
          <br />
          getNumAdmins: <ContractData contract="EthFundMe" method="getNumAdmins" />
          <p>
          <CreateCampaignButton />
          </p>
          <p>
            numCampaigns: {numCampaigns}
          </p>
          <Campaigns />
        </div>
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

export default drizzleConnect(App, mapStateToProps)
