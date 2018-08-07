import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

function UserBadge(props) {
  if (!props.showUserBadge) {
    return (
      <span className="badge badge-success admin-badge">User</span>
    )
  }

  return (
    <span className="badge badge-danger admin-badge">Admin</span>
  )
}

class Account extends Component {
  constructor(props, context) {
    super(props)
    console.log(props.account)
    this.dataKey = context.drizzle.contracts.EthFundMe.methods.isAdmin.cacheCall(props.account)
  }

  render() {
    const EthFundMe = this.props.EthFundMe
    this.isAdmin = false

    if (this.dataKey in EthFundMe.isAdmin) {
      this.isAdmin = EthFundMe.isAdmin[this.dataKey].value
    }

    return (
      <div className="Account">
        <UserBadge showUserBadge={this.isAdmin} />
        <span className="badge badge-primary">{this.props.account}</span>
      </div>
    )
  }
}

Account.contextTypes = {
  drizzle: PropTypes.object
}


Account.propTypes = {
  account: PropTypes.string.isRequired
}

const mapStateToProps = (state) => {
  return {
    EthFundMe: state.contracts.EthFundMe,
    account: state.accounts[0]
  }
}

export default drizzleConnect(Account, mapStateToProps)
