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
import AdminRoleModal from './AdminRoleModal'
import AdminRoleButton from './AdminRoleButton'
import EmergencyStopCampaignFactory from './EmergencyStopCampaignFactory'

import { getIsStopped } from '../actions/IsStoppedActions'
import IsStoppedAlert from './IsStoppedAlert'

import trianglesTop from '../../public/triangles-top.svg'
import trianglesBottom from '../../public/triangles-bottom.svg'
import logo from '../../public/logo.svg'

class App extends Component {
  constructor(props, context) {
    super(props)
    this.contracts = context.drizzle.contracts
    this.dataKey = this.contracts.CampaignFactory.methods.getNumCampaigns.cacheCall()
  }

  componentDidMount() {
    this.props.dispatchGetIsStopped()
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
        <AdminRoleModal />
        <div className="container-fluid">
          <div className="row">
            <div className="jumbotron">
              {/* <div className="jumbotron mb-0"> */}
              <img className="triangles triangles-top" src={trianglesTop} />
              <img className="triangles triangles-bottom" src={trianglesBottom} />
              <img src={logo} />
              <p className="display-4">
                <span className="eth">eth</span>
                <span className="fund">fund</span>
                <span className="me">me</span>
              </p>
              <h1 className="title">Ethereum Smart Contract Crowd Funding</h1>
              {/* <p className="lead">Fund Your Future</p> */}
              {/* <p className="lead">Ethereum Smart Contract Based Crowd Funding</p> */}
              <hr className="my-4" />
              <p className="lead mx-auto">
                Intelligently, Securely and Trustlessly Manage Crowd Funding Campaigns with Smart
                Contracts
              </p>
              {/* <CreateCampaignButton text="Get Started"/> */}
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
                  <EmergencyStopCampaignFactory />
                </div>
                <div className="mb-3">
                  <AdminRoleButton />
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
                <IsStoppedAlert />
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

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchGetIsStopped: () => {
      dispatch(getIsStopped())
    }
  }
}

export default drizzleConnect(App, mapStateToProps, mapDispatchToProps)
