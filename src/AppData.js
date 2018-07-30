import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import { ContractData } from 'drizzle-react-components'
import PropTypes from 'prop-types'

class AppData extends Component {
  constructor(props, context) {
    super(props)
    this.contracts = context.drizzle.contracts
    this.dataKey = this.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
  }

  render() {
    const drizzleStatus = this.props.drizzleStatus
    const EthFundMe = this.props.EthFundMe


    // if (drizzleStatus.initialized) {
    if (!(this.dataKey in this.props.EthFundMe.getNumCampaigns)) {
      return <span> Loading </span>
    }

    const numCampaigns = EthFundMe.getNumCampaigns[this.dataKey].value

    return (
        <div className="AppData">
          <p> drizzleStatus: {drizzleStatus.initialized.toString()} </p>
          <p>
            getNumAdmins: <ContractData contract="EthFundMe" method="getNumAdmins" />
          </p>
          <p>
            getNumCampaigns: <ContractData contract="EthFundMe" method="getNumCampaigns" />
          </p>
          <p>
            numCampaigns: {numCampaigns}
          </p>
        </div>
    )
    // }
  }
}

AppData.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = (state) => {
  console.log(state)
  return {
    drizzleStatus: state.drizzleStatus,
    EthFundMe: state.contracts.EthFundMe
  }
}

const AppDataContainer = drizzleConnect(AppData, mapStateToProps)
export default AppDataContainer
