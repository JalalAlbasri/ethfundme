const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

contract('#4 Campaign Rejection', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = false
  let voteOption1 = false
  let voteOption2 = true
  let voteOption3 = false
  let voteOption4 = false

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')
  let voteSecret3 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption3, salt]).toString('hex')
  let voteSecret4 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption4, salt]).toString('hex')

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
        return CampaignInstance.vote(voteSecret0, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret1, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret2, { from: accounts[2] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret3, { from: accounts[3] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret4, { from: accounts[4] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption0, salt, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption1, salt, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption2, salt, { from: accounts[2] })
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
    CampaignInstance.reveal(voteOption3, salt, { from: accounts[3] }).then(() => {
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
