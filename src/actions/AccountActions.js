export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'

const contract = require('truffle-contract')
import EthFundMeContract from '../../build/contracts/EthFundMe.json'

function accountUpdated(account) {
  return {
    type: UPDATE_ACCOUNT,
    account
  }
}

export function getAccountDetails(address) {
  return function (dispatch) {
    const web3EthFundMe = contract(EthFundMeContract)
    web3EthFundMe.setProvider(web3.currentProvider)
    let EthFundMeInstance

    let account = {
      address
    }

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3EthFundMe.deployed().then((instance) => {
        EthFundMeInstance = instance
        return EthFundMeInstance.isAdmin.call(address, { from: coinbase })
      })
        .then((isAdmin) => {
          account.isAdmin = isAdmin
          dispatch(accountUpdated(account))
        }).catch((err) => {
          console.log(err)
        })
    })
  }
}
