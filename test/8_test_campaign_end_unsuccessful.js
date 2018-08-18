const EthFundMe = artifacts.require('EthFundMe')
const Campaign = artifacts.require('Campaign')
const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const { assertRevert } = require('zeppelin-solidity/test/helpers/assertRevert')
const { increaseTime } = require('zeppelin-solidity/test/helpers/increaseTime')

const TWO_DAYS = 2 * 24 * 60 * 60

contract('8 Campaign End Unsuccessfully', (accounts) => {
  let EthFundMeInstance
  let CampaignInstance

  let salt = 123456789

  let voteOption0 = true
  let voteOption1 = true
  let voteOption2 = true

  let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
  let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
  let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

  before('setup and reject campaign', (done) => {
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
        return CampaignInstance.contribute({ from: accounts[4], value: 1 })
      })
      .then(() => {
        return CampaignInstance.contribute({ from: accounts[4], value: 2 })
      })
      .then(() => {
        return CampaignInstance.contribute({ from: accounts[5], value: 3 })
      })
      .then(() => {
        done()
      })
  })

  // time travel
  it('should increase evm time past end date', (done) => {
    increaseTime(TWO_DAYS).then(() => {
      done()
    })
  })

  it('should have transitioned state', (done) => {
    CampaignInstance.isActive.call().then((isActive) => {
      assert.equal(isActive, false, 'isActive should be false')
      done()
    })
  })

  it('should end before goal is met and state should be set to Unsuccessful', (done) => {
    CampaignInstance.endCampaign({ from: accounts[3] }).then(() => {
      done()
    })
  })

  it('should have set campaign state to Unsuccessful', (done) => {
    CampaignInstance.campaignState.call().then((campaignState) => {
      assert.equal(campaignState, 3, 'campaignState should be 3 (Unsuccessful)')
      done()
    })
  })

  it('should not allow the Campaign manager to withdraw funds', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[3] })).then(() => {
      done()
    })
  })

  it('should not allow the non contributors to withdraw funds', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[6] })).then(() => {
      done()
    })
  })

  it('should not have withdrawn any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 6, 'funds should be 6')
      done()
    })
  })

  it('should allow contributors to withdraw contributed funds', (done) => {
    CampaignInstance.withdraw({ from: accounts[4] }).then(() => {
      done()
    })
  })

  it('should have debited funds correctly', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 3, 'funds should be 3')
      done()
    })
  })

  it('should not allow a contributor to withdraw funds again', (done) => {
    assertRevert(CampaignInstance.withdraw({ fron: accounts[4] })).then(() => {
      done()
    })
  })

  it('should not have withdrawn any funds', (done) => {
    CampaignInstance.funds.call().then((funds) => {
      assert.equal(funds, 3, 'funds should be 3')
      done()
    })
  })
})
