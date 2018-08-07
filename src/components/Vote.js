import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo


const APPROVAL_STATES = {
  0: 'Commit',
  1: 'Reveal',
  2: 'Approved',
  3: 'Rejected',
  4: 'Cancelled'
}

class Vote extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      salt: 0
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleApprove = this.handleApprove.bind(this)
    this.handleReject = this.handleReject.bind(this)
    this.loaded = false
  }

  handleChange(event) {
    this.setState({
      salt: event.target.value
    })
    event.preventDefault()
  }

  handleApprove(event) {
    console.log('approve')
    this.vote(true)
    event.preventDefault()
  }

  handleReject(event) {
    console.log('reject')
    this.vote(false)
    event.preventDefault()
  }

  vote(voteOption) {
    let voteSecret = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption, this.state.salt]).toString('hex')
    this.CampaignInstance.vote(voteSecret, { from: this.coinbase })
      .then((result) => {

      })
      .catch((err) => {

      })
  }

  componentDidMount() {

  }

  render() {
    if (this.props.account.isAdmin) {
    // TODO: is loaded required?
      // if (this.isAdmin && this.loaded) {
      return (
        <div className="Vote">
          <p>Approval Status: {APPROVAL_STATES[this.props.campaign.approvalState]}</p>

          {
            (this.props.campaign.approvalState === 0)
              ? <p> {this.props.campaign.numVoteSecrets} {(this.props.campaign.numVoteSecrets === 1) ? 'vote has' : 'votes have'} been placed </p> : null
          }

          {/* TODO: Hide the form once you submit it */}
          {/* TODO: Only show form if this admin has not voted */}

          <form>
            <div className="form-row">
              <div className="col-sm-3">
                {/* TODO: Generate random number for salt */}
                <input type="number" className="form-control" value={this.state.salt} onChange={this.handleChange}/>
              </div>
              {
                (this.props.campaign.approvalState === 0 && !this.props.campaign.hasVoted)
                  ? (
                  <div className="col-auto">
                    <button type="submit" className="btn btn-outline-success" onClick={this.handleApprove}>
                      Approve
                    </button>
                  </div>
                  ) : ''
              }
              {
                (this.props.campaign.approvalState === 0 && !this.props.campaign.hasVoted)
                  ? (
                  <div className="col-auto">
                    <button type="submit" className="btn btn-outline-danger" onClick={this.handleReject}>
                      Reject
                    </button>
                  </div>
                  ) : ''
              }
              {
                (this.props.campaign.approvalState === 1 && !this.props.campaign.hasRevealed)
                  ? (
                  <div className="col-auto">
                    <button type="submit" className="btn btn-outline-primary">
                      Reveal
                    </button>
                  </div>
                  ) : ''
              }
            </div>
          </form>
        </div>
      )
    }
    return null
  }
}

Vote.contextTypes = {
  drizzle: PropTypes.object
}

Vote.propTypes = {
  account: PropTypes.object.isRequired,
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    EthFundMe: state.contracts.EthFundMe,
    account: state.account,
    campaign: state.campaigns[ownProps.i]
  }
}

export default drizzleConnect(Vote, mapStateToProps)
