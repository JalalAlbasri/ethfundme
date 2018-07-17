let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')
// let Approvable = artifacts.require('Approvable')

contract('EthFundMe', accounts => {
  it('there should be 3 admins', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.getNumAdmins.call()
      })
      .then(numAdmins => {
        assert.equal(numAdmins, 3, 'there should be 3 admins')
      })
  })

  it('the first admin should be accounts[0]', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.admins.call(0)
      })
      .then(admin => {
        assert.equal(
          admin,
          accounts[0],
          'the first admin should be accounts[0]'
        )
      })
  })

  it('the second admin should be accounts[1]', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.admins.call(1)
      })
      .then(admin => {
        assert.equal(
          admin,
          accounts[1],
          'the second admin should be accounts[1]'
        )
      })
  })

  it('the third admin should be accounts[2]', () => {
    return EthFundMe.deployed()
      .then(instance => {
        return instance.admins.call(2)
      })
      .then(admin => {
        assert.equal(
          admin,
          accounts[2],
          'the third admin should be accounts[2]'
        )
      })
  })

  it('should correctly identify admins', () => {
    let EthFundMeInstance
    let isAccount0Admin
    let isAccount3Admin

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.isAdmin.call(accounts[0])
      })
      .then(isAdmin => {
        isAccount0Admin = isAdmin
        return EthFundMeInstance.isAdmin.call(accounts[3])
      })
      .then(isAdmin => {
        isAccount3Admin = isAdmin

        assert.equal(isAccount0Admin, true, 'accounts[0] is an admin')
        assert.equal(isAccount3Admin, false, 'accounts[3] is not an admin')
      })
  })

  it('should create a new campaign', () => {
    let EthFundMeInstance

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.createCampaign('first campaign', 10, {
          from: accounts[3]
        })
      })
      .then(() => {
        return EthFundMeInstance.getNumCampaigns.call()
      })
      .then(numCampaigns => {
        assert.equal(numCampaigns, 1, 'numCampaigns should be 1')
      })
  })

  it('should set Campaign properties correctly', () => {
    let EthFundMeInstance
    let CampaignInstance
    let id
    let title
    let goal
    let manager
    let state

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.id.call()
      })
      .then(_id => {
        id = _id
        return CampaignInstance.title.call()
      })
      .then(_title => {
        title = _title
        return CampaignInstance.goal.call()
      })
      .then(_goal => {
        goal = _goal
        return CampaignInstance.manager.call()
      })
      .then(_manager => {
        manager = _manager
        return CampaignInstance.state.call()
      })
      .then(_state => {
        state = _state

        assert.equal(id, 0, 'id should be 0')
        assert.equal(
          title,
          'first campaign',
          "title should be 'first campaign'"
        )
        assert.equal(goal, 10, 'goal should be 10')
        // TODO: Make sure this is how returning enums works
        assert.equal(state, 0, 'state should be 0 (State.Pending)')
        assert.equal(
          manager,
          accounts[3],
          'campaign manager should be accounts[3]'
        )
      })
  })

  it('should make a single contribution of 1 ether', () => {
    let EthFundMeInstance
    let CampaignInstance
    let numContributions
    let contribution
    let funds

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.contribute({ from: accounts[4], value: 1 })
      })
      .then(() => {
        return CampaignInstance.getNumContributions.call(accounts[4])
      })
      .then(_numContributions => {
        numContributions = _numContributions
        return CampaignInstance.getContribution.call(accounts[4], 0)
      })
      .then(_contribution => {
        contribution = _contribution
        return CampaignInstance.funds.call()
      })
      .then(_funds => {
        funds = _funds
        let campaignBalance = web3.eth.getBalance(CampaignInstance.address)

        assert.equal(numContributions, 1, 'there should be 1 contribution')
        assert.equal(funds, 1, '1 ether should have been contributed')
        assert.equal(contribution[0], 1, 'contribution amount should be 1')
        assert.equal(campaignBalance, 1, 'Campaign balance should be 1')
      })
  })

  it('should place a vote for Campaign 0', () => {
    let EthFundMeInstance
    let CampaignInstance
    let numVotes
    let vote

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.vote(123, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.numVotes.call()
      })
      .then((_numVotes) => {
        numVotes = _numVotes
        return CampaignInstance.votes.call(accounts[0])
      })
      .then(_vote => {
        vote = _vote

        assert.equal(numVotes, 1, 'there should be one vote')
        assert.equal(vote, 123, 'the vote should be 123')
      })
  })

  it('should attempt to place vote from non admin account and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.vote(123, { from: accounts[4] })
      }).catch(e => {
        CampaignInstance.numVotes.call().then(numVotes => {
          assert.equal(numVotes, 1, 'there should be one vote');
        })
      })
  })

})
