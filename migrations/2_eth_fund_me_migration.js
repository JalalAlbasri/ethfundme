var EthFundMe = artifacts.require('EthFundMe')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(EthFundMe).then(function () {
  // deployer.deploy(EthFundMe, [accounts[0], accounts[1], accounts[2]]).then(function () {

  })

  // deply EthFundMe then deploy Campaign
}
