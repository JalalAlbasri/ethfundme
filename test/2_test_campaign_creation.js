let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')


contract('Campaign Creation', (accounts) => {
  let EthFundMeInstance
  let CampaignInstance

  before('set up contract instances', (done) => {
    EthFundMe.deployed().then((instance) => {
      EthFundMeInstance = instance
      return EthFundMeInstance.createCampaign('test campaign', 10, 1, { from: accounts[3] })
    }).then(() => {
      return EthFundMeInstance.campaigns.call(0)
    }).then((campaignAddress) => {
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

  it('should initialize campaign manager correctly', (done) => {
    CampaignInstance.manager.call().then((manager) => {
      assert.equal(manager, accounts[3], 'manager should be accounts[3]')
      done()
    })
  })

  it('should initialize campaign efmAddress correctly', (done) => {
    CampaignInstance.efm.call().then((efmAddress) => {
      assert.equal(efmAddress, EthFundMeInstance.address, 'efmAddress should be EthFundMe.address')
      done()
    })
  })

  it('should set numCampaigns correctly', (done) => {
    EthFundMeInstance.getNumCampaigns.call().then((numCampaigns) => {
      assert.equal(numCampaigns, 1, 'numCampaigns should be 1')
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
