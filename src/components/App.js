import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import Navbar from './Navbar'
import Account from './Account'
import CreateCampaignButton from './CreateCampaignButton'
import Campaigns from './Campaigns'
import Filters from './Filters'
import CreateCampaignModal from './CreateCampaignModal'

// TASK: End Campaign Button
// TASK: Create campaign form

class App extends Component {
  constructor(props, context) {
    super(props)
    this.contracts = context.drizzle.contracts
    this.dataKey = this.contracts.CampaignFactory.methods.getNumCampaigns.cacheCall()
  }

  render() {
    const drizzleStatus = this.props.drizzleStatus
    const CampaignFactory = this.props.CampaignFactory

    // if (drizzleStatus.initialized) {
    if (!(this.dataKey in CampaignFactory.getNumCampaigns)) {
      return <span> Loading </span>
    }

    let numCampaigns = CampaignFactory.getNumCampaigns[this.dataKey].value

    return (
      <div className="App">
        {/* <Account /> */}
        <CreateCampaignModal />
        <div className="container-fluid">
          <div className="row">
            <div className="jumbotron">
            {/* <div className="jumbotron mb-0"> */}
              <img src="../../public/logo.svg"/>
              <p className="display-4">
                <span className="eth">eth</span>
                <span className="fund">fund</span>
                <span className="me">me</span>
              </p>
              <h1 className="title">Ethereum Smart Contract Crowd Funding</h1>
              {/* <p className="lead">Fund Your Future</p> */}
              {/* <p className="lead">Ethereum Smart Contract Based Crowd Funding</p> */}
              <hr className="my-4" />
              <p className="lead">Intelligently, Securely and Trustlessly Manage Campaigns with Smart Contracts</p>
              <CreateCampaignButton text="Get Started"/>
              {/* <a className="btn btn-outline-success btn-lg" href="#" role="button">Learn more</a> */}
            </div>
          </div>
          <Navbar />
          <div className="row">
            <div className="col-md-2">
              <div className="sticky-top sidebar-left">
                {/* <div className="mb-3">
                  <Account />
                </div> */}
                <div className="mb-3">
                  <Account />
                </div>
                <div className="mb-3">
                  <CreateCampaignButton />
                </div>
                <div className="mb-3">
                  <Filters />
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="container">
                  <Campaigns />
              </div>
            </div>
            <div className="col-md-2">
              <div className="sticky-top sidebar-right d-flex justify-content-end">
                {/* <Account /> */}
                {/* <div className="mb-3">
                  <Filters />
                </div> */}
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
    CampaignFactory: state.contracts.CampaignFactory
  }
}

export default drizzleConnect(App, mapStateToProps)
