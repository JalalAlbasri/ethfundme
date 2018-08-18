let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

module.exports = function (callback) {
  const accounts = web3.eth.accounts

  let EthFundMeInstance
  let CampaignInstances = []

  EthFundMe.deployed()
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
}
