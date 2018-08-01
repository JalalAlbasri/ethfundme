import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

import { updateCampaign } from '../actions/CampaignActions'

const CAMPAIGN_STATES = {
  0: 'PENDING',
  1: 'ACTIVE',
  2: 'SUCCESSFUL',
  3: 'UNSUCCESSFUL',
  4: 'CANCELLED'
}

class Campaign extends Component {
  constructor(props) {
    super(props)
    console.log(`props.campaign: ${props.address}`)
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
    return (
      <li>
        <p> address: {this.campaign.address} </p>
        <p> title: {this.campaign.title} </p>
        <p> goal: {this.campaign.goal} </p>
        <p> duration: {this.campaign.duration} </p>
        <p> funds: {this.campaign.funds} </p>
        <p> status: {this.campaign.status} </p>
        <p> manager: {this.campaign.manager} </p>
      </li>
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
