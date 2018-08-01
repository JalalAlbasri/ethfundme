import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import '../styles/Account.less'

function AdminBadge(props) {
  if (!props.showAdminBadge) {
    return null
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

  componentDidMount() {

  }

  render() {
    const EthFundMe = this.props.EthFundMe
    this.isAdmin = false

    if (this.dataKey in EthFundMe.isAdmin) {
      this.isAdmin = EthFundMe.isAdmin[this.dataKey].value
    }

    return (
      <div className="Account ml-auto">
        <AdminBadge showAdminBadge={this.isAdmin} />
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
  console.log(`typeof state.accounts[0]: ${typeof state.accounts[0]}`)
  return {
    EthFundMe: state.contracts.EthFundMe,
    account: state.accounts[0]
  }
}

export default drizzleConnect(Account, mapStateToProps)
