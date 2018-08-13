import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { toggleFilter } from '../actions/FilterActions'

class FilterBadge extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    let campaignCount = 0

    if (this.props.filterName === 'All') {
      campaignCount = this.props.campaigns.length
    } else if (this.props.campaigns.length > 0) {
      campaignCount = this.props.campaigns.reduce(
        (a, campaign) => campaign.campaignState === this.props.filterName
          || campaign.approvalState === this.props.filterName
          ? ++a
          : a,
        0
      ) // eslint-disable-line no-param-reassign
    }
    return <span className="FilterBadge badge ml-auto">{campaignCount}</span>
  }
}

FilterBadge.contextTypes = {
  drizzle: PropTypes.object
}

FilterBadge.propTypes = {
  campaigns: PropTypes.array.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    campaigns: state.campaigns
  }
}

export default drizzleConnect(FilterBadge, mapStateToProps)
