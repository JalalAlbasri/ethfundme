import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

import { updateCampaign } from '../actions/CampaignActions'

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
          return CampaignInstance.manager.call({ from: coinbase })
        })
        .then((manager)=> {
          this.campaign.manager = manager
          this.props.dispatchUpdateCampaign(this.campaign)
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
        <p> manager: {this.campaign.manager} </p>
      </li>
    )
  }
}

Campaign.propTypes = {
  address: PropTypes.string.isRequired
}

const mapStateToProps = (state) => {
  return {
    campaign: PropTypes.object.isRequired
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
