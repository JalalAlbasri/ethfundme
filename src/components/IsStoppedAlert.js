import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class IsStoppedAlert extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    if (this.props.isStopped) {
      return (
        <div className="alert alert-danger">
          This App has been stopped by an Administrator. You will not be able to {this.props.account.isAdmin ? 'manage admin roles' : 'create campaigns' } until it is resumed.
        </div>
      )
    }
    return null
  }
}

IsStoppedAlert.contextTypes = {
  drizzle: PropTypes.object
}

IsStoppedAlert.PropTypes = {
  account: PropTypes.object.isRequired,
  isStopped: PropTypes.bool.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account,
    isStopped: state.isStopped
  }
}

export default drizzleConnect(IsStoppedAlert, mapStateToProps)
