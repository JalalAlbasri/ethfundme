import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const contract = require('truffle-contract')
import EthFundMeContract from '../../build/contracts/EthFundMe.json'

import { timeTravel } from '../actions/CampaignActions'

class CreateCampaignButton extends Component {
  constructor(props, context) {
    super(props)
    this.handleTimeTravelClick = this.handleTimeTravelClick.bind(this)
  }

  handleTimeTravelClick(event) {
    console.log('Time Travel')
    event.preventDefault()
  }

  render() {
    return <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={this.handleTimeTravelClick}>
        <FontAwesomeIcon className="button-icon" icon="forward" />
        Time Travel
      </button>
  }
}

CreateCampaignButton.contextTypes = {
  drizzle: PropTypes.object
}

CreateCampaignButton.PropTypes = {
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchTimeTravel: (address) => {
      dispatch(timeTravel(address))
    }
  }
}

export default drizzleConnect(
  CreateCampaignButton,
  mapStateToProps,
  mapDispatchToProps
)
