import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { changeAdminRole } from '../actions/AccountActions'

const ADMIN_ROLE_ACTIONS = {
  GRANT: 'GRANT',
  REVOKE: 'REVOKE'
}

class AdminRoleModal extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      address: '',
      action: ADMIN_ROLE_ACTIONS.GRANT
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleActionChange = this.handleActionChange.bind(this)
  }

  handleSubmit(event) {
    this.props.dispatchChangAdmineRole(this.state.address, this.state.action)
    event.preventDefault()
  }

  handleAddressChange(event) {
    this.setState({
      address: event.target.value
    })
  }

  handleActionChange(event) {
    this.setState({
      action:
        this.state.action === ADMIN_ROLE_ACTIONS.GRANT
          ? ADMIN_ROLE_ACTIONS.REVOKE
          : ADMIN_ROLE_ACTIONS.GRANT
    })
  }

  render() {
    return (
      <div className="modal" tabIndex="-1" role="dialog" id="adminRoleModal" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Grant/Revoke Admin Priviledgese</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-row">
                  <div className="col-auto">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Account Address"
                      value={this.state.address}
                      onChange={this.handleAddressChange}
                    />
                  </div>

                  <div className="col-auto">
                    <div
                      className="btn-group btn-group-toggle"
                      data-toggle="buttons"
                      onClick={this.handleActionChange}
                    >
                      <label className="btn btn-outline-success active">
                        <input type="radio" name="actionOptions" id="grant" autoComplete="off" />
                        Grant
                      </label>
                      <label className="btn btn-outline-danger">
                        <input type="radio" name="actionOptions" id="revoke" autoComplete="off" />
                        Revoke
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className={
                  'btn btn-outline-'
                  + (this.state.action === ADMIN_ROLE_ACTIONS.GRANT ? 'success' : 'danger')
                }
                data-dismiss="modal"
                onClick={this.handleSubmit}
              >
                <FontAwesomeIcon
                  className="button-icon"
                  icon={this.state.action === ADMIN_ROLE_ACTIONS.GRANT ? 'check' : 'ban'}
                />
                {this.state.action}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

AdminRoleModal.contextTypes = {
  drizzle: PropTypes.object
}

AdminRoleModal.propTypes = {}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchChangAdmineRole: (address, action) => {
      dispatch(changeAdminRole(address, action))
    }
  }
}

export default drizzleConnect(AdminRoleModal, mapStateToProps, mapDispatchToProps)
