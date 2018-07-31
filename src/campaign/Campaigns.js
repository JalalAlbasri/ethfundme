import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { addCampaign } from './actions'
import Campaign from './Campaign'


class Campaigns extends Component {
  constructor(props, context) {
    super(props)
    console.log(`typeof context: ${typeof context}`)
    console.log(`typeof context.drizzle: ${typeof context.drizzle}`)
    this.drizzle = context.drizzle
    this.dataKey = this.drizzle.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
    this.campaigns = this.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall
    // this.dataKey = context.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(props.index)
  }

  componentDidMount() {
    const EthFundMe = this.props.EthFundMe
    let numCampaigns = EthFundMe.getNumCampaigns[this.dataKey].value

    console.log(`numCampaigns: ${numCampaigns}`)

    // for (let i = 0; i < numCampaigns; i++) {
    let dataKey = this.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(0)
    // let dataKey = this.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(i)
    let address = EthFundMe.campaigns[dataKey].value
    this.props.dispatchAddCampaign(address)
    // this.props.dispatchAddCampaign(this.EthFundMe.campaigns[this.campaigns(i)].value)
    // }
  }

  render() {
    return (
      <ul>
        {this.props.campaigns.map((campaign) =>
          <Campaign
            key={campaign.address}
            {...campaign}
            />)}
      </ul>
    )
  }
}

Campaigns.contextTypes = {
  drizzle: PropTypes.object
}

Campaigns.propTypes = {
  campaigns: PropTypes.arrayOf(PropTypes.shape({
    address: PropTypes.string.isRequired
  }).isRequired).isRequired
}


const mapStateToProps = (state) => {
  console.log(state.campaigns)
  return {
    campaigns: state.campaigns,
    EthFundMe: state.contracts.EthFundMe
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchAddCampaign: (address) => {
      dispatch(addCampaign(address))
    }
  }
}

export default drizzleConnect(Campaigns, mapStateToProps, mapDispatchToProps)
