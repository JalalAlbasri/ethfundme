var EthFundMe = artifacts.require("EthFundMe");
var Campaign = artifacts.require("Campaign");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(EthFundMe, [accounts[0], accounts[1], accounts[2]]).then(function () {
    
  });
  //deply EthFundMe then deploy Campaign
};
