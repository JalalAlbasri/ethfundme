import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class AddAdminButton extends Component {
  constructor(props, context) {
    super(props)
  }

  render() {
    if (this.props.account.isAdmin) {
      return (
        <button
          type="button"
          className="btn btn-outline-info"
          data-toggle="modal"
          data-target="#adminRoleModal"
        >
          <FontAwesomeIcon className="button-icon" icon="wrench" />
          Admin Roles
        </button>
      )
    }
    return null
  }
}

AddAdminButton.contextTypes = {
  drizzle: PropTypes.object
}

AddAdminButton.PropTypes = {
}

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  }
}

export default drizzleConnect(AddAdminButton, mapStateToProps)
