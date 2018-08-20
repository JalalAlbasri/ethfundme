const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')

contract('#5 Campaign Contribution', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = true
  let voteOption1 = true
  let voteOption2 = true

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

  before('setup and reject campaign', (done) => {
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
        return CampaignInstance.vote(voteSecret0, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret1, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret2, { from: accounts[2] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption0, salt, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.reveal(voteOption0, salt, { from: accounts[1] })
      })
      .then(() => {
        done()
      })
  })

  it('should set approval state correctly to Approved', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 2, 'approvalState should be 2 (Approved)')
      done()
    })
  })

  it('should set campaign state correctly to Open', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 1, 'campaignState should be 1 (Active)')
      done()
    })
  })

  it('should try to make a contribution of 0 and fail', (done) => {
    assertRevert(CampaignInstance.contribute({ from: accounts[4], value: 0 })).then(() => {
      done()
    })
  })

  it('should not have made a contribution from accounts[4]', (done) => {
    CampaignInstance.hasContributed.call(accounts[4]).then((hasContributed) => {
      assert.equal(hasContributed, false, 'accounts[4] should not have contributed')
      done()
    })
  })

  it('should make a single contribution of 1 ether from accounts[4]', (done) => {
    CampaignInstance.contribute({ from: accounts[4], value: 1 }).then(() => {
      return CampaignInstance.hasContributed.call(accounts[4]).then((hasContributed) => {
        assert.equal(hasContributed, true, 'accounts[4] should have contributed')
        done()
      })
    })
  })

  it('should set numContributions correctly', (done) => {
    CampaignInstance.getNumContributions.call().then((numContributions) => {
      assert.equal(numContributions, 1, 'numContributions should be 1')
      done()
    })
  })

  it('should set contribution array correctly', (done) => {
    CampaignInstance.contributions.call(0).then((contribution) => {
      assert.equal(contribution[0], accounts[4], 'contribution address should be accounts[4]')
      assert.equal(contribution[1], 1, 'contribution amount should be 1')
      assert.equal(contribution[3], false, 'withdrawn should be false')
      done()
    })
  })

  it('should set funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 1, '1 ether should have been contributed')
      done()
    })
  })

  it('should check hasContributed for account that has not contributed', (done) => {
    CampaignInstance.hasContributed.call(accounts[5]).then((hasContributed) => {
      assert.equal(hasContributed, false, 'accounts[5] should not have contributed')
      done()
    })
  })

  it('should make a single contribution of 2 ether from accounts[5]', (done) => {
    CampaignInstance.contribute({ from: accounts[5], value: 2 }).then(() => {
      done()
    })
  })

  it('should have set hasContributed correctly', (done) => {
    CampaignInstance.hasContributed.call(accounts[5]).then((hasContributed) => {
      assert.equal(hasContributed, true, 'accounts[5] should have contributed')
      done()
    })
  })

  it('should set numContributions correctly', (done) => {
    CampaignInstance.getNumContributions.call().then((numContributions) => {
      assert.equal(numContributions, 2, 'numContributions should be 2')
      done()
    })
  })

  it('should set contribution array correctly', (done) => {
    CampaignInstance.contributions.call(1).then((contribution) => {
      assert.equal(contribution[0], accounts[5], 'contribution address should be accounts[5]')
      assert.equal(contribution[1], 2, 'contribution amount should be 2')
      assert.equal(contribution[3], false, 'withdrawn should be false')
      done()
    })
  })

  it('should set funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 3, '3 ether should have been contributed')
      done()
    })
  })

  it('should make a second contribution of 3 ether from accounts[4]', (done) => {
    CampaignInstance.contribute({ from: accounts[4], value: 3 }).then(() => {
      done()
    })
  })

  it('should have set numContributions correctly', (done) => {
    CampaignInstance.getNumContributions.call().then((numContributions) => {
      assert.equal(numContributions, 3, 'numContributions should be 3')
      done()
    })
  })

  it('should set contribution array correctly', (done) => {
    CampaignInstance.contributions.call(2).then((contribution) => {
      assert.equal(contribution[0], accounts[4], 'contribution address should be accounts[4]')
      assert.equal(contribution[1], 3, 'contribution amount should be 3')
      assert.equal(contribution[3], false, 'withdrawn should be false')
      done()
    })
  })

  it('should set funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 6, '6 ether should have been contributed')
      done()
    })
  })
})
