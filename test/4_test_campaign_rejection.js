let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

contract('Campaign Rejection', accounts => {
  let EthFundMeInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = false
  let voteOption1 = false
  let voteOption2 = true

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

  before('setup and reject campaign', done => {
    EthFundMe.deployed().then(instance => {
      EthFundMeInstance = instance
      return EthFundMeInstance.createCampaign('test campaign', 10, 1, { from: accounts[3] })
    })
      .then(() => {
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(campaignAddress => {
        CampaignInstance = Campaign.at(campaignAddress)
        return CampaignInstance.vote(voteSecret0, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret1, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret2, { from: accounts[2] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption0, salt, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption0, salt, { from: accounts[1] })
      })
      .then(() => {
        done()
      })
  })

  it('should set approval state correctly to Rejected', done => {
    CampaignInstance.approvalState.call().then(approvalState => {
      assert.equal(approvalState, 3, 'approvalState should be 3 (Rejected)')
      done()
    })
  })

  it('should set campaign state correctly to Unsuccessful', done => {
    CampaignInstance.campaignState.call().then(campaignState => {
      assert.equal(campaignState, 3, 'approvalState should be 3 (Unsuccessful)')
      done()
    })
  })
})

