/**
 * TEST #10: Test Campaign Factory Emergency Stop
 *
 * In this test we test the Emergency Stop functionality of the CampaignFactory Contract.
 *
 * We set up some admin accounts and verify the CampaignFactory is working by creating a campaign.
 *
 * We ensure that the CampaignFactory cannot be stopped from a non Authorized account.
 *
 * We stop the CampaignFactory and ensure that the state is changed accordingly.
 *
 * We ensure that new Campaigns cannot be created when the CampaignFactory is in a stopped state.
 *
 * We then resume the stopped Contract and ensure that Campaigns can be created as normal again.
 *
 */

const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')

contract('#10 CampaignFactory Emregency Stop', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  before('set up contract instances', (done) => {
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
        done()
      })
  })

  it('should set numCampaigns correctly', (done) => {
    CampaignFactoryInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 1, 'numCampaigns should be 1')
      done()
    })
  })

  it('should try to stop the contract from a non admin account and fail', (done) => {
    assertRevert(CampaignFactoryInstance.stopContract({ from: accounts[3] })).then(() => {
      done()
    })
  })

  it('should not have stopped the contract', (done) => {
    CampaignFactoryInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, false, 'CampaignFactory contract should not be stopped')
      done()
    })
  })

  it('should stop the CampaignFactory contract', (done) => {
    CampaignFactoryInstance.stopContract({ from: accounts[0] }).then(() => {
      done()
    })
  })

  it('should have stopped the contract', (done) => {
    CampaignFactoryInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, true, 'CampaignFactory contract should be stopped')
      done()
    })
  })

  it('should attempt to create a campaign on stopped contract and fail', (done) => {
    assertRevert(
      CampaignFactoryInstance.createCampaign(
        'test campaign 2',
        10,
        1,
        'test campaign description 2',
        'test image url 2',
        { from: accounts[3] }
      )
    ).then(() => {
      done()
    })
  })

  it('should not have created a new campaign', (done) => {
    CampaignFactoryInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 1, 'numCampaigns should still be 1')
      done()
    })
  })

  it('should resume CampaignFactory contract successfully', (done) => {
    CampaignFactoryInstance.resumeContract({ from: accounts[1] }).then(() => {
      done()
    })
  })

  it('should have resumed the contract', (done) => {
    CampaignFactoryInstance.isStopped.call().then((isStopped) => {
      assert.equal(isStopped, false, 'CampaignFactory contract should be resumed')
      done()
    })
  })

  it('should should create a campaign on resumed contract successfully', (done) => {
    CampaignFactoryInstance.createCampaign(
      'test campaign 2',
      10,
      1,
      'test campaign description 2',
      'test image url 2',
      { from: accounts[3] }
    ).then(() => {
      done()
    })
  })

  it('should set numCampaigns correctly', (done) => {
    CampaignFactoryInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 2, 'numCampaigns should be 2')
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
})
