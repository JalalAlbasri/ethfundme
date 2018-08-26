/**
 * TEST #6: Test Campaign Cacellation
 *
 * In this test we test the Cancellation of a Campaign by the Campaign Manager
 *
 * We set up a fresh Campaign and some grant admin priviledges to some accounts
 * then approve it and make a contribution.
 *
 * First we test that we cannot cancel the campaign from a non authorized account.
 *
 * Next we cancel the camapign and ensure the Approval and Campaign States are set correctly.
 *
 * Next we try and wothdraw funds as a Campaign Manager and ensure that the Campaign Manager
 * Cannot withdraw funds from a cancelled campaign.
 *
 * Finally we ensure that contributors are able to withdraw funds from a cancelled campaign.
 *
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const expectEvent = require('zeppelin-solidity/test/helpers/expectEvent')

contract('#6 Campaign Cancellation', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let voteOptionTrue = true
  let voteSecretTrue = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOptionTrue, salt]).toString('hex')

  before('setup campaign, approve it and make a contribution', (done) => {
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
        done()
      })
  })

  it('should attempt to cancel the campaign from a non authorized account and fail', (done) => {
    assertRevert(CampaignInstance.cancelCampaign({ from: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have cancelled the campaign', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 1, 'campaignState should be 1 (Active)')
      done()
    })
  })

  it('should cancel the campaign', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.cancelCampaign({ from: accounts[3] }),
      'LogCampaignCancelled'
    )
  })

  it('should have set the campaign state to Cancelled', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 4, 'campaignState should be 4 (Cancelled)')
      done()
    })
  })

  it('should should have set the approval state to Cancelled', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 4, 'approvalState should be 4 (Cancelled)')
      done()
    })
  })

  it('should not allow the Campaign manager to withdraw funds', (done) => {
    assertRevert(CampaignInstance.withdraw({ from: accounts[3] })).then(() => {
      done()
    })
  })

  it('should not have withdrawn any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 1, 'funds should be 1')
      done()
    })
  })

  it('should allow contributors to withdraw contributed funds', async () => {
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
      assert.equal(funds, 0, 'funds should be 0')
      done()
    })
  })
})
