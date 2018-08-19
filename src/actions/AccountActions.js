export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'

const contract = require('truffle-contract')
import CampaignFactoryContract from '../../build/contracts/CampaignFactory.json'

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
            dispatch(accountUpdated(account))
          }).catch((err) => {
            console.log(err)
          })
      })
    })
  }
}
