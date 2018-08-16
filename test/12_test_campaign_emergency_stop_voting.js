let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

contract('Campaign Emergency Stop Voting', (accounts) => {
  let EthFundMeInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = true
  let voteOption1 = true
  let voteOption2 = true

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

  before('setup and reject campaign', (done) => {
    EthFundMe.deployed()
      .then((instance) => {
        EthFundMeInstance = instance
        return EthFundMeInstance.addAdminRole(accounts[1], { from: accounts[0] })
      })
      .then(() => {
        return EthFundMeInstance.addAdminRole(accounts[2], { from: accounts[1] })
      })
      .then(() => {
        return EthFundMeInstance.createCampaign(
          'test campaign',
          10,
          1,
          'test campaign description',
          'test image url',
          { from: accounts[3] }
        )
      })
      .then(() => {
        return EthFundMeInstance.campaigns.call(0)
      })
      .then((campaignAddress) => {
        CampaignInstance = Campaign.at(campaignAddress)
        return CampaignInstance.vote(voteSecret0, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret1, { from: accounts[1] })
      })
      .then(() => {
        done()
      })
  })

  it('should try to stop the contract from a non admin account and fail', (done) => {
    CampaignInstance.stopContract({ from: accounts[3] }).catch((e) => {
      CampaignInstance.isStopped.call().then((isStopped) => {
        assert.equal(isStopped, false, 'campaign should not be stopped')
        done()
      })
    })
  })

  it('should stop the campaign', (done) => {
    CampaignInstance.stopContract({ from: accounts[1] })
      .then(() => {
        return CampaignInstance.isStopped.call()
      })
      .then((isStopped) => {
        assert.equal(isStopped, true, 'campaign should be stopped')
        done()
      })
  })

  // it should attempt to vote on stopped campaign and fail
  it('should attempt to vote on stopped campaign and fail', (done) => {
    CampaignInstance.vote(voteSecret2, { from: accounts[2] })
      .catch((e) => {
        return CampaignInstance.numVoteSecrets.call()
      })
      .then((numVoteSecrets) => {
        assert.equal(numVoteSecrets, 2, 'there should be 2 votes')
        done()
      })
  })

  it('should resume the campaign', (done) => {
    CampaignInstance.resumeContract({ from: accounts[1] })
      .then(() => {
        return CampaignInstance.isStopped.call()
      })
      .then((isStopped) => {
        assert.equal(isStopped, false, 'campaign should be resumed')
        done()
      })
  })

  // it should be able to vote on resumed campaign
  it('should place a vote from accounts[1]', (done) => {
    CampaignInstance.vote(voteSecret2, { from: accounts[2] }).then(() => {
      return CampaignInstance.voteSecrets.call(accounts[2]).then((voteSecret) => {
        assert.equal(voteSecret, voteSecret2, 'voteSecret should match voteSecret2')
        done()
      })
    })
  })

  // it should stop campaign
  it('should stop the campaign', (done) => {
    CampaignInstance.stopContract({ from: accounts[1] })
      .then(() => {
        return CampaignInstance.isStopped.call()
      })
      .then((isStopped) => {
        assert.equal(isStopped, true, 'campaign should be stopped')
        done()
      })
  })

  // it should attempt to reveal vote on stopped campaign and fail
  it('should attempt to reveal a vote while stopped and fail', (done) => {
    CampaignInstance.reveal(voteOption0, salt, { from: accounts[0] })
      .catch((e) => {
        return CampaignInstance.numVoteReveals.call()
      })
      .then((numVoteReveals) => {
        assert.equal(numVoteReveals, 0, 'there should be no reveals')
        done()
      })
  })

  it('should resume the campaign', (done) => {
    CampaignInstance.resumeContract({ from: accounts[1] })
      .then(() => {
        return CampaignInstance.isStopped.call()
      })
      .then((isStopped) => {
        assert.equal(isStopped, false, 'campaign should be resumed')
        done()
      })
  })

  it('it should be able to reveal vote on resumed campaign', (done) => {
    CampaignInstance.reveal(voteOption0, salt, { from: accounts[0] })
      .then((e) => {
        return CampaignInstance.numVoteReveals.call()
      })
      .then((numVoteReveals) => {
        assert.equal(numVoteReveals, 1, 'there should 1 reveal')
        done()
      })
  })
})
