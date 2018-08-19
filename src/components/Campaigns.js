import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { addCampaigns } from '../actions/CampaignActions'
import Campaign from './Campaign'

const CAMPAIGN_STATE_ORDER = ['Pending', 'Active', 'Successful', 'Unsuccessful', 'Cancelled']
const APPROVAL_STATE_ORDER = ['Commit', 'Reveal', 'Approved', 'Rejected', 'Cancelled']

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
        .filter((campaign) => this.props.filters[campaign.campaignState].isActive)
        .filter((campaign) => {
          if (!this.props.account.isAdmin) {
            return true
          }

          if (
            Object.prototype.hasOwnProperty.call(
              this.props.filters[campaign.campaignState],
              'adminFilters'
            )
          ) {
            // return this.props.filters[campaign.campaignState].isActive
            return this.props.filters[campaign.campaignState].adminFilters[campaign.approvalState]
              .isActive
          }

          return this.props.filters[campaign.campaignState].isActive
        })
        // .sort((a, b) => {
        //   // if (!Object.prototype.hasOwnProperty.call(a, 'campaignIndex')) {
        //   //   return 1
        //   // }
        //   if (a.campaignIndex > b.campaignIndex) {
        //     return 1
        //   }
        //   if (a.campaignIndex < b.campaignIndex) {
        //     return -1
        //   }
        //   return 0
        // })
        .sort((a, b) => a.campaignIndex > b.campaignIndex) // FIXME: This sint doing anything because we sort again
        .sort((a, b) => {
          if (
            CAMPAIGN_STATE_ORDER.indexOf(a.campaignState)
            > CAMPAIGN_STATE_ORDER.indexOf(b.campaignState)
          ) {
            return 1
          }

          if (
            CAMPAIGN_STATE_ORDER.indexOf(a.campaignState)
            < CAMPAIGN_STATE_ORDER.indexOf(b.campaignState)
          ) {
            return -1
          }

          if (
            APPROVAL_STATE_ORDER.indexOf(a.approvalState)
            > APPROVAL_STATE_ORDER.indexOf(b.approvalState)
          ) {
            return 1
          }

          if (
            APPROVAL_STATE_ORDER.indexOf(a.approvalState)
            < APPROVAL_STATE_ORDER.indexOf(b.approvalState)
          ) {
            return -1
          }

          return 0
        })

      return (
        <div className="Campaigns">
          {campaigns.map((campaign) => (
            <Campaign key={campaign.address} campaign={campaign} />
          ))}
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
  account: PropTypes.object.isRequired,
  campaigns: PropTypes.arrayOf(PropTypes.shape(PropTypes.object.isRequired).isRequired).isRequired,
  filters: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    account: state.account,
    campaigns: state.campaigns,
    CampaignFactory: state.contracts.CampaignFactory,
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
