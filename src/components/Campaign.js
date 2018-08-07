import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

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

    console.log(`this.props.campaign: ${JSON.stringify(props.campaign)}`)
    console.log(`this.props.i: ${props.i}`)

    // this.campaign = {
    //   address: props.address,
    //   title: props.title,
    //   goal: props.goal,
    //   duration: props.duration,
    //   funds: props.funds,
    //   manager: props.manager
    // }
  }

  componentDidMount() {
    console.log('campaign mounted')
    this.props.dispatchUpdateCampaign(this.props.campaign.address)
    // const web3Campaign = contract(CampaignContract)
    // web3Campaign.setProvider(web3.currentProvider)
    // let CampaignInstance

    // web3.eth.getCoinbase((err, coinbase) => {
    //   if (err) {
    //     console.log(err)
    //   }
    //   web3Campaign.at(this.campaign.address)
    //     .then((instance) => {
    //       CampaignInstance = instance
    //       return CampaignInstance.title.call({ from: coinbase })
    //     })
    //     .then((title) => {
    //       this.campaign.title = title
    //       return CampaignInstance.goal.call({ from: coinbase })
    //     })
    //     .then((goal) => {
    //       this.campaign.goal = Number(goal)
    //       return CampaignInstance.duration.call({ from: coinbase })
    //     })
    //     .then((duration) => {
    //       this.campaign.duration = Number(duration)
    //       return CampaignInstance.funds.call({ from: coinbase })
    //     })
    //     .then((funds) => {
    //       this.campaign.funds = Number(funds)
    //       return CampaignInstance.campaignState.call({ from: coinbase })
    //     })
    //     .then((status) => {
    //       this.campaign.status = CAMPAIGN_STATES[Number(status)]
    //       return CampaignInstance.manager.call({ from: coinbase })
    //     })
    //     .then((manager) => {
    //       this.campaign.manager = manager
    //       this.props.dispatchUpdateCampaign(this.campaign)
    //     // TODO: Get Contributions, will only be able to interact with contributions once we have an approved campaign!
    //       //   return CampaignInstance.getNumContributions.call({ from: coinbase })
    //     // })
    //     // .then((numContributions) => {
    //     //   for (let i = 0; i < numContributions; i++) {
    //     //     CampaignInstance.contributions.call(i, { from: coinbase })
    //     //       .then((contribution) => {
    //     //         console.log(contribution)
    //     //       })
    //     //   }
    //     })
    // })
  }

  render() {
    let duration
    if (this.props.campaign.duration) {
      duration = this.props.campaign.duration / (60 * 60 * 24)
    }

    return (
      <div className={'Campaign card border-warning mb-3 ' + this.props.campaign.status}>
        <div className="card-header h6 bg-transparent d-flex">
          <span className="mr-auto">{this.props.campaign.title}</span>
          {
            (this.props.campaign.status)
              ? <span className="status ml-auto">
                {this.props.campaign.status}
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
          {/* <Vote address={this.props.campaign.address}/> */}
        </div>
      </div>
    )
  }
}


Campaign.propTypes = {
  campaign: PropTypes.object.isRequired
  // address: PropTypes.string.isRequired,
  // title: PropTypes.string,
  // goal: PropTypes.number,
  // duration: PropTypes.number,
  // funds: PropTypes.number,
  // status: PropTypes.string,
  // manager: PropTypes.string
}

const mapStateToProps = (state, ownProps) => {
  console.log(`campaign, mapStateToProps, ownProps.i: ${ownProps.i}`)
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
