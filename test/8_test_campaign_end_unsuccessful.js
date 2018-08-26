/**
 * TEST #*: Test Campaign End Unuccessfully.
 *
 * In this test we test a Campaign Ending in an Unsuccessful State.
 * The Campaign will end unsuccessfully when it reaches the end date and
 * the funds raised are less than the funding goal specified by the campaign manager.
 *
 * We use the 'increaseTime' test helper library from Open Zeppelin to increase EVM Time to simulate
 * time passing past the Campaign End Date.
 * (https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/test/helpers/increaseTime.js)
 *
 * We set up a fresh Campaign and some grant admin priviledges to some accounts
 * then approve it and make some contributions.
 *
 * We then increase the EVM time by 2 days past the Campaign duration of 1 day. The Campaign should be 'endable' now
 *
 *
 * We end the Campaign and check the Campaign State changed accordingly.
 *
 * We ensure that the Campaign Manager and that Non Contributors are not allowed to withdraw funds from the Campaign
 *
 * We ensure that Campaign contributors are allowed to withdraw funds and that state variables are updated correctly.
 *
 * Finally we ensure that contributors are not allowed to double withdraw from the campaign.
 *
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const { increaseTime } = require('zeppelin-solidity/test/helpers/increaseTime')
const expectEvent = require('zeppelin-solidity/test/helpers/expectEvent')

const TWO_DAYS = 2 * 24 * 60 * 60

contract('#8 Campaign End Unsuccessfully', (accounts) => {
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
          CampaignInstance.contribute({ from: accounts[4], value: 2 }),
          'LogContributionMade',
          {
            contributor: accounts[4]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.contribute({ from: accounts[5], value: 3 }),
          'LogContributionMade',
          {
            contributor: accounts[5]
          }
        )
      })
      .then(() => {
        done()
      })
  })

  // time travel
  it('should increase evm time past end date', async () => {
    await increaseTime(TWO_DAYS)
  })

  it('should have transitioned state', (done) => {
    CampaignInstance.isActive.call().then((isActive) => {
      assert.equal(isActive, false, 'isActive should be false')
      done()
    })
  })

  it('should end before goal is met and state should be set to Unsuccessful', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.endCampaign({ from: accounts[3] }),
      'LogCampaignEnded',
      {
        isSuccessful: false
      }
    )
  })

  it('should have set campaign state to Unsuccessful', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 3, 'campaignState should be 3 (Unsuccessful)')
      done()
    })
  })

  it('should not allow the Campaign manager to withdraw funds', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[3] })).then(() => {
      done()
    })
  })

  it('should not allow the non contributors to withdraw funds', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[6] })).then(() => {
      done()
    })
  })

  it('should not have withdrawn any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 6, 'funds should be 6')
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
      assert.equal(funds, 3, 'funds should be 3')
      done()
    })
  })

  it('should not allow a contributor to withdraw funds again', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have withdrawn any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 3, 'funds should be 3')
      done()
    })
  })
})
