import React, {Component} from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

const contract = require('truffle-contract')
import EthFundMeContract from '../../build/contracts/EthFundMe.json'
import CampaignContract from '../../build/contracts/Campaign.json'


class CreateCampaignButton extends Component {
  constructor(props, context) {
    super(props)
    this.drizzle = context.drizzle
    console.log(`typeof context.drizzle: ${typeof context.drizzle}`)
    console.log(`typeof this.drizzle: ${typeof this.drizzle}`)
    this.handleCreateCampaignClick = this.handleCreateCampaignClick.bind(this);
  }

  handleCreateCampaignClick(event) {
    event.preventDefault()

    const drizzle = this.drizzle

    const ethfundme = contract(EthFundMeContract)
    ethfundme.setProvider(web3.currentProvider)
    let ethfundmeInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      ethfundme.deployed().then((instance) => {
        ethfundmeInstance = instance
        return ethfundmeInstance.createCampaign('web campaign', 10, 1, { from: coinbase })
      }).then((result) => {

        
        console.log(`campaignAddress: ${result.logs[0].args.campaignAddress}`)
        
        const campaignAddress = result.logs[0].args.campaignAddress
        
        let contractConfig = {
            contractName: campaignAddress,
            web3Contract: new web3.eth.contract(CampaignContract, campaignAddress)
          }
          
          let events = []
          
          drizzle.addContract({contractConfig, events})

        // let action = {type: 'ADD_CONTRACT', drizzle, contractConfig, events, web3}
        // this.props.onCreateCampaignClick(action)
        
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
    EthFundMe : state.contracts.EthFundMe
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateCampaignClick: (action) => {
      dispatch(action)
    }
  }
}

// const CreateCampaignButtonContainer = connect(
const CreateCampaignButtonContainer = drizzleConnect(
  CreateCampaignButton,
  mapStateToProps,
  mapDispatchToProps
)

export default CreateCampaignButtonContainer
