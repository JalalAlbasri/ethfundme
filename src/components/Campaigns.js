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
      let campaigns = this.props.campaigns
        .filter((campaign) => {
          return this.props.filters.find((filter) => {
            if (filter.name === 'All' && filter.isActive) {
              return true
            }

            if (filter.name === campaign.campaignState && filter.isActive) {
              return true
            }

            if (filter.name === campaign.approvalState && filter.isActive) {
              return true
            }

            return false
          })
        })
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
  filters: PropTypes.array.isRequired
}


const mapStateToProps = (state) => {
  return {
    campaigns: state.campaigns,
    EthFundMe: state.contracts.EthFundMe,
    filters: state.filters
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
