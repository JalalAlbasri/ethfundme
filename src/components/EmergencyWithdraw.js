import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { emergencyWithdraw } from '../actions/CampaignActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class EmergencyWithdraw extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchEmergencyWithdraw(this.props.campaign)
    event.preventDefault()
  }

  render() {
    let isManager = web3.toChecksumAddress(this.props.account.address)
      === web3.toChecksumAddress(this.props.campaign.manager)

    if (
      this.props.campaign.isStopped
      && this.props.campaign.hasContributed
      && !this.props.campaign.hasWithdrawn
      && !isManager
    ) {
      return (
        <div className="Withdraw container mt-3">
          <div className="alert alert-warning">
            This Campaign has been stopped by an Administrator. You can retrieve your funds using
            the button below.
          </div>
          <button type="button" className="btn btn-outline-success" onClick={this.handleClick}>
            <FontAwesomeIcon className="button-icon" icon="exclamation-triangle" />
            Emergency Withdraw 
            {/* {this.props.campaign.totalContributed} eth */}
          </button>
        </div>
      )
    }

    return null
  }
}

EmergencyWithdraw.contextTypes = {
  drizzle: PropTypes.object
}

EmergencyWithdraw.propTypes = {
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
    dispatchEmergencyWithdraw: (campaign) => {
      dispatch(emergencyWithdraw(campaign))
    }
  }
}

export default drizzleConnect(EmergencyWithdraw, mapStateToProps, mapDispathToProps)
