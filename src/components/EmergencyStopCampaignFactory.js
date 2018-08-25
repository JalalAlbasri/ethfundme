import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { getIsStopped, toggleIsStopped } from '../actions/IsStoppedActions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class EmergencyStopCampaignFactory extends Component {
  constructor(props, context) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(event) {
    this.props.dispatchToggleIsStopped()
    event.preventDefault()
  }

  render() {
    if (this.props.account.isAdmin) {
      return (
        <div className="EmergencyStopCampaignFactory mt-3">
          <button
            type="button"
            className={'btn btn-outline-' + (this.props.isStopped ? 'primary' : 'danger')}
            onClick={this.handleClick}
          >
            <FontAwesomeIcon
              className="button-icon"
              icon={this.props.isStopped ? 'play-circle' : 'stop-circle'}
            />
            {this.props.isStopped ? 'Resume Campaign Factory' : 'Emergency Stop Campaign Factory'}
          </button>
        </div>
      )
    }

    return null
  }
}

EmergencyStopCampaignFactory.contextTypes = {
  drizzle: PropTypes.object
}

EmergencyStopCampaignFactory.propTypes = {
  account: PropTypes.object.isRequired,
  isStopped: PropTypes.bool.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    isStopped: state.isStopped
  }
}

const mapDispathToProps = (dispatch) => {
  return {
    dispatchToggleIsStopped: () => {
      dispatch(toggleIsStopped())
    }
  }
}

export default drizzleConnect(EmergencyStopCampaignFactory, mapStateToProps, mapDispathToProps)
