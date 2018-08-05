import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

import { updateCampaign } from '../actions/CampaignActions'

const CAMPAIGN_STATES = {
  0: 'Pending',
  1: 'Active',
  2: 'Successful',
  3: 'Unsuccessful',
  4: 'Cancelled'
}

function GoalProgress(props) {
  if (props.funds <= props.goal) {
    const progress = props.funds / props.goal * 100

    const progressBarStyle = {
      width: progress + '%'
    }

    return (
      <div className="progress">
        <div className="progress-bar progress-bar-striped"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={progress}
          aria-valuemax="100"
          style={progressBarStyle}
        >
          {props.funds}
        </div>
      </div>
    )
  }

  const goalProgress = (props.goal / props.funds) * 100
  const surplusProgress = ((props.funds - props.goal) / props.funds) * 100

  const goalProgressBarStyle = {
    width: goalProgress + '%'
  }

  const surplusProgressBarStyle = {
    width: surplusProgress + '%'
  }

  return (
      <div className="progress">
        <div className="progress-bar progress-bar-striped"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={goalProgress}
          aria-valuemax="100"
          style={goalProgressBarStyle}
        >
          {props.goal}
        </div>
        <div className="progress-bar progress-bar-striped bg-success"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={surplusProgress}
          aria-valuemax="100"
          style={surplusProgressBarStyle}
        >
          {props.funds - props.goal}
        </div>
      </div>
  )
}

class Campaign extends Component {
  constructor(props) {
    super(props)
    this.campaign = {
      address: props.address,
      title: props.title,
      goal: props.goal,
      duration: props.duration,
      funds: props.funds,
      manager: props.manager
    }
  }

  componentDidMount() {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign.at(this.campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.title.call({ from: coinbase })
        })
        .then((title) => {
          this.campaign.title = title
          return CampaignInstance.goal.call({ from: coinbase })
        })
        .then((goal) => {
          this.campaign.goal = Number(goal)
          return CampaignInstance.duration.call({ from: coinbase })
        })
        .then((duration) => {
          this.campaign.duration = Number(duration)
          return CampaignInstance.funds.call({ from: coinbase })
        })
        .then((funds) => {
          this.campaign.funds = Number(funds)
          return CampaignInstance.campaignState.call({ from: coinbase })
        })
        .then((status) => {
          this.campaign.status = CAMPAIGN_STATES[Number(status)]
          return CampaignInstance.manager.call({ from: coinbase })
        })
        .then((manager) => {
          this.campaign.manager = manager
          this.props.dispatchUpdateCampaign(this.campaign)
        // TODO: Get Contributions, will only be able to interact with contributions once we have an approved campaign!
          //   return CampaignInstance.getNumContributions.call({ from: coinbase })
        // })
        // .then((numContributions) => {
        //   for (let i = 0; i < numContributions; i++) {
        //     CampaignInstance.contributions.call(i, { from: coinbase })
        //       .then((contribution) => {
        //         console.log(contribution)
        //       })
        //   }
        })
    })
  }

  render() {
    let duration
    if (this.campaign.duration) {
      duration = this.campaign.duration / (60 * 60 * 24)
    }

    this.campaign.funds = 15
    this.campaign.goal = 10

    return (
      <div className={'Campaign card border-warning mb-3 ' + this.campaign.status}>
        <div className="card-header h5 bg-transparent border-warning d-flex">
          <span className="mr-auto">{this.campaign.title}</span>
          <span className="status ml-auto">
            {this.campaign.status}
            <FontAwesomeIcon className="status-icon" icon="circle" />
          </span>
        </div>
        <div className="card-body">
          <div className="row" >
            <div className="col-md-8">
              <p> Address: {this.campaign.address} </p>
              <p> Manager: {this.campaign.manager} </p>
            </div>
            <div className="details col-md-4">
              { duration
                ? <p>{duration} day{duration > 1 ? 's' : ''}</p>
                : ''
              }
              <p> {this.campaign.funds} eth raised of {this.campaign.goal} eth</p>
            </div>

          </div>
          {
            (this.campaign.funds >= 0)
              ? <GoalProgress funds={this.campaign.funds} goal={this.campaign.goal} /> : ''
          }
        </div>
      </div>
    )
  }
}


Campaign.propTypes = {
  address: PropTypes.string.isRequired,
  title: PropTypes.string,
  goal: PropTypes.number,
  duration: PropTypes.number,
  funds: PropTypes.number,
  status: PropTypes.string,
  manager: PropTypes.string
}

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchUpdateCampaign: (campaign) => {
      dispatch(updateCampaign(campaign))
    }
  }
}

export default drizzleConnect(Campaign, mapStateToProps, mapDispatchToProps)
