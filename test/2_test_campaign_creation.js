/**
 * TEST #2: Test Campaign Creation
 *
 * In this test we test Campaign Contract Creation from the CampaignFactory.
 *
 * We Create a Campaign Contract then check that all Campaign Contract State Variables
 * are initialized correctly.
 *
 * We also check the the campaigns array in the CampaignFactory that keeps track of
 * Campaign Contract Addresses is initialized correctly and holds the address of the Campaign
 * we just created.
 *
 * Finally we verify that access restriction on createCampaign is working by trying to
 * create a campaign from an admin account and failing
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const expectEvent = require('zeppelin-solidity/test/helpers/expectEvent')

contract('#2 Campaign Creation', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  before('set up contract instances', (done) => {
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
          CampaignFactoryInstance.addAdminRole(accounts[2], { from: accounts[1] }),
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
        done()
      })
  })

  it('should initialize campaign id correctly', (done) => {
    CampaignInstance.id.call().then((id) => {
      assert.equal(id, 0, 'id should be 0')
      done()
    })
  })

  it('should initialize campaign title correctly', (done) => {
    CampaignInstance.title.call().then((title) => {
      assert.equal(title, 'test campaign', 'title should be test campaign')
      done()
    })
  })

  it('should initialize campaign goal correctly', (done) => {
    CampaignInstance.goal.call().then((goal) => {
      assert.equal(goal, 10, 'goal should be 10')
      done()
    })
  })

  it('should initialize campaign duration correctly', (done) => {
    CampaignInstance.duration.call().then((duration) => {
      assert.equal(duration, 1 * 24 * 60 * 60, 'goal should be 1 day in seconds')
      done()
    })
  })

  it('should initialize campaign description correctly', (done) => {
    CampaignInstance.description.call().then((description) => {
      assert.equal(
        description,
        'test campaign description',
        'title should be test campaign description'
      )
      done()
    })
  })

  it('should initialize campaign image url correctly', (done) => {
    CampaignInstance.image.call().then((image) => {
      assert.equal(image, 'test image url', 'title should be test image url')
      done()
    })
  })

  it('should initialize campaign manager correctly', (done) => {
    CampaignInstance.manager.call().then((manager) => {
      assert.equal(manager, accounts[3], 'manager should be accounts[3]')
      done()
    })
  })

  it('should set numCampaigns correctly', (done) => {
    CampaignFactoryInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 1, 'numCampaigns should be 1')
      done()
    })
  })

  it('should have stored campaign address correctly in CampaignFactroy', (done) => {
    CampaignFactoryInstance.campaigns.call(0).then((campaignAddress) => {
      assert.equal(
        campaignAddress,
        CampaignInstance.address,
        'campaignAddress should match created campaign address'
      )
      done()
    })
  })

  it('should set campaign state correctly to Pending', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 0, 'campaignState should be 0 (Pending)')
      done()
    })
  })

  it('should set approval state correctly to Pending', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 0, 'approvalState should be 0 (Pending)')
      done()
    })
  })

  it('should not be active', (done) => {
    CampaignInstance.isActive.call().then((isActive) => {
      assert.equal(isActive, false, 'isActive should be false')
      done()
    })
  })

  it('should attempt to create a campaign from an admin account and fail', (done) => {
    assertRevert(
      CampaignFactoryInstance.createCampaign('admin campaign', 10, 1, 'description', 'image')
    ).then(() => {
      done()
    })
  })

  it('should not have created a new campaign', (done) => {
    CampaignFactoryInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 1, 'there should be just one campaign')
      done()
    })
  })
})
