/**
 * TEST #11: Test Campaign Emergency Stop During Voting
 *
 * In this test we test the Emergency Stop functionality of the Campaign Contract during the
 * Voting (CampaignState = Pending)
 *
 * We set up some admin accounts, create a campaign, then place 2 votes.
 *
 * We ensure that the Campaign cannot be stopped from a non Authorized account.
 *
 * We stop the Campaign and ensure that the state is changed accordingly.
 *
 * We ensure that votes cannot be placed on a Stopped Campaign.
 *
 * We resume the Campaign and ensure votes can be placed correctly again.
 *
 * We place the final vite and the Campaign moves into the Reveal Phase.
 *
 * We stop the Campaign and ensure that votes cannot be revealed during the Stopped State.
 *
 * Finally we resume the Campaign again and ensure that votes can be reveal once more.
 *
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')

contract('#12 Campaign Emergency Stop Voting', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = true
  let voteOption1 = true
  let voteOption2 = true

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

  before('setup and reject campaign', (done) => {
    CampaignFactory.deployed()
      .then((instance) => {
        CampaignFactoryInstance = instance
        return CampaignFactoryInstance.addAdminRole(accounts[1], { from: accounts[0] })
      })
      .then(() => {
        return CampaignFactoryInstance.addAdminRole(accounts[2], { from: accounts[1] })
      })
      .then(() => {
        return CampaignFactoryInstance.createCampaign(
          'test campaign',
          10,
          1,
          'test campaign description',
          'test image url',
          { from: accounts[3] }
        )
      })
      .then(() => {
        return CampaignFactoryInstance.campaigns.call(0)
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
    assertRevert(CampaignInstance.stopContract({ from: accounts[3] })).then(() => {
      done()
    })
  })

  it('should not have stopped the contract', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, false, 'campaign should not be stopped')
      done()
    })
  })

  it('should stop the campaign', (done) => {
    CampaignInstance.stopContract({ from: accounts[1] }).then(() => {
      done()
    })
  })

  it('should be in a stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, true, 'campaign should be stopped')
      done()
    })
  })

  it('should attempt to vote on stopped campaign and fail', (done) => {
    assertRevert(CampaignInstance.vote(voteSecret2, { from: accounts[2] })).then(() => {
      done()
    })
  })

  it('should not have placed a vote', (done) => {
    CampaignInstance.numVoteSecrets.call().then((numVoteSecrets) => {
      assert.equal(numVoteSecrets, 2, 'there should be 2 votes')
      done()
    })
  })

  it('should resume the campaign', (done) => {
    CampaignInstance.resumeContract({ from: accounts[1] }).then(() => {
      done()
    })
  })

  it('should no longer be in stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, false, 'campaign should not be stopped')
      done()
    })
  })

  it('should place a vote from accounts[1]', (done) => {
    CampaignInstance.vote(voteSecret2, { from: accounts[2] }).then(() => {
      done()
    })
  })

  it('should have set the voteSecret correctly', (done) => {
    CampaignInstance.voteSecrets.call(accounts[2]).then((voteSecret) => {
      assert.equal(voteSecret, voteSecret2, 'voteSecret should match voteSecret2')
      done()
    })
  })

  it('should stop the campaign', (done) => {
    CampaignInstance.stopContract({ from: accounts[1] }).then(() => {
      done()
    })
  })

  it('should be in a stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, true, 'campaign should be stopped')
      done()
    })
  })

  it('should attempt to reveal a vote while stopped and fail', (done) => {
    assertRevert(CampaignInstance.reveal(voteOption0, salt, { from: accounts[0] })).then(() => {
      done()
    })
  })

  it('should not have revealed a vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
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
      .then(() => {
        done()
      })
  })

  it('should have revealed the vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 1, 'there should 1 reveal')
      done()
    })
  })
})
