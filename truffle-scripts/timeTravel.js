let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')
const DURATION = 5 * 24 * 60 * 60

function increaseTime(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: 0
      },
      (err1) => {
        console.log(`timestamp 2: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
        if (err1) return reject(err1)

        web3.currentProvider.sendAsync(
          {
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1
          },
          (err2, res) => {
            console.log(`timestamp 3: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
            return err2 ? reject(err2) : resolve(res)
          }
        )
      }
    )
  })
}

module.exports = function (callback) {
  const accounts = web3.eth.accounts

  let EthFundMeInstance
  let CampaignInstances = []

  console.log(`timestamp 1: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)

  increaseTime(DURATION)
    .then(() => {
      console.log(`timestamp 4: ${web3.eth.getBlock(web3.eth.blockNumber).timestamp}`)
      return EthFundMe.deployed()
    })
    .then((instance) => {
      EthFundMeInstance = instance
      return EthFundMeInstance.getNumCampaigns.call({ from: accounts[0] })
    })
    .then((numCampaigns) => {
      let transitionCampaignPromises = []
      for (let i = 0; i < numCampaigns; i++) {
        let transitionCampaignPromise = EthFundMeInstance.campaigns
          .call(i, { from: accounts[0] })
          .then((campaignAddress) => {
            Campaign.at(campaignAddress).transitionCampaign({ from: accounts[0] })
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
