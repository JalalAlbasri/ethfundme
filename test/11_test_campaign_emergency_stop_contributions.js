/**
 * TEST #11: Test Campaign Emergency Stop
 *
 * In this test we test the Emergency Stop functionality of the Campaign Contract.
 *
 * We set up some admin accounts, create a campaign, approve it and make some contributions.
 *
 * We ensure that the Campaign cannot be stopped from a non Authorized account.
 *
 * We stop the Campaign and ensure that the state is changed accordingly.
 *
 * We ensure that contributions cannot be made to a Campaign in a Stopped state.
 *
 * We ensure that the Campaign Manager cannot withdraw funds from a Stopped Campaign
 *
 * We ensure that Contributors can withdraw funds from the Stopped Camapign.
 *
 * We ensure that non admin accounts cannot resume the Campaign before resuming the Campaign
 * from an admin account.
 *
 * Next we check that the resumed Campaign accepts contributions and that the Contributor
 * who withdrew funds during the stopped Campaign can withdraw the correct amount of funds
 * once the Campaign has ended.
 *
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const { increaseTime } = require('zeppelin-solidity/test/helpers/increaseTime')
const expectEvent = require('zeppelin-solidity/test/helpers/expectEvent')

const TWO_DAYS = 2 * 24 * 60 * 60

contract('#11 Campaign Emergency Stop Contributions', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let voteOptionTrue = true
  let voteSecretTrue = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOptionTrue, salt]).toString('hex')

  before('setup and reject campaign', (done) => {
    CampaignFactory.deployed()
      .then((instance) => {
        CampaignFactoryInstance = instance
        return expectEvent.inTransaction(
          CampaignFactoryInstance.addAdminRole(accounts[1], { from: accounts[0] }),
          'LogAdminAdded',
          { account: accounts[1] }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignFactoryInstance.addAdminRole(accounts[2], { from: accounts[0] }),
          'LogAdminAdded',
          { account: accounts[2] }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignFactoryInstance.createCampaign(
            'test campaign',
            10,
            1,
            'test campaign description',
            'test image url',
            { from: accounts[3] }
          ),
          'LogCampaignCreated'
        )
      })
      .then(() => {
        return CampaignFactoryInstance.campaigns.call(0)
      })
      .then((campaignAddress) => {
        CampaignInstance = Campaign.at(campaignAddress)
        return expectEvent.inTransaction(
          CampaignInstance.vote(voteSecretTrue, { from: accounts[0] }),
          'LogVoteComitted',
          {
            comittedBy: accounts[0]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.vote(voteSecretTrue, { from: accounts[1] }),
          'LogVoteComitted',
          {
            comittedBy: accounts[1]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.vote(voteSecretTrue, { from: accounts[2] }),
          'LogVoteComitted',
          {
            comittedBy: accounts[2]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.reveal(voteOptionTrue, salt, { from: accounts[0] }),
          'LogVoteRevealed',
          {
            revealedBy: accounts[0]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.reveal(voteOptionTrue, salt, { from: accounts[1] }),
          'LogVoteRevealed',
          {
            revealedBy: accounts[1]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.contribute({ from: accounts[4], value: 1 }),
          'LogContributionMade',
          {
            contributor: accounts[4]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.contribute({ from: accounts[5], value: 1 }),
          'LogContributionMade',
          {
            contributor: accounts[5]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.contribute({ from: accounts[5], value: 1 }),
          'LogContributionMade',
          {
            contributor: accounts[5]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.contribute({ from: accounts[8], value: 1 }),
          'LogContributionMade',
          {
            contributor: accounts[8]
          }
        )
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

  it('should not be in stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, false, 'campaign should not be stopped')
      done()
    })
  })

  it('should stop the campaign', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.stopContract({ from: accounts[0] }),
      'LogContractStopped'
    )
  })

  it('should be in a stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, true, 'campaign should be stopped')
      done()
    })
  })

  it('should attempt to make a contribution to stopped campaign and fail', function (done) {
    assertRevert(CampaignInstance.contribute({ from: accounts[7], value: 1 })).then(() => {
      done()
    })
  })

  it('should not allow the campaign manager to withdraw funds from stopped campaign', (done) => {
    assertRevert(CampaignInstance.emergencyWithdraw({ fron: accounts[3] })).then(() => {
      done()
    })
  })

  it('should not have changed funds in campaign', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 4, 'funds should be 4')
      done()
    })
  })

  it('should allow contributors to withdraw contributed funds from stopped campaign', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.emergencyWithdraw({ from: accounts[4] }),
      'LogWithdrawlMade',
      {
        beneficiary: accounts[4]
      }
    )
  })

  it('should have debited funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 3, 'funds should be 3')
      done()
    })
  })

  it('should try to resume the contract from a non admin account and fail', (done) => {
    assertRevert(CampaignInstance.resumeContract({ from: accounts[3] })).then(() => {
      done()
    })
  })

  it('should still be in stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, true, 'campaign should be stopped')
      done()
    })
  })

  it('should resume the campaign', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.resumeContract({ from: accounts[1] }),
      'LogContractResumed'
    )
  })

  it('should no longer be in stopped state', (done) => {
    CampaignInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, false, 'campaign should not be stopped')
      done()
    })
  })

  it('should accept new contributions once resumed', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.contribute({ from: accounts[4], value: 1 }),
      'LogContributionMade',
      {
        contributor: accounts[4]
      }
    )
  })

  it('should have created a contribution', (done) => {
    CampaignInstance.hasContributed.call(accounts[4]).then((hasContributed) => {
      assert.equal(hasContributed, true, 'accounts[4] should have contributed')
      done()
    })
  })

  // time travel
  it('should increase evm time past end date', async () => {
    await increaseTime(TWO_DAYS)
  })

  it('should end campaign', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.endCampaign({ from: accounts[3] }),
      'LogCampaignEnded',
      {
        isSuccessful: false
      }
    )
  })

  it('Camapaign state should be set to Unsuccessful', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 3, 'campaignState should be 3 (Unsuccessful)')
      done()
    })
  })

  it('should allow contributor to withdraw funds contributed after emergency withdrawl', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.withdraw({ from: accounts[4] }),
      'LogWithdrawlMade',
      {
        beneficiary: accounts[4]
      }
    )
  })

  it('should have debited funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 3, 'funds should be 3')
      done()
    })
  })
})
