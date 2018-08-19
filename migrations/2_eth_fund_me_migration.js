var CampaignFactory = artifacts.require('CampaignFactory')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(CampaignFactory)
}
