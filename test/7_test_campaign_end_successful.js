const CampaignFactory = artifacts.require('CampaignFactory')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const { increaseTime } = require('zeppelin-solidity/test/helpers/increaseTime')

const TWO_DAYS = 2 * 24 * 60 * 60

contract('#7 Campaign End Successfully', (accounts) => {
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
        return CampaignInstance.contribute({ from: accounts[4], value: 5 })
      })
      .then(() => {
        return CampaignInstance.contribute({ from: accounts[5], value: 2 })
      })
      .then(() => {
        return CampaignInstance.contribute({ from: accounts[5], value: 3 })
      })
      .then(() => {
        return CampaignInstance.contribute({ from: accounts[6], value: 3 })
      })
      .then(() => {
        done()
      })
  })

  it('should end campaign before end date and fail', (done) => {
    assertRevert(CampaignInstance.endCampaign({ from: accounts[3] })).then(() => {
      done()
    })
  })

  it('should set campaign state to Active', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 1, 'campaignState should be 1 (Active)')
      done()
    })
  })

  // time travel
  it('should increase evm time past end date', (done) => {
    increaseTime(TWO_DAYS).then(() => {
      done()
    })
  })

  it('should attempt to end campaign from invalid account and fail', (done) => {
    assertRevert(CampaignInstance.endCampaign({ from: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have changed approval state', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 1, 'approvalState should be 1 (Active)')
      done()
    })
  })

  it('should end campaign', (done) => {
    CampaignInstance.endCampaign({ from: accounts[3] }).then(() => {
      done()
    })
  })

  it('Camapaign state should be set to Successful', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 2, 'campaignState should be 2 (Successful)')
      done()
    })
  })

  it('should not allow the contributors to withdraw funds', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have withdrawn any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 13, 'funds should be 13')
      done()
    })
  })

  it('should allow Cmapaign manager to withdraw funds', (done) => {
    CampaignInstance.withdraw({ from: accounts[3] }).then(() => {
      done()
    })
  })

  it('should have debited funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 0, 'funds should be 0')
      done()
    })
  })
})
