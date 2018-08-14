import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { placeVote, revealVote } from '../actions/CampaignActions'

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class Vote extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      salt: '',
      voteOption: true
    }

    this.handleChangeSalt = this.handleChangeSalt.bind(this)
    this.handleChangeVoteOption = this.handleChangeVoteOption.bind(this)
    this.handleVote = this.handleVote.bind(this)
    this.handleReveal = this.handleReveal.bind(this)
  }

  handleChangeVoteOption(event) {
    this.setState({
      voteOption: !this.state.voteOption
    })
    event.preventDefault()
  }

  handleChangeSalt(event) {
    this.setState({
      salt: event.target.value
    })
    event.preventDefault()
  }

  handleVote(event) {
    let voteSecret = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [this.state.voteOption, this.state.salt]).toString('hex')
    this.props.dispatchPlaceVote(this.props.campaign, voteSecret)
    event.preventDefault()
  }

  handleReveal(event) {
    this.props.dispatchRevealVote(this.props.campaign, this.state.voteOption, this.state.salt)
    event.preventDefault()
  }

  render() {
    if (this.props.account.isAdmin) {
      return (
        <div className={'Vote mt-3 ' + this.props.campaign.approvalState}>
          <div>
            <div>
              Approval Status:
            {
              (Object.prototype.hasOwnProperty.call(this.props.campaign, 'approvalState'))
                ? <span className="status ml-auto">
                  <FontAwesomeIcon className="status-icon" icon="circle" />
                  {this.props.campaign.approvalState}
                </span> : ''
            }
            </div>
            {
              (this.props.campaign.approvalState === 'Commit')
                ? <div> {this.props.campaign.numVoteSecrets} {(this.props.campaign.numVoteSecrets === 1) ? 'vote has' : 'votes have'} been placed </div> : null
            }
            {
              (this.props.campaign.approvalState === 'Reveal')
                ? <div> {this.props.campaign.numVoteReveals} {(this.props.campaign.numVoteReveals === 1) ? 'vote has' : 'votes have'} been revealed </div> : null
            }

          </div>

        {
          ((this.props.campaign.approvalState === 'Commit' && !this.props.campaign.hasVoted) || (this.props.campaign.approvalState === 'Reveal' && !this.props.campaign.hasRevealed))
            ? (<div className="mt-3">
              <form>
                <div className="form-row">
                  <div className="col-auto d-flex align-items-center">
                    <label className="mb-0">Place Vote:</label>
                  </div>
                  <div className="col-sm-3">
                      <input
                          type="number"
                          className="form-control"
                          placeholder="Salt"
                          value={this.state.salt}
                          onChange={this.handleChangeSalt}
                        />
                  </div>

                  <div className="col-auto">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons" onClick={this.handleChangeVoteOption}>
                      <label className="btn btn-outline-success active">
                        <input type="radio" name="voteOptions" id="approve" autoComplete="off"/>Approve
                      </label>
                      <label className="btn btn-outline-danger">
                        <input type="radio" name="voteOptions" id="reject" autoComplete="off"/>Reject
                      </label>
                    </div>
                  </div>

                  {
                    (this.props.campaign.approvalState === 'Commit')
                      ? (
                      <div className="col-auto">
                        <button type="submit" className={'btn btn-outline-' + ((this.state.voteOption) ? 'success' : 'danger')} onClick={this.handleVote}>
                          Vote
                        </button>
                      </div>
                      ) : null
                  }
                  {
                    (this.props.campaign.approvalState === 'Reveal')
                      ? (
                      <div className="col-auto">
                        <button type="submit" className="btn btn-outline-primary" onClick={this.handleReveal}>
                          Reveal
                        </button>
                      </div>
                      ) : ''
                  }

                </div>
              </form>
            </div>
            ) : null
          }
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
    account: state.account
  }
}

const mapDispathToProps = (dispatch) => {
  return {
    dispatchPlaceVote: (campaign, voteSecret) => {
      dispatch(placeVote(campaign, voteSecret))
    },
    dispatchRevealVote: (campaign, voteOption, salt) => {
      dispatch(revealVote(campaign, voteOption, salt))
    }
  }
}

export default drizzleConnect(Vote, mapStateToProps, mapDispathToProps)
