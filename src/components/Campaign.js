import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { getCampaignDetails } from '../actions/CampaignActions'

import GoalProgress from './GoalProgress'
import Vote from './Vote'
import Contribution from './Contribution'

// TODO: Could just use an array for these, also, move them out to antoher file
const CAMPAIGN_STATES = {
  0: 'Pending',
  1: 'Active',
  2: 'Successful',
  3: 'Unsuccessful',
  4: 'Cancelled'
}

const APPROVAL_STATES = {
  0: 'Commit',
  1: 'Reveal',
  2: 'Approved',
  3: 'Rejected',
  4: 'Cancelled'
}

class Campaign extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatchGetCampaignDetails(this.props.campaign.address)
  }

  render() {
    let duration
    if (this.props.campaign.duration) {
      duration = this.props.campaign.duration / (60 * 60 * 24)
    }

    return (
      <div className={'Campaign card mb-3 ' + CAMPAIGN_STATES[this.props.campaign.campaignState]}>
        <div className="card-header h6 bg-transparent d-flex">
          <span className="mr-auto">{this.props.campaign.title}</span>
          {
            (Object.prototype.hasOwnProperty.call(this.props.campaign, 'campaignState'))
              ? <span className="status ml-auto">
                <FontAwesomeIcon className="status-icon" icon="circle" />
                {CAMPAIGN_STATES[this.props.campaign.campaignState]}
              </span> : ''
          }
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-8">
              <div> Address: {this.props.campaign.address} </div>
              <div> Manager: {this.props.campaign.manager} </div>
            </div>
            <div className="details col-md-4">
            {/* TODO: countdown timer */}
              { duration
                ? <div>{duration} day{duration > 1 ? 's' : ''}</div>
                : ''
              }
              <div> {this.props.campaign.funds} eth raised of {this.props.campaign.goal} eth</div>
            </div>

          </div>
          {
            (this.props.campaign.funds >= 0)
              ? <GoalProgress funds={this.props.campaign.funds} goal={this.props.campaign.goal} /> : ''
          }
        </div>
        {/* TODO: Don't show the footer unless there's content in it */}


       {console.log(`this.props.campaign: ${JSON.stringify(this.props.campaign)}`)}

        <div className="Contributions">
          {(this.props.campaign.contributions || {}).length > 0
            && this.props.campaign.contributions.map((contribution, i) => (
              <Contribution
                key={i}
                campaignIndex={this.props.i}
                contributionIndex={i}
              />
            ))
          }
        </div>

        <div className="card-footer">
        {/* TODO: Change i to campaignId */}
          <Vote campaignIndex={this.props.i}/>
        </div>
      </div>
    )
  }
}


Campaign.propTypes = {
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    campaign: state.campaigns[ownProps.i]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchGetCampaignDetails: (address) => {
      dispatch(getCampaignDetails(address))
    }
  }
}

export default drizzleConnect(Campaign, mapStateToProps, mapDispatchToProps)
