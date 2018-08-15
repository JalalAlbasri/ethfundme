import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { contribute } from '../actions/CampaignActions'

class Contribute extends Component {
  constructor(props, context) {
    super(props)

    this.state = {
      contribution: ''
    }

    this.handleChangeContribution = this.handleChangeContribution.bind(this)
    this.handleContribute = this.handleContribute.bind(this)
  }

  handleChangeContribution(event) {
    this.setState({
      contribution: event.target.value
    })
    event.preventDefault()
  }

  handleContribute(event) {
    this.props.dispatchContribute(
      this.props.campaign,
      this.state.contribution ? this.state.contribution : 1
    )
    event.preventDefault()
  }

  render() {
    if (
      !this.props.account.isAdmin
      && web3.toChecksumAddress(this.props.account.address)
        !== web3.toChecksumAddress(this.props.campaign.manager)
      && this.props.campaign.campaignState === 'Active'
      && !this.props.campaign.isStopped
    ) {
      return (
        <div className="Contribute container mt-3">
          <form>
            <div className="form-row">
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Contribution"
                  value={this.state.contribution}
                  onChange={this.handleChangeContribution}
                />
              </div>
              <div className="col-md-auto">
                <button
                  type="submit"
                  className="btn btn-outline-success"
                  onClick={this.handleContribute}
                  disabled={this.props.campaign.isStopped}
                >
                  <FontAwesomeIcon className="button-icon" icon="gift" />
                  Contribute
                </button>
              </div>
            </div>
          </form>
        </div>
      )
    }
    return null
  }
}

Contribute.contextTypes = {
  drizzle: PropTypes.object
}

Contribute.propTypes = {
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
    dispatchContribute: (campaign, contribution) => {
      dispatch(contribute(campaign, contribution))
    }
  }
}

export default drizzleConnect(Contribute, mapStateToProps, mapDispathToProps)
