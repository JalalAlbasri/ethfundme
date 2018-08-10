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
      return (

        <div className="Campaigns">
          {this.props.campaigns.map((campaign, campaignIndex) => <Campaign
              key={campaign.address}
              campaignIndex={campaignIndex}
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
    dispatchAddCampaigns: () => {
      dispatch(addCampaigns())
    }
  }
}

export default drizzleConnect(Campaigns, mapStateToProps, mapDispatchToProps)
