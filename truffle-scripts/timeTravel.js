let CampaignFactory = artifacts.require('CampaignFactory')
let Campaign = artifacts.require('Campaign')
// let { increaseTime } = require('zeppelin-solidity/test/helpers/increaseTime')

const FIVE_DAYS = 5 * 24 * 60 * 60

function increaseTime(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: id
      },
      (err1) => {
        if (err1) return reject(err1)

        web3.currentProvider.sendAsync(
          {
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1
          },
          (err2, res) => {
            return err2 ? reject(err2) : resolve(res)
          }
        )
      }
    )
  })
}

module.exports = function (callback) {
  const accounts = web3.eth.accounts

  let CampaignFactoryInstance

  increaseTime(FIVE_DAYS)
    .then(() => {
      return CampaignFactory.deployed()
    })
    .then((instance) => {
      CampaignFactoryInstance = instance
      return CampaignFactoryInstance.getNumCampaigns.call({ from: accounts[0] })
    })
    .then((numCampaigns) => {
      let transitionCampaignPromises = []

      for (let i = 0; i < numCampaigns; i++) {
        let transitionCampaignPromise = CampaignFactoryInstance.campaigns
          .call(i, { from: accounts[0] })
          .then((campaignAddress) => {
            console.log(`transitionCampaign ${i}`)
            return Campaign.at(campaignAddress)
          }).then((campaignInstance) => {
            campaignInstance.transitionCampaign({ from: accounts[0] })
          })
        transitionCampaignPromises.push(transitionCampaignPromise)
      }

      return Promise.all(transitionCampaignPromises)
    })
    .then(() => {
      callback()
    })
    .catch((err) => {
      console.log(err)
      callback(err)
    })
}
