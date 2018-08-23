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
        return CampaignFactoryInstance.addAdminRole(accounts[1], { from: accounts[0] })
      })
      .then(() => {
        return CampaignFactoryInstance.addAdminRole(accounts[2], { from: accounts[0] })
      })
      .then(() => {
        return CampaignFactoryInstance.addAdminRole(accounts[3], { from: accounts[0] })
      })
      .then(() => {
        return CampaignFactoryInstance.addAdminRole(accounts[4], { from: accounts[0] })
      })
      .then(() => {
        return CampaignFactoryInstance.createCampaign(
          'test campaign',
          10,
          1,
          'test campaign description',
          'test image url',
          { from: accounts[5] }
        )
      })
      .then(() => {
        return CampaignFactoryInstance.numAdmins.call()
      })
      .then((numAdmins) => {
        return CampaignFactoryInstance.campaigns.call(0)
      })
      .then((campaignAddress) => {
        CampaignInstance = Campaign.at(campaignAddress)
        return CampaignInstance.vote(voteSecretFalse, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecretFalse, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecretTrue, { from: accounts[2] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecretFalse, { from: accounts[3] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecretFalse, { from: accounts[4] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOptionFalse, salt, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOptionFalse, salt, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOptionTrue, salt, { from: accounts[2] })
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

  it('should reveal another vote', (done) => {
    CampaignInstance.reveal(voteOptionFalse, salt, { from: accounts[3] }).then(() => {
      done()
    })
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
