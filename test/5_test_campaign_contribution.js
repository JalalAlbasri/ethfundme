let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

contract('Campaign Contribution', accounts => {
  let EthFundMeInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = true
  let voteOption1 = true
  let voteOption2 = true

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

  before('setup and reject campaign', done => {
    EthFundMe.deployed().then(instance => {
      EthFundMeInstance = instance
      return EthFundMeInstance.createCampaign('test campaign', 10, { from: accounts[3] })
    })
      .then(() => {
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(campaignAddress => {
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

  it('should set approval state correctly to Approved', done => {
    CampaignInstance.approvalState.call().then(approvalState => {
      assert.equal(approvalState, 2, 'approvalState should be 2 (Approved)')
      done()
    })
  })

  it('should set campaign state correctly to Open', done => {
    CampaignInstance.campaignState.call().then(campaignState => {
      assert.equal(campaignState, 1, 'campaignState should be 1 (Open)')
      done()
    })
  })

  it('should try to make a contribution of 0 and fail', done => {
    CampaignInstance.contribute({ from: accounts[4], value: 0 }).catch(e => {
      CampaignInstance.hasContributed.call(accounts[4]).then(hasContributed => {
        assert.equal(hasContributed, false, 'accounts[4] should not have contributed')
        done()
      })
    })
  })

  it('should make a single contribution of 1 ether from accounts[4]', done => {
    CampaignInstance.contribute({ from: accounts[4], value: 1 }).then(() => {
      return CampaignInstance.hasContributed.call(accounts[4]).then(hasContributed => {
        assert.equal(hasContributed, true, 'accounts[4] should have contributed')
        done()
      })
    })
  })

  it('should set numContributions correctly', done => {
    CampaignInstance.getNumContributions.call(accounts[4]).then(numContributions => {
      assert.equal(numContributions, 1, 'numContributions should be 1')
      done()
    })
  })

  it('should set totalContributed correctly', done => {
    CampaignInstance.getTotalContributed.call(accounts[4]).then(totalContributed => {
      assert.equal(totalContributed, 1, 'total contribution should be 1')
      done()
    })
  })

  it('should set contribution array correctly', done => {
    CampaignInstance.getContribution.call(accounts[4], 0).then(contribution => {
      assert.equal(contribution[0], 1, 'contribution amount should be 1')
      done()
    })
  })

  it('should set funds correctly', done => {
    CampaignInstance.funds.call().then(funds => {
      assert.equal(funds, 1, '1 ether should have been contributed')
      done()
    })
  })

  it('should check hasContributed for account that has not contributed', done => {
    CampaignInstance.hasContributed.call(accounts[5]).then(hasContributed => {
      assert.equal(hasContributed, false, 'accounts[5] should not have contributed')
      done()
    })
  })

  it('should make a single contribution of 2 ether from accounts[5]', done => {
    CampaignInstance.contribute({ from: accounts[5], value: 2 }).then(() => {
      return CampaignInstance.hasContributed.call(accounts[4]).then(hasContributed => {
        assert.equal(hasContributed, true, 'accounts[5] should have contributed')
        done()
      })
    })
  })

  it('should set numContributions correctly', done => {
    CampaignInstance.getNumContributions.call(accounts[5]).then(numContributions => {
      assert.equal(numContributions, 1, 'numContributions should be 1')
      done()
    })
  })

  it('should set totalContributed correctly', done => {
    CampaignInstance.getTotalContributed.call(accounts[5]).then(totalContributed => {
      assert.equal(totalContributed, 2, 'total contribution should be 2')
      done()
    })
  })

  it('should set contribution array correctly', done => {
    CampaignInstance.getContribution.call(accounts[5], 0).then(contribution => {
      assert.equal(contribution[0], 2, 'contribution amount should be 2')
      done()
    })
  })

  it('should set funds correctly', done => {
    CampaignInstance.funds.call().then(funds => {
      assert.equal(funds, 3, '3 ether should have been contributed')
      done()
    })
  })

  it('should make a second contribution of 3 ether from accounts[4]', done => {
    CampaignInstance.contribute({ from: accounts[4], value: 3 }).then(() => {
      CampaignInstance.getNumContributions.call(accounts[4]).then(numContributions => {
        assert.equal(numContributions, 2, 'numContributions should be 2')
        done()
      })
    })
  })

  it('should set totalContributed correctly', done => {
    CampaignInstance.getTotalContributed.call(accounts[4]).then(totalContributed => {
      assert.equal(totalContributed, 4, 'total contribution should be 4')
      done()
    })
  })

  it('should set contribution array correctly', done => {
    CampaignInstance.getContribution.call(accounts[4], 1).then(contribution => {
      assert.equal(contribution[0], 3, 'contribution amount should be 3')
      done()
    })
  })

  it('should set funds correctly', done => {
    CampaignInstance.funds.call().then(funds => {
      assert.equal(funds, 6, '6 ether should have been contributed')
      done()
    })
  })
})
