import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { createCampaign } from '../actions/CampaignActions'

class CreateCampaignButton extends Component {
  constructor(props, context) {
    super(props)
    this.handleCreateCampaignClick = this.handleCreateCampaignClick.bind(this)
  }

  // TODO: Move to Campaign Actions
  handleCreateCampaignClick(event) {
    event.preventDefault()
    this.props.dispatchCreateCampaign('', 10, 1)
  }

  render() {
    let text = (this.props.text) ? this.props.text : 'Create Campaign'

    if (!this.props.account.isAdmin) {
      return (
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={(event) => this.handleCreateCampaignClick(event)}>
              <FontAwesomeIcon className="button-icon" icon="plus" />
              {text}
          </button>
      )
    }
    return null
  }
}

CreateCampaignButton.contextTypes = {
  drizzle: PropTypes.object
}

CreateCampaignButton.PropTypes = {
  text: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchCreateCampaign: (title, duration, goal) => {
      dispatch(createCampaign(title, duration, goal))
    }
  }
}

export default drizzleConnect(
  CreateCampaignButton,
  mapStateToProps,
  mapDispatchToProps
)
