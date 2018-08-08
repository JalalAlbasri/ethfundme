import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { getAccountDetails } from '../actions/AccountActions'

function UserBadge(props) {
  if (!props.showUserBadge) {
    return (
      <div className="mb-1">
        <span className="badge badge-success admin-badge">
          <img src="../../public/metamask-fox.svg"/>
          User
        </span>
      </div>
    )
  }

  return (
    <div className="mb-1">
      <span className="badge badge-danger admin-badge">
        <img src="../../public/metamask-fox.svg"/>
        Admin
      </span>
    </div>
  )
}

class Account extends Component {
  constructor(props, context) {
    super(props)
    this.props.dispatchGetAccountDetails(this.props.accountAddress)
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="Account">
        <UserBadge showUserBadge={this.props.account.isAdmin} />
        <div className="mb-3">
          <span className="badge address-badge">{this.props.account.address}</span>
        </div>
      </div>
    )
  }
}

Account.contextTypes = {
  drizzle: PropTypes.object
}


Account.propTypes = {
  accountAddress: PropTypes.string.isRequired,
  account: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    EthFundMe: state.contracts.EthFundMe,
    accountAddress: state.accounts[0],
    account: state.account
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchGetAccountDetails: (address) => {
      dispatch(getAccountDetails(address))
    }
  }
}

export default drizzleConnect(Account, mapStateToProps, mapDispatchToProps)
