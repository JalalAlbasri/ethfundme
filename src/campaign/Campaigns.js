import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { addCampaign } from './actions'
import Campaign from './Campaign'


class Campaigns extends Component {
  constructor(props, context) {
    super(props)
    console.log(`typeof context: ${typeof context}`)
    console.log(`typeof context.drizzle: ${typeof context.drizzle}`)
    this.drizzle = context.drizzle

    this.dataKey = this.drizzle.contracts.EthFundMe.methods.getNumCampaigns.cacheCall()
    this.numCampaigns = props.EthFundMe.getNumCampaigns[this.dataKey].value

    this.campaignDataKeys = []
    for (let i = 0; i < this.numCampaigns; i++) {
      this.campaignDataKeys[i] = this.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(i)
    }
  }

  componentDidMount() {
    this.drizzle.contracts.EthFundMe.methods.getNumCampaigns().call().then((numCampaigns) => {
      for (let i = 0; i < numCampaigns; i++) {
        this.drizzle.contracts.EthFundMe.methods.campaigns(i).call().then((address) => {
          console.log(`componentDidMount address: ${address}`)
          this.props.dispatchAddCampaign(address)
        })
      }
    })


    // const EthFundMe = this.props.EthFundMe
    // console.log(`this.numCampaigns: ${this.numCampaigns}`)

    // for (let i = 0; i < this.numCampaigns; i++) {
    //   if (this.campaignDataKeys[i] in EthFundMe.campaigns) {
    //     let address = EthFundMe.campaigns[this.campaignDataKeys[i]].value
    //   }
    // }

    // for (let i = 0; i < numCampaigns; i++) {
    // let dataKey = this.drizzle.contracts.EthFundMe.methods.campaigns.call(0)
    // console.log(`typeof dataKey: ${typeof dataKey}`)
    // console.log(`dataKey: ${dataKey}`)
    // console.log(dataKey in EthFundMe.campaigns)
    // // let dataKey = this.drizzle.contracts.EthFundMe.methods.campaigns.cacheCall(i)
    // let address = EthFundMe.campaigns[dataKey].value
    // this.props.dispatchAddCampaign(address)
    // this.props.dispatchAddCampaign(this.EthFundMe.campaigns[this.campaigns(i)].value)
    // }
  }

  render() {
    // const EthFundMe = this.props.EthFundMe
    // console.log(`this.numCampaigns: ${this.numCampaigns}`)

    // for (let i = 0; i < this.numCampaigns; i++) {
    //   if (this.campaignDataKeys[i] in EthFundMe.campaigns) {
    //     let address = EthFundMe.campaigns[this.campaignDataKeys[i]].value
    //     console.log(`address: ${address}`)
    //   }
    // }

    return (
      <ul>
        {this.props.campaigns.map((campaign) =>
          <Campaign
            key={campaign.address}
            {...campaign}
            />)}
      </ul>
    )
  }
}

Campaigns.contextTypes = {
  drizzle: PropTypes.object
}

Campaigns.propTypes = {
  campaigns: PropTypes.arrayOf(PropTypes.shape({
    address: PropTypes.string.isRequired
  }).isRequired).isRequired
}


const mapStateToProps = (state) => {
  console.log(state.campaigns)
  return {
    campaigns: state.campaigns,
    EthFundMe: state.contracts.EthFundMe
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchAddCampaign: (address) => {
      dispatch({
        type: 'ADD_CAMPAIGN',
        address
      })
    }
  }
}

export default drizzleConnect(Campaigns, mapStateToProps, mapDispatchToProps)
