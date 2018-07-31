import React, { Component } from 'react'
import { AccountData, ContractData } from 'drizzle-react-components'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import CampaignContract from '../build/contracts/Campaign.json'

class Campaign extends Component {
  constructor(props, context) {
    super(props)
    console.log(`props.index: ${props.index}`)
    console.log(`typeof props.index: ${typeof props.index}`)
    this.dataKey = context.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(props.index)
  }

  render() {
    const EthFundMe = this.props.EthFundMe

    // if (drizzleStatus.initialized) {
      if (!(this.dataKey in EthFundMe.campaigns)) {
        return <span> Loading </span>
      }

    const campaignAddress = EthFundMe.campaigns[this.dataKey].value

    return (
      <div className="Campaign">

        <p> 
          <span> index: {this.props.index} address: {campaignAddress} </span> 
          </p>
        {/* <p> title: {title} </p> */}
      </div>
    )

  }
}

Campaign.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = (state, ownProps) => {
  return {
    EthFundMe: state.contracts.EthFundMe
  }
}

const CampaignContainer = drizzleConnect(
  Campaign,
  mapStateToProps
)

export default CampaignContainer