import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { end } from '../actions/CampaignActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class End extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchEnd(this.props.campaign)
    event.preventDefault()
  }

  render() {
    const isManager = web3.toChecksumAddress(this.props.account.address)
      === web3.toChecksumAddress(this.props.campaign.manager)

    const isAdmin = this.props.account.isAdmin

    const pastEndDate = !this.props.campaign.isActive

    if (pastEndDate && (isManager || isAdmin) && this.props.campaign.campaignState === 'Active') {
      return (
        <button
          type="button"
          className="End btn btn-outline-primary ml-2"
          onClick={this.handleClick}
          disabled={this.props.campaign.isStopped}
        >
          <FontAwesomeIcon className="button-icon" icon="calendar-times" />
          End Campaign
        </button>
      )
    }

    return null
  }
}

End.contextTypes = {
  drizzle: PropTypes.object
}

End.propTypes = {
  account: PropTypes.object.isRequired,
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  }
}

const mapDispathToProps = (dispatch) => {
  return {
    dispatchEnd: (campaign) => {
      dispatch(end(campaign))
    }
  }
}

export default drizzleConnect(End, mapStateToProps, mapDispathToProps)
