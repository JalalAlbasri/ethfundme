let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

contract('Campaign Cancellation Before Approval', accounts => {
  let EthFundMeInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = true
  let voteOption1 = true
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
        done()
      })
  })

  it('should cancel the campaign and state should be set to Cancelled', done => {
    CampaignInstance.cancelCampaign({ from: accounts[3] }).then(() => {
      return CampaignInstance.campaignState.call()
    }).then(campaignState => {
      assert.equal(campaignState, 4, 'campaignState should be 4 (Cancelled)')
      done()
    })
  })

  it('should should have set the approval state to Cancelled', done => {
    CampaignInstance.approvalState.call()
      .then(approvalState => {
        assert.equal(approvalState, 4, 'approvalState should be 4 (Cancelled)')
        done()
      })
  })

  it('should not allow Admin to vote on cancelled campaign', done => {
    CampaignInstance.vote(voteSecret1, { from: accounts[1] }).catch((e) => {
      return CampaignInstance.numVoteSecrets.call()
    }).then(numVoteSecrets => {
      assert.equal(numVoteSecrets, 1, 'numVotes should be 1')
      done()
    })
  })
})
