const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')

contract('#3 Campaign Approval', (accounts) => {
  let CampaignFactoryInstance
  let CampaignInstance

  let salt = 123456789

  let originalVoteOption0 = true
  let newVoteOption0 = false

  let voteOption1 = true
  let voteOption2 = true

  let originalVoteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [originalVoteOption0, salt]).toString('hex')
  let newVoteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [newVoteOption0, salt]).toString('hex')

  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

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

  it('should set approval state correctly to Commit', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 0, 'approvalState should be 0 (Commit)')
      done()
    })
  })

  it('should place a vote from accounts[0]', (done) => {
    CampaignInstance.vote(originalVoteSecret0, { from: accounts[0] }).then(() => {
      return CampaignInstance.voteSecrets.call(accounts[0]).then((voteSecret) => {
        assert.equal(voteSecret, originalVoteSecret0, 'voteSecret should match originalVoteSecret0')
        done()
      })
    })
  })

  it('should set numVoteSecrets correctly', (done) => {
    CampaignInstance.numVoteSecrets.call().then((numVoteSecrets) => {
      assert.equal(numVoteSecrets, 1, 'there should be one vote')
      done()
    })
  })

  it('should attempt to place vote from non admin account and fail', (done) => {
    assertRevert(CampaignInstance.vote(originalVoteSecret0, { from: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have placed a vote', (done) => {
    CampaignInstance.numVoteSecrets.call().then((numVoteSecrets) => {
      assert.equal(numVoteSecrets, 1, 'there should be one vote')
      done()
    })
  })

  it('should change a vote from accounts[0]', (done) => {
    CampaignInstance.vote(newVoteSecret0, { from: accounts[0] }).then(() => {
      done()
    })
  })

  it("should have changed accounts[0]'s vote", (done) => {
    CampaignInstance.voteSecrets.call(accounts[0]).then((voteSecret) => {
      assert.equal(voteSecret, newVoteSecret0, 'voteSecret should match newVoteSecret0')
      done()
    })
  })

  // verify there is still only one vote after changing the vote
  it('should set numVoteSecrets correctly', (done) => {
    CampaignInstance.numVoteSecrets.call().then((numVoteSecrets) => {
      assert.equal(numVoteSecrets, 1, 'there should be one vote')
      done()
    })
  })

  // FIXME: Could reveal be a call?
  it('should attempt to reveal a vote and fail (cannot reveal during Commit state)', (done) => {
    assertRevert(CampaignInstance.reveal(newVoteOption0, salt, { from: accounts[0] })).then(() => {
      done()
    })
  })

  it('should not have revealed a vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 0, 'there should be no reveals')
      done()
    })
  })

  it('should place a vote from accounts[1]', (done) => {
    CampaignInstance.vote(voteSecret1, { from: accounts[1] }).then(() => {
      done()
    })
  })

  it('should have set voteSecret correctly', (done) => {
    CampaignInstance.voteSecrets.call(accounts[1]).then((voteSecret) => {
      assert.equal(voteSecret, voteSecret1, 'voteSecret should match voteSecret1')
      done()
    })
  })

  it('should place a vote from accounts[2]', (done) => {
    CampaignInstance.vote(voteSecret1, { from: accounts[2] }).then(() => {
      done()
    })
  })

  it('should have set voteSecret correctly', (done) => {
    CampaignInstance.voteSecrets.call(accounts[2]).then((voteSecret) => {
      assert.equal(voteSecret, voteSecret2, 'voteSecret should match voteSecret1')
      done()
    })
  })

  it('should set numVoteSecrets correctly', (done) => {
    CampaignInstance.numVoteSecrets.call().then((numVoteSecrets) => {
      assert.equal(numVoteSecrets, 3, 'there should be 3 votes')
      done()
    })
  })

  it('should set approval state correctly to Reveal', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 1, 'approvalState should be 1 (Reveal)')
      done()
    })
  })

  it('should attempt to place a vote and fail (cannot vote during Reveal state)', (done) => {
    assertRevert(CampaignInstance.vote(originalVoteSecret0, { from: accounts[0] })).then(() => {
      done()
    })
  })

  it('should not have placed a vote', (done) => {
    CampaignInstance.numVoteSecrets.call().then((numVoteSecrets) => {
      assert.equal(numVoteSecrets, 3, 'there should be one vote')
      done()
    })
  })

  it('should attempt to reveal a vote for accounts[0] with wrong salt and fail', (done) => {
    assertRevert(CampaignInstance.reveal(newVoteOption0, 0, { from: accounts[0] })).then(() => {
      done()
    })
  })

  it('should not have revealed a vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 0, 'there should be no reveals')
      done()
    })
  })

  it('should attempt to reveal a vote for accounts[0] with wrong voteOption and fail', (done) => {
    assertRevert(CampaignInstance.reveal(true, salt, { from: accounts[0] })).then(() => {
      done()
    })
  })

  it('should attempt to reveal a vote for from non admin account and fail', (done) => {
    assertRevert(CampaignInstance.reveal(newVoteOption0, salt, { from: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have revealed a vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 0, 'there should be no reveals')
      done()
    })
  })

  it('should reveal vote for accounts[0]', (done) => {
    CampaignInstance.reveal(newVoteOption0, salt, { from: accounts[0] }).then(() => {
      done()
    })
  })

  it('should have revealed one vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 1, 'there should 1 reveal')
      done()
    })
  })

  it('should set hasRevealed correctly', (done) => {
    CampaignInstance.hasRevealed.call(accounts[0]).then((hasRevealed) => {
      assert.equal(hasRevealed, true, 'hasRevealed should be true')
      done()
    })
  })

  it('should set numRejections correctly', (done) => {
    CampaignInstance.numRejections.call().then((numRejections) => {
      assert.equal(numRejections, 1, 'numRejections should be 1')
      done()
    })
  })

  it('should attempt to reveal a vote for from accounts[0] again and fail', (done) => {
    assertRevert(CampaignInstance.reveal(newVoteOption0, salt, { from: accounts[0] })).then(() => {
      done()
    })
  })

  it('should not have revealed the vote again', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 1, 'there should be one reveals')
      done()
    })
  })

  it('should reveal vote for accounts[1]', (done) => {
    CampaignInstance.reveal(voteOption1, salt, { from: accounts[1] }).then(() => {
      done()
    })
  })

  it('should have revealed a second vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 2, 'there should 2 reveals')
      done()
    })
  })

  it('should attempt to make a contribution and fail (cannot contribute approval state pending)', (done) => {
    assertRevert(CampaignInstance.contribute({ from: accounts[4], value: 1 })).then(() => {
      done()
    })
  })

  it('should not have contributed any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 0, 'no funds should have been contributed')
      done()
    })
  })

  it('should reveal vote for accounts[2]', (done) => {
    CampaignInstance.reveal(voteOption2, salt, { from: accounts[2] }).then(() => {
      done()
    })
  })

  it('should have revealed a third vote', (done) => {
    CampaignInstance.numVoteReveals.call().then((numVoteReveals) => {
      assert.equal(numVoteReveals, 3, 'there should 3 reveals')
      done()
    })
  })

  it('should set approval state correctly to Approved', (done) => {
    CampaignInstance.approvalState.call().then((approvalState) => {
      assert.equal(approvalState, 2, 'approvalState should be 2 (Approved)')
      done()
    })
  })

  it('should set campaign state correctly to Active', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 1, 'approvalState should be 1 (Active)')
      done()
    })
  })
})
