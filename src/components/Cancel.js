import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { cancel } from '../actions/CampaignActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Cancel extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchCancel(this.props.campaign)
    event.preventDefault()
  }

  render() {
    let isManager = web3.toChecksumAddress(this.props.account.address)
      === web3.toChecksumAddress(this.props.campaign.manager)

    if (isManager && (this.props.campaign.campaignState === 'Pending' || this.props.campaign.campaignState === 'Active')) {
      return (
        <div className="Cancel mt-3 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={this.handleClick}
          >
            <FontAwesomeIcon className="button-icon" icon="times-circle" />
            Cancel Campaign
          </button>
        </div>
      )
    }

    return null
  }
}

Cancel.contextTypes = {
  drizzle: PropTypes.object
}

Cancel.propTypes = {
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
    dispatchCancel: (campaign) => {
      dispatch(cancel(campaign))
    }
  }
}

export default drizzleConnect(Cancel, mapStateToProps, mapDispathToProps)
