var EthFundMe = artifacts.require('EthFundMe')
var Administrated = artifacts.require('Administrated')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(EthFundMe)

  // deployer.deploy(Administrated).then((instance) => {
  // deployer.deploy(EthFundMe, instance.address)
  // })

  // deployer.deploy(Administrated).then(() => {
  //   deployer.deploy(EthFundMe)
  // })

  // deployer.deploy(EthFundMe).then(function () {

  // deployer.deploy(EthFundMe, [accounts[0], accounts[1], accounts[2]]).then(function () {
  // })

  // deply EthFundMe then deploy Campaign
}
