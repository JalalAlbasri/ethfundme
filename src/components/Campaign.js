import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { updateCampaign } from '../actions/CampaignActions'

import GoalProgress from './GoalProgress'
import Vote from './Vote'
import Contributions from './Contributions'
import Contribute from './Contribute'
import CampaignEndDate from './CampaignEndDate'
import Withdraw from './Withdraw'

class Campaign extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // this.props.dispatchUpdateCampaign(this.props.campaign.address)
  }

  render() {
    let duration
    if (this.props.campaign.duration) {
      duration = this.props.campaign.duration / (60 * 60 * 24)
    }

    return (
      <div className={'Campaign card mb-3 ' + this.props.campaign.campaignState}>
        <div className="card-header h6 bg-transparent d-flex">
          <span className="mr-auto">#{this.props.campaign.campaignIndex} {this.props.campaign.title}</span>
          {
            (Object.prototype.hasOwnProperty.call(this.props.campaign, 'campaignState'))
              ? <span className="status ml-auto">
                <FontAwesomeIcon className="status-icon" icon="circle" />
                {this.props.campaign.campaignState}
              </span> : ''
          }
        </div>
        <div className="card-body lead">
          <div className="row mb-3">
            <div className="col-md-8">
              <div> Address: {this.props.campaign.address} </div>
              <div> Manager: {this.props.campaign.manager} </div>
            </div>
            <div className="details col-md-4">
              { duration
                ? <div>duration {duration} day{duration > 1 ? 's' : ''}</div>
                : ''
              }
              <CampaignEndDate endDate={this.props.campaign.endDate} />
            </div>

          </div>
          {
            (this.props.campaign.funds >= 0)
              ? <GoalProgress funds={this.props.campaign.funds} goal={this.props.campaign.goal} /> : ''
          }
        </div>

        {(this.props.campaign.contributions || {}).length > 0
            && <Contributions contributions={this.props.campaign.contributions} />}

        {/* TODO: Don't show the footer unless there's content in it */}

        <Contribute campaign={this.props.campaign} />
        <Withdraw campaign={this.props.campaign} />
        <Vote campaign={this.props.campaign}/>

      </div>
    )
  }
}


Campaign.propTypes = {
  campaign: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
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
