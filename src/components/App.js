import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import Navbar from './Navbar'
import Account from './Account'
import CreateCampaignButton from './CreateCampaignButton'
import Campaigns from './Campaigns'

// TASK: Contribute Button
// TASK: End Campaign Button
// TASK: Filter Campaigns by status
// TASK: Approve/Reject for Admins + Reveal
// TASK: Basic UI Styling
// TASK: Withdraw Funds
// TASK: Create campaign form

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
        <div className="container-fluid">
          <div className="row">
            <div className="jumbotron">
              <h1 className="display-4">Welcome to <span className="eth">eth</span><span className="fund">fund</span><span className="me">me</span></h1>
              <p className="lead">ethfundme is an Ethereum Smart Contract Based Crowd Funding Application.</p>
              <hr className="my-4" />
              <p>Smart Contracts are used to intelligently, securely and trustlessly manage Campaign funds to ensure delivery to Campaingn Managers or Contributors.</p>
              <CreateCampaignButton />
              {/* <a className="btn btn-outline-success btn-lg" href="#" role="button">Learn more</a> */}
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="container">
                <div className="mb-3">
                  <Account />
                </div>
                <div className="mb-3">
                  <CreateCampaignButton />
                </div>
              </div>
            </div>
            <div className="col-md-9">
              <div className="container">
                  <Campaigns />
              </div>
            </div>
          </div>
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
