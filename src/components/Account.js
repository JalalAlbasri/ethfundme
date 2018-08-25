import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { getAccountDetails } from '../actions/AccountActions'

import metamaskFox from '../../public/metamask-fox.svg'

class Account extends Component {
  constructor(props, context) {
    super(props)
    this.props.dispatchGetAccountDetails(this.props.accountAddress)
  }

  componentDidMount() {}

  render() {
    let balance = Number(web3.fromWei(this.props.accountBalances[this.props.accountAddress]))
    return (
      <div className="Account">
        <div className="">
          <span className={'badge account-badge ' + (this.props.account.isAdmin ? 'admin' : '')}>
            {this.props.account.isAdmin ? 'Admin' : 'User'}
            <img src={metamaskFox} />
            <span>{Number.prototype.toPrecision.call(balance, 5)} eth</span>
          </span>
        </div>
        <div>
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
    accountAddress: state.accounts[0],
    accountBalances: state.accountBalances,
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
