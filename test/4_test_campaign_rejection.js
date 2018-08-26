/**
 * TEST #4: Campaign Rejection
 *
 * In this test we test Rejection of a Campaign by admins in the Approval Phase.
 *
 * We create and fresh campaign and grant admin priviledges to some accounts.
 *
 * We place and reveal some votes and ensure that no outcome has been reached because not
 * enough votes have been revealed.
 *
 * We reveal the final vote and ensure that the vote was tallied correctly setting the
 * Approval and Campaign States.
 *
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const expectEvent = require('zeppelin-solidity/test/helpers/expectEvent')

contract('#4 Campaign Rejection', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let voteOptionFalse = false
  let voteOptionTrue = true
  let voteSecretFalse = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOptionFalse, salt]).toString('hex')
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
          CampaignFactoryInstance.addAdminRole(accounts[3], { from: accounts[0] }),
          'LogAdminAdded',
          { account: accounts[3] }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignFactoryInstance.addAdminRole(accounts[4], { from: accounts[0] }),
          'LogAdminAdded',
          { account: accounts[4] }
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
            { from: accounts[5] }
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
          CampaignInstance.vote(voteSecretFalse, { from: accounts[0] }),
          'LogVoteComitted',
          {
            comittedBy: accounts[0]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.vote(voteSecretFalse, { from: accounts[1] }),
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
          CampaignInstance.vote(voteSecretFalse, { from: accounts[3] }),
          'LogVoteComitted',
          {
            comittedBy: accounts[3]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.vote(voteSecretFalse, { from: accounts[4] }),
          'LogVoteComitted',
          {
            comittedBy: accounts[4]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.reveal(voteOptionFalse, salt, { from: accounts[0] }),
          'LogVoteRevealed',
          {
            revealedBy: accounts[0]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.reveal(voteOptionFalse, salt, { from: accounts[1] }),
          'LogVoteRevealed',
          {
            revealedBy: accounts[1]
          }
        )
      })
      .then(() => {
        return expectEvent.inTransaction(
          CampaignInstance.reveal(voteOptionTrue, salt, { from: accounts[2] }),
          'LogVoteRevealed',
          {
            revealedBy: accounts[2]
          }
        )
      })
      .then(() => {
        done()
      })
  })

  it('should not have enough votes to calculate outcome', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 1, 'approvalState should be 1 (Reveal)')
      done()
    })
  })

  it('should reveal another vote', async () => {
    await expectEvent.inTransaction(
      CampaignInstance.reveal(voteOptionFalse, salt, { from: accounts[3] }),
      'LogVoteRevealed',
      {
        revealedBy: accounts[3]
      }
    )
  })

  it('should set approval state correctly to Rejected', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 3, 'approvalState should be 3 (Rejected)')
      done()
    })
  })

  it('should set campaign state correctly to Unsuccessful', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 3, 'approvalState should be 3 (Unsuccessful)')
      done()
    })
  })
})
