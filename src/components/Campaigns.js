import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { addCampaigns } from '../actions/CampaignActions'
import Campaign from './Campaign'

class Campaigns extends Component {
  constructor(props, context) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatchAddCampaigns()
  }

  render() {
    if (this.props.campaigns.length > 0) {
      console.log(`typeof campaigns[0].campaignIndex: ${typeof this.props.campaigns[0].campaignIndex}`)
      let campaigns = this.props.campaigns
        .filter((campaign) => this.props.filter[campaign.campaignState])
        .sort((a, b) => a.campaignIndex > b.campaignIndex)

      return (
        <div className="Campaigns">
          {campaigns.map((campaign) => <Campaign
            key={campaign.address}
            campaign={campaign}
            />)}
        </div>
      )
    }
    return null
  }
}

Campaigns.contextTypes = {
  drizzle: PropTypes.object
}

Campaigns.propTypes = {
  campaigns: PropTypes.arrayOf(
    PropTypes.shape(PropTypes.object.isRequired).isRequired
  ).isRequired,
  filter: PropTypes.arrayOf(PropTypes.bool).isRequired
}


const mapStateToProps = (state) => {
  return {
    campaigns: state.campaigns,
    EthFundMe: state.contracts.EthFundMe,
    filter: state.filter
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchAddCampaigns: () => {
      dispatch(addCampaigns())
    }
  }
}

export default drizzleConnect(Campaigns, mapStateToProps, mapDispatchToProps)
