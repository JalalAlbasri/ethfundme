import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { updateCampaign } from '../actions/CampaignActions'
import GoalProgress from './GoalProgress'
import Vote from './Vote'

const CAMPAIGN_STATES = {
  0: 'Pending',
  1: 'Active',
  2: 'Successful',
  3: 'Unsuccessful',
  4: 'Cancelled'
}

class Campaign extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatchUpdateCampaign(this.props.campaign.address)
  }

  render() {
    let duration
    if (this.props.campaign.duration) {
      duration = this.props.campaign.duration / (60 * 60 * 24)
    }

    return (
      <div className={'Campaign card border-warning mb-3 ' + CAMPAIGN_STATES[this.props.campaign.campaignState]}>
        <div className="card-header h6 bg-transparent d-flex">
          <span className="mr-auto">{this.props.campaign.title}</span>
          {
            (Object.prototype.hasOwnProperty.call(this.props.campaign, 'campaignState'))
              ? <span className="status ml-auto">
                {CAMPAIGN_STATES[this.props.campaign.campaignState]}
                <FontAwesomeIcon className="status-icon" icon="circle" />
              </span> : ''
          }
        </div>
        <div className="card-body">
          <div className="row" >
            <div className="col-md-8">
              <p> Address: {this.props.campaign.address} </p>
              <p> Manager: {this.props.campaign.manager} </p>
            </div>
            <div className="details col-md-4">
              { duration
                ? <p>{duration} day{duration > 1 ? 's' : ''}</p>
                : ''
              }
              <p> {this.props.campaign.funds} eth raised of {this.props.campaign.goal} eth</p>
            </div>

          </div>
          {
            (this.props.campaign.funds >= 0)
              ? <GoalProgress funds={this.props.campaign.funds} goal={this.props.campaign.goal} /> : ''
          }
        </div>
        {/* TODO: Don't show the footer unless there's content in it */}
        <div className="card-footer bg-transparent">
          <Vote i={this.props.i}/>
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
    dispatchUpdateCampaign: (address) => {
      dispatch(updateCampaign(address))
    }
  }
}

export default drizzleConnect(Campaign, mapStateToProps, mapDispatchToProps)
