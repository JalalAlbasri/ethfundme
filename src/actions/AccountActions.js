export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'

const contract = require('truffle-contract')
import CampaignFactoryContract from '../../build/contracts/CampaignFactory.json'

import { inLogs } from 'zeppelin-solidity/test/helpers/expectEvent'

function accountUpdated(account) {
  return {
    type: UPDATE_ACCOUNT,
    account
  }
}

export function getAccountDetails(address) {
  return function (dispatch) {
    const web3CampaignFactory = contract(CampaignFactoryContract)
    web3CampaignFactory.setProvider(web3.currentProvider)
    let CampaignFactoryInstance

    let account = {
      address
    }

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3CampaignFactory.deployed().then((instance) => {
        console.log(`instance.address: ${instance.address}`)
        CampaignFactoryInstance = instance
        return new Promise((resolve, reject) => {
          web3.eth.getBalance(coinbase, (err, balance) => {
            if (err) {
              reject(err)
            } else {
              resolve(balance)
            }
          })
        })
          .then((balance) => {
            account.balance = Number(web3.fromWei(balance))
            return CampaignFactoryInstance.isAdmin.call(address, { from: coinbase })
          })
          .then((isAdmin) => {
            account.isAdmin = isAdmin
            // setTimeout(() => dispatch(accountUpdated(account)), 5000)
            dispatch(accountUpdated(account))
          })
          .catch((err) => {
            console.log(err)
          })
      })
    })
  }
}

export function changeAdminRole(address, action) {
  return function (dispatch) {
    const web3CampaignFactory = contract(CampaignFactoryContract)
    web3CampaignFactory.setProvider(web3.currentProvider)

    web3.eth.getCoinbase(async (err, coinbase) => {
      if (err) {
        console.log(err)
      }

      const instance = await web3CampaignFactory.deployed()

      if (action === 'GRANT') {
        console.log('adding admin')
        const receipt = await instance.addAdminRole(address, { from: coinbase })
        await inLogs(receipt.logs, 'LogAdminAdded')
      } else {
        console.log('removing admin')
        const receipt = await instance.removeAdminRole(address, { from: coinbase })
        await inLogs(receipt.logs, 'LogAdminRemoved')
      }

      dispatch(getAccountDetails)
    })
  }
}

// export function removeAdmin(address) {
//   return function (dispatch) {
//     const web3CampaignFactory = contract(CampaignFactoryContract)
//     web3CampaignFactory.setProvider(web3.currentProvider)

//     web3.eth.getCoinbase(async (err, coinbase) => {
//       if (err) {
//         console.log(err)
//       }

//       const instance = await web3.CampaignFactory.deployed()
//       const receipt = await instance.addAdminRole(address, { from: coinbase })
//       await inLogs(receipt.logs, 'LogAdminAdded')
//       setTimeout(() => dispatch(accountUpdated), 5000)
//     })
//   }
// }
