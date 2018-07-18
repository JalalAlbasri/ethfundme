let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi')

// TODO: Cleanup and remove from npm if these remain unused
// let ethjsUtil = require('ethereumjs-util')
// let Web3Latest = require('web3')
// let web3Latest = new Web3Latest('ws://localhost:7545')

// let Approvable = artifacts.require('Approvable')
// console.log(`web3.version: ${web3.version}`)

// TODO: break up these test into smaller discrete tests

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
    let campaignState
    let efmAddress

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
        return CampaignInstance.campaignState.call()
      })
      .then(_campaignState => {
        campaignState = _campaignState
        return CampaignInstance.efm.call()
      })
      .then(_efmAddress => {
        efmAddress = _efmAddress

        assert.equal(id, 0, 'id should be 0')
        assert.equal(
          title,
          'first campaign',
          "title should be 'first campaign'"
        )
        assert.equal(goal, 10, 'goal should be 10')
        assert.equal(campaignState, 0, 'state should be 0 (PendingApproval)')
        assert.equal(
          manager,
          accounts[3],
          'campaign manager should be accounts[3]'
        )
        assert.equal(
          efmAddress,
          EthFundMeInstance.address,
          'efmAddress should be the address of EthFundMe deployed Contract'
        )
      })
  })

  it('should make a single contribution of 1 ether', () => {
    let EthFundMeInstance
    let CampaignInstance

    let numContributions
    let contribution
    let totalContributed
    let funds
    let campaignBalance

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
        return CampaignInstance.getTotalContributed.call(accounts[4])
      })
      .then(_totalContributed => {
        totalContributed = _totalContributed
        return CampaignInstance.funds.call()
      })
      .then(_funds => {
        funds = _funds
        return web3.eth.getBalance(CampaignInstance.address)
      })
      .then((_campaignBalance) => {
        campaignBalance = _campaignBalance

        assert.equal(numContributions, 1, 'there should be 1 contribution')
        assert.equal(contribution[0], 1, 'contribution amount should be 1')
        assert.equal(totalContributed, 1, 'total contribution should be 1')
        assert.equal(funds, 1, '1 ether should have been contributed')
        assert.equal(campaignBalance, 1, 'Campaign balance should be 1')
      })
  })
  // TODO: Make a second contribution from the same account

  it('approval state should be Pending', () => {
    let EthFundMeInstance
    let CampaignInstance

    let approvalState

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.approvalState.call()
      })
      .then(_approvalState => {
        approvalState = _approvalState
        assert.equal(approvalState, 0, 'approvalState state should be 0 (Pending)')
      })
  })

  it('poll state should  be Commit', () => {
    let EthFundMeInstance
    let CampaignInstance

    let pollState

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.pollState.call()
      })
      .then(_pollState => {
        pollState = _pollState
        assert.equal(pollState, 0, 'poll state should be 0 (Commit)')
      })
  })

  it('should place a vote for Campaign 0', () => {
    let EthFundMeInstance
    let CampaignInstance

    let numVotes

    let voteOption = true
    let salt = 123456789
    let voteSecret = '0x' +
      ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption, salt]).toString('hex')

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.vote(voteSecret, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.numVotes.call()
      })
      .then(_numVotes => {
        numVotes = _numVotes
        return CampaignInstance.voteSecrets.call(accounts[0])
      })
      .then(_voteSecret => {
        assert.equal(numVotes, 1, 'there should be one vote')
        assert.equal(_voteSecret, voteSecret, 'the voteSecrets should be match')
      })
  })

  it('should attempt to place vote from non admin account and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = true
    let salt = 123456789
    let voteSecret = '0x' +
      ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption, salt]).toString('hex')

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.vote(voteSecret, { from: accounts[4] })
      })
      .catch(e => {
        CampaignInstance.numVotes.call().then(numVotes => {
          assert.equal(numVotes, 1, 'there should be one vote')
        })
      })
  })

  it('should change an admins the previous vote not place a new vote', () => {
    let EthFundMeInstance
    let CampaignInstance

    let numVotes
    let originalVoteSecret

    let voteOption = false
    let salt = 123456789
    let voteSecret = '0x' +
      ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption, salt]).toString('hex')

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.voteSecrets.call(accounts[0])
      }).then(_originalVoteSecret => {
        originalVoteSecret = _originalVoteSecret
        return CampaignInstance.vote(voteSecret, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.numVotes.call()
      })
      .then(_numVotes => {
        numVotes = _numVotes
        return CampaignInstance.voteSecrets.call(accounts[0])
      })
      .then(_voteSecret => {
        assert.equal(numVotes, 1, 'there should be one vote')
        assert.equal(_voteSecret, voteSecret, 'the vote should be votesecret')
        assert.notEqual(
          _voteSecret,
          originalVoteSecret,
          'the vote should have changed'
        )
      })
  })

  it('should attempt to reveal a vote for accounts[0] during Commit state and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = false
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[0] })
      })
      .catch(e => {
        CampaignInstance.numReveals.call().then(numReveals => {
          assert.equal(numReveals, 0, 'there should be no reveals')
        })
      })
  })

  it('should accept 2 more votes from admins then change poll state to Reveal', () => {
    let EthFundMeInstance
    let CampaignInstance
    let numVotes

    let voteOption1 = true
    let salt1 = 123456789
    let voteSecret1 = '0x' +
      ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt1]).toString('hex')

    let voteOption2 = true
    let salt2 = 123456789
    let voteSecret2 = '0x' +
      ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt2]).toString('hex')

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.vote(voteSecret1, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.vote(voteSecret2, { from: accounts[2] })
      })
      .then(() => {
        return CampaignInstance.numVotes.call()
      })
      .then(_numVotes => {
        numVotes = _numVotes
        assert.equal(numVotes, 3, 'there should be 3 votes')
        // TODO: Verify the voteSecrets too
      })
  })

  it('poll state should be Reveal', () => {
    let EthFundMeInstance
    let CampaignInstance
    let pollState

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.pollState.call()
      })
      .then(_pollState => {
        pollState = _pollState
        assert.equal(pollState, 1, 'poll state should be 1 (Reveal)')
      })
  })

  it('should attempt to place a fourth vote and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = true
    let salt = 123456789
    let voteSecret = '0x' +
      ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption, salt]).toString('hex')

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.vote(voteSecret, { from: accounts[0] })
      })
      .catch(e => {
        CampaignInstance.numVotes.call().then(numVotes => {
          assert.equal(numVotes, 3, 'there should only be 3 votes')
        })
      })
  })

  it('should attempt to reveal a vote for accounts[0] with wrong salt and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = false
    let salt = 111111111

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[0] })
      })
      .catch(e => {
        return CampaignInstance.numReveals.call().then(numReveals => {
          assert.equal(numReveals, 0, 'there should be no reveals')
        })
      })
  })

  it('should attempt to reveal a vote for accounts[0] with wrong voteOption and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = true
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[0] })
      })
      .catch(e => {
        CampaignInstance.numReveals.call().then(numReveals => {
          assert.equal(numReveals, 0, 'there should be no reveals')
        })
      })
  })

  it('should try to reveal vote for non admin address and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = false
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[3] })
      })
      .catch(e => {
        CampaignInstance.numReveals.call().then(numReveals => {
          assert.equal(numReveals, 0, 'there should be no reveals')
        })
      })
  })

  it('should reveal vote for accounts[0]', () => {
    let EthFundMeInstance
    let CampaignInstance

    let numReveals
    let hasRevealed
    let numApprovals
    let numRejections

    let voteOption = false
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[0] })
      })
      .then(() => {
        return CampaignInstance.numReveals.call()
      })
      .then(_numReveals => {
        numReveals = _numReveals
        return CampaignInstance.hasRevealed.call(accounts[0])
      })
      .then(_hasRevealed => {
        hasRevealed = _hasRevealed
        return CampaignInstance.numApprovals.call()
      })
      .then(_numApprovals => {
        numApprovals = _numApprovals
        return CampaignInstance.numRejections.call()
      })
      .then(_numRejections => {
        numRejections = _numRejections

        assert.equal(numReveals, 1, 'there should be 1 reveal')
        assert.equal(hasRevealed, true, 'accounts[0] should have revealed')
        assert.equal(numApprovals, 0, 'there should be no approvals')
        assert.equal(numRejections, 1, 'there should be one rejection')
      })
  })

  it('should try to reveal vote for admin that has already revealed and fail', () => {
    let EthFundMeInstance
    let CampaignInstance

    let voteOption = false
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[0] })
      })
      .catch(e => {
        CampaignInstance.numReveals.call().then(numReveals => {
          assert.equal(numReveals, 1, 'there should be one reveal')
        })
      })
  })

  it('should reveal vote for accounts[1]', () => {
    let EthFundMeInstance
    let CampaignInstance

    let numReveals
    let hasRevealed
    var numApprovals
    var numRejections

    let voteOption = true
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[1] })
      })
      .then(() => {
        return CampaignInstance.numReveals.call()
      })
      .then(_numReveals => {
        numReveals = _numReveals
        return CampaignInstance.hasRevealed.call(accounts[1])
      })
      .then(_hasRevealed => {
        hasRevealed = _hasRevealed
        return CampaignInstance.numApprovals.call()
      })
      .then(_numApprovals => {
        numApprovals = _numApprovals
        return CampaignInstance.numRejections.call()
      })
      .then(_numRejections => {
        numRejections = _numRejections

        assert.equal(numReveals, 2, 'there should be 2 reveals')
        assert.equal(hasRevealed, true, 'accounts[1] should have revealed')
        assert.equal(numApprovals, 1, 'there should be 1 approval')
        assert.equal(numRejections, 1, 'there should be one rejection')
      })
  })

  it('should reveal vote for accounts[2]', () => {
    let EthFundMeInstance
    let CampaignInstance

    let numReveals
    let hasRevealed
    var numApprovals
    var numRejections

    let voteOption = true
    let salt = 123456789

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.reveal(voteOption, salt, { from: accounts[2] })
      })
      .then(() => {
        return CampaignInstance.numReveals.call()
      })
      .then(_numReveals => {
        numReveals = _numReveals
        return CampaignInstance.hasRevealed.call(accounts[2])
      })
      .then(_hasRevealed => {
        hasRevealed = _hasRevealed
        return CampaignInstance.numApprovals.call()
      })
      .then(_numApprovals => {
        numApprovals = _numApprovals
        return CampaignInstance.numRejections.call()
      })
      .then(_numRejections => {
        numRejections = _numRejections

        assert.equal(numReveals, 3, 'there should be 3 reveals')
        assert.equal(hasRevealed, true, 'accounts[2] should have revealed')
        assert.equal(numApprovals, 2, 'there should be two approvals')
        assert.equal(numRejections, 1, 'there should be one rejection')
      })
  })

  it('poll state should Concluded', () => {
    let EthFundMeInstance
    let CampaignInstance
    let pollState

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.pollState.call()
      })
      .then(_pollState => {
        pollState = _pollState
        assert.equal(pollState, 2, 'poll state should be 2 (Concluded)')
      })
  })

  it('approval state should be approved', () => {
    let EthFundMeInstance
    let CampaignInstance

    let approvalState

    return EthFundMe.deployed()
      .then(instance => {
        EthFundMeInstance = instance
        return EthFundMeInstance.campaigns.call(0)
      })
      .then(address => {
        CampaignInstance = Campaign.at(address)
        return CampaignInstance.approvalState.call()
      })
      .then(_approvalState => {
        approvalState = _approvalState
        assert.equal(approvalState, 1, 'approvalState state should be 1 (Approved)')
      })
  })

  // TODO: it('should try to reveal a vote for an admin that hasnt voted and fail')
  // We need to add new admins before that can happen!

  // TODO: test campaign getting rejected
})
