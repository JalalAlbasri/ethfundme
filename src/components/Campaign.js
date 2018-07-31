import React, { Component } from 'react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'
import Web3 from '../../node_modules/web3'

class Campaign extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign.at(this.props.address).then((instance) => {
        CampaignInstance = instance
        return CampaignInstance.title.call()
      }).then((title) => {
        console.log(`title: ${title}`)
        this.title = title
      })
    })
  }

  render() {
    return (
      <li>
        {this.title} {this.props.address}
      </li>
    )
  }
}

Campaign.propTypes = {
  address: PropTypes.string.isRequired
}

export default Campaign
