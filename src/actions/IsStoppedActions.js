export const TOGGLE_IS_STOPPED = 'TOGGLE_IS_STOPPED'

const contract = require('truffle-contract')

import CampaignFactoryContract from '../../build/contracts/CampaignFactory.json'
import { inLogs } from 'zeppelin-solidity/test/helpers/expectEvent'

function isStoppedToggled() {
  return {
    type: TOGGLE_IS_STOPPED
  }
}

export function getIsStopped() {
  console.log('getIsStopped()')
  return function (dispatch, getState) {
    const web3CampaignFactory = contract(CampaignFactoryContract)
    web3CampaignFactory.setProvider(web3.currentProvider)

    web3.eth.getCoinbase(async (err, coinbase) => {
      if (err) {
        console.log(err)
      }

      let instance = await web3CampaignFactory.deployed()
      let isStopped = await instance.isStopped.call({ from: coinbase })

      console.log(`isStopped: ${isStopped}`)

      if (isStopped !== getState().isStopped) {
        dispatch(isStoppedToggled())
      }
    })
  }
}

export function toggleIsStopped() {
  return function (dispatch, getState) {
    const web3CampaignFactory = contract(CampaignFactoryContract)
    web3CampaignFactory.setProvider(web3.currentProvider)

    web3.eth.getCoinbase(async (err, coinbase) => {
      if (err) {
        console.log(err)
      }

      let instance = await web3CampaignFactory.deployed()

      if (getState().isStopped) {
        let receipt = await instance.resumeContract({ from: coinbase })
        await inLogs(receipt.logs, 'LogContractResumed')
      } else {
        let receipt = await instance.stopContract({ from: coinbase })
        await inLogs(receipt.logs, 'LogContractStopped')
      }
      dispatch(isStoppedToggled())
    })
  }
}
