// let EthFundMe = artifacts.require('EthFundMe')
// let Campaign = artifacts.require('Campaign')

// let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

// contract('Campaign Rejection', accounts => {
//   let EthFundMeInstance
//   let CampaignInstance

//   let salt = 123456789

//   let voteOption0 = false
//   let voteOption1 = false
//   let voteOption2 = true

//   let voteSecret0 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption0, salt]).toString('hex')
//   let voteSecret1 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption1, salt]).toString('hex')
//   let voteSecret2 = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [voteOption2, salt]).toString('hex')

//   before('setup and reject campaign', done => {
//     EthFundMe.deployed().then(instance => {
//       EthFundMeInstance = instance
//       return EthFundMeInstance.createCampaign('test campaign', 10, { from: accounts[3] })
//     }).then(() => {
//       return EthFundMeInstance.campaigns.call(0)
//     }).then(campaignAddress => {
//       CampaignInstance = Campaign.at(campaignAddress)

//     })
//   })
// })

// it('should set states after poll completed', () => {
//   let EthFundMeInstance
//   let CampaignInstance

//   let pollState
//   let approvalState
//   let campaignState

//   return EthFundMe.deployed()
//     .then(instance => {
//       EthFundMeInstance = instance
//       return EthFundMeInstance.campaigns.call(0)
//     })
//     .then(address => {
//       CampaignInstance = Campaign.at(address)
//       return CampaignInstance.pollState.call()
//     })
//     .then(_pollState => {
//       pollState = _pollState
//       return CampaignInstance.approvalState.call()
//     })
//     .then(_approvalState => {
//       approvalState = _approvalState
//       return CampaignInstance.campaignState.call()
//     })
//     .then(_campaignState => {
//       campaignState = _campaignState

//       assert.equal(pollState, 2, 'poll state should be 2 (Concluded)')
//       assert.equal(approvalState, 1, 'approval state should be 1 (Approved)')
//       assert.equal(campaignState, 1, 'campaign state should be 1 (Open)')
//     })
// })

// // TODO: it('should try to reveal a vote for an admin that hasnt voted and fail')
// // We need to add new admins before that can happen!

// it('should try to make a contribution of 0 and fail', () => {
//   let EthFundMeInstance
//   let CampaignInstance

//   let numContributors
//   let hasContributed

//   return EthFundMe.deployed()
//     .then(instance => {
//       EthFundMeInstance = instance
//       return EthFundMeInstance.campaigns.call(0)
//     })
//     .then(address => {
//       CampaignInstance = Campaign.at(address)
//       return CampaignInstance.contribute({ from: accounts[4], value: 0 })
//     })
//     .catch(e => {
//       CampaignInstance.numContributors.call().then(_numContributors => {
//         numContributors = _numContributors
//         return CampaignInstance.hasContributed.call(accounts[4])
//       }).then(_hasContributed => {
//         hasContributed = _hasContributed

//         assert.equal(numContributors, 0, 'there should zero contributors')
//         assert.equal(hasContributed, false, 'accounts[5] should not have contributed')
//       })
//     })
// })

// it('should make a single contribution of 1 ether', () => {
//   let EthFundMeInstance
//   let CampaignInstance

//   let numContributions
//   let contribution
//   let totalContributed
//   let funds
//   let campaignBalance

//   return EthFundMe.deployed()
//     .then(instance => {
//       EthFundMeInstance = instance
//       return EthFundMeInstance.campaigns.call(0)
//     })
//     .then(address => {
//       CampaignInstance = Campaign.at(address)
//       return CampaignInstance.contribute({ from: accounts[4], value: 1 })
//     })
//     .then(() => {
//       return CampaignInstance.getNumContributions.call(accounts[4])
//     })
//     .then(_numContributions => {
//       numContributions = _numContributions
//       return CampaignInstance.getContribution.call(accounts[4], 0)
//     })
//     .then(_contribution => {
//       contribution = _contribution
//       return CampaignInstance.getTotalContributed.call(accounts[4])
//     })
//     .then(_totalContributed => {
//       totalContributed = _totalContributed
//       return CampaignInstance.funds.call()
//     })
//     .then(_funds => {
//       funds = _funds
//       return web3.eth.getBalance(CampaignInstance.address)
//     })
//     .then((_campaignBalance) => {
//       campaignBalance = _campaignBalance

//       assert.equal(numContributions, 1, 'there should be 1 contribution')
//       assert.equal(contribution[0], 1, 'contribution amount should be 1')
//       assert.equal(totalContributed, 1, 'total contribution should be 1')
//       assert.equal(funds, 1, '1 ether should have been contributed')
//       assert.equal(campaignBalance, 1, 'Campaign balance should be 1')
//     })
// })

// it('should try to get totalContributed for an account that has not contributed', () => {
//   let EthFundMeInstance
//   let CampaignInstance

//   let totalContributed
//   let numContributions
//   let hasContributed

//   return EthFundMe.deployed()
//     .then(instance => {
//       EthFundMeInstance = instance
//       return EthFundMeInstance.campaigns.call(0)
//     })
//     .then(address => {
//       CampaignInstance = Campaign.at(address)
//       return CampaignInstance.getTotalContributed.call(accounts[5])
//     })
//     .then(_totalContributed => {
//       totalContributed = _totalContributed

//       return CampaignInstance.getNumContributions.call(accounts[5])
//     })
//     .then(_numContributions => {
//       numContributions = _numContributions
//       return CampaignInstance.hasContributed.call(accounts[5])
//     })
//     .then(_hasContributed => {
//       hasContributed = _hasContributed

//       assert.equal(totalContributed, 0, 'totalContributed should be 0')
//       assert.equal(numContributions, 0, 'totalContributed should be 0')
//       assert.equal(hasContributed, false, 'totalContributed should be 0')
//     })
// })

// // TODO: Make a second contribution from the same account
// it('should make a second contribution from accounts[4] of 2 ether', () => {
//   let EthFundMeInstance
//   let CampaignInstance

//   let numContributions
//   let contribution
//   let totalContributed
//   let funds
//   let campaignBalance

//   return EthFundMe.deployed()
//     .then(instance => {
//       EthFundMeInstance = instance
//       return EthFundMeInstance.campaigns.call(0)
//     })
//     .then(address => {
//       CampaignInstance = Campaign.at(address)
//       return CampaignInstance.contribute({ from: accounts[4], value: 2 })
//     })
//     .then(() => {
//       return CampaignInstance.getNumContributions.call(accounts[4])
//     })
//     .then(_numContributions => {
//       numContributions = _numContributions
//       return CampaignInstance.getContribution.call(accounts[4], 1)
//     })
//     .then(_contribution => {
//       contribution = _contribution
//       return CampaignInstance.getTotalContributed.call(accounts[4])
//     })
//     .then(_totalContributed => {
//       totalContributed = _totalContributed
//       return CampaignInstance.funds.call()
//     })
//     .then(_funds => {
//       funds = _funds
//       return web3.eth.getBalance(CampaignInstance.address)
//     })
//     .then((_campaignBalance) => {
//       campaignBalance = _campaignBalance

//       assert.equal(numContributions, 2, 'there should be 2 contributions')
//       assert.equal(contribution[0], 2, 'contribution amount should be 2')
//       assert.equal(totalContributed, 3, 'total contribution should be 3')
//       assert.equal(funds, 3, '3 ether should have been contributed')
//       assert.equal(campaignBalance, 3, 'Campaign balance should be 3')
//     })
// })

// TODO: test campaign getting rejected
// })
