import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { withdraw } from '../actions/CampaignActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Withdraw extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchWithdraw(this.props.campaign)
    event.preventDefault()
  }

  render() {
    let isManager = web3.toChecksumAddress(this.props.account.address)
      === web3.toChecksumAddress(this.props.campaign.manager)

    if (
      (isManager
        && this.props.campaign.campaignState === 'Successful'
        && !this.props.campaign.hasWithdrawn)
      || ((this.props.campaign.campaignState === 'Unsuccessful'
        || this.props.campaign.campaignState === 'Cancelled')
        && this.props.campaign.hasContributed
        && !this.props.campaign.hasWithdrawn)
    ) {
      return (
        <div className="Withdraw container mt-3">
          <p>
            {isManager
              ? 'Congratulations your campaign was successful. You may withdraw the campaign funds'
              : 'The campaign was unsuccessful. You may withdraw your contributed funds'}
          </p>
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={this.handleClick}
          >
            <FontAwesomeIcon className="button-icon" icon="arrow-circle-down" />
            Withdraw
            {isManager ? ' ' + this.props.campaign.funds + ' eth' : ' ' + this.props.campaign.totalContributed + ' eth'}
          </button>
        </div>
      )
    }

    return null
  }
}

Withdraw.contextTypes = {
  drizzle: PropTypes.object
}

Withdraw.propTypes = {
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
    dispatchWithdraw: (campaign) => {
      dispatch(withdraw(campaign))
    }
  }
}

export default drizzleConnect(Withdraw, mapStateToProps, mapDispathToProps)
