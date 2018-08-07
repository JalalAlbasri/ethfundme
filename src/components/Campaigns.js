import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { addCampaign } from '../actions/CampaignActions'
import Campaign from './Campaign'

// TODO: refactor this stuff to use actions and reducers?
class Campaigns extends Component {
  constructor(props, context) {
    super(props)
    this.drizzle = context.drizzle

    this.dataKey = this.drizzle.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
    this.numCampaigns = props.EthFundMe.getNumCampaigns[this.dataKey].value

    this.campaignDataKeys = []
    for (let i = 0; i < this.numCampaigns; i++) {
      this.campaignDataKeys[i] = this.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(i)
    }
  }

  componentDidMount() {
    this.drizzle.contracts.EthFundMe.methods.getNumCampaigns().call().then((numCampaigns) => {
      for (let i = 0; i < numCampaigns; i++) {
        this.drizzle.contracts.EthFundMe.methods.campaigns(i).call().then((address) => {
          this.props.dispatchAddCampaign(address)
        })
      }
    })
  }

  render() {
    return (
      <div className="Campaigns">
        {this.props.campaigns.map((campaign, i) => <Campaign
            key={campaign.address}
            i={i}
            />)}
      </div>
    )
  }
}

Campaigns.contextTypes = {
  drizzle: PropTypes.object
}

Campaigns.propTypes = {
  campaigns: PropTypes.arrayOf(
    PropTypes.shape(PropTypes.object.isRequire).isRequired
  ).isRequired
}


const mapStateToProps = (state) => {
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
