let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

contract('EthFundMe Emregency Stop', (accounts) => {
  let EthFundMeInstance
  let CampaignInstance

  before('set up contract instances', (done) => {
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
        done()
      })
  })

  it('should set numCampaigns correctly', (done) => {
    EthFundMeInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 1, 'numCampaigns should be 1')
      done()
    })
  })

  it('should try to stop the contract from a non admin account and fail', (done) => {
    EthFundMeInstance.stopContract({ from: accounts[3] }).catch((e) => {
      EthFundMeInstance.isStopped.call().then((isStopped) => {
        assert.equal(isStopped, false, 'EthFundME contract should not be stopped')
        done()
      })
    })
  })

  it('should stop the EthFundMe contract', (done) => {
    EthFundMeInstance.stopContract({ from: accounts[1] })
      .then(() => {
        return EthFundMeInstance.isStopped.call()
      })
      .then((isStopped) => {
        assert.equal(isStopped, true, 'EthFundMe contract should be stopped')
        done()
      })
  })

  it('should attempt to create a campaign on stopped contract and fail', (done) => {
    EthFundMeInstance.createCampaign(
      'test campaign 2',
      10,
      1,
      'test campaign description 2',
      'test image url 2',
      { from: accounts[3] }
    ).catch((e) => {
      EthFundMeInstance.getNumCampaigns.call().then((numCampaigns) => {
        assert.equal(numCampaigns, 1, 'numCampaigns should still be 1')
        done()
      })
    })
  })

  it('should resume ethfundme contract successfully', (done) => {
    EthFundMeInstance.resumeContract({ from: accounts[1] })
      .then(() => {
        return EthFundMeInstance.isStopped.call()
      })
      .then((isStopped) => {
        assert.equal(isStopped, false, 'ethfundme contract should be resumed')
        done()
      })
  })

  it('should should create a campaign on resumed contract successfully', (done) => {
    EthFundMeInstance.createCampaign(
      'test campaign 2',
      10,
      1,
      'test campaign description 2',
      'test image url 2',
      { from: accounts[3] }
    )
      .then(() => {
        return EthFundMeInstance.getNumCampaigns.call()
      })

      .then((numCampaigns) => {
        assert.equal(numCampaigns, 2, 'numCampaigns should still be 1')
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
