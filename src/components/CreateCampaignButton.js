import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import EthFundMeContract from '../../build/contracts/EthFundMe.json'

import { addCampaign } from '../actions/CampaignActions'

class CreateCampaignButton extends Component {
  constructor(props, context) {
    super(props)
    this.handleCreateCampaignClick = this.handleCreateCampaignClick.bind(this)
  }

  handleCreateCampaignClick(event) {
    event.preventDefault()
    const web3EthFundMe = contract(EthFundMeContract)
    web3EthFundMe.setProvider(web3.currentProvider)
    let EthFundMeInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3EthFundMe.deployed().then((instance) => {
        EthFundMeInstance = instance
        return EthFundMeInstance.createCampaign('web campaign', 10, 1, { from: coinbase })
      }).then((result) => {
        const campaignAddress = result.logs[0].args.campaignAddress
        this.props.dispatchAddCampaign(campaignAddress)
      }).catch((err) => {
        console.log(err)
      })
    })
  }

  render() {
    return <button onClick={(event) => this.handleCreateCampaignClick(event)}>CreateCampaign</button>
  }
}

CreateCampaignButton.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = (state, ownProps) => {
  return {
    EthFundMe: state.contracts.EthFundMe
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchAddCampaign: (address) => {
      dispatch(addCampaign(address))
    }
  }
}

export default drizzleConnect(
  CreateCampaignButton,
  mapStateToProps,
  mapDispatchToProps
)
