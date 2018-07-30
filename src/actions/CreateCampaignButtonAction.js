import { browserHistory } from 'react-router'
import { createBrowserHistory } from 'history'

const contract = require('truffle-contract')

import EthFundMeContract from '../../build/contracts/EthFundMe.json'
import store from '../store'

export const CAMPAIGN_CREATED = 'CAMPAIGN_CREATED'

function campaignCreated(campaign) {
  return {
    type: CAMPAIGN_CREATED,
    payload: campaign
  }
}

export function createCampaign() {
  console.log('createCampaign()')
  // return browserHistory.push('/')
  // let web3 = store.getState().web3.web3Instance

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {
    return function (dispatch) {
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
          console.log(store.getState())
          console.log(result)
          return dispatch(campaignCreated(result))
        }).catch((err) => {
          console.log(err)
          return createBrowserHistory()
        })
      })
    }
  }
  return null

  // return createBrowserHistory()
}
