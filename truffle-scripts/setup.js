let EthFundMe = artifacts.require('EthFundMe')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo

const NUM_ADMINS = 3
const NUM_CAMPAIGNS = 10
const NUM_APPROVALS = 5
const NUM_REJECTIONS = 2

const SALT = 12345
const APPROVE_VOTE_OPTION = true
const REJECT_VOTE_OPTION = false
const APPROVE_VOTE_SECRET = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [APPROVE_VOTE_OPTION, SALT]).toString('hex')
const REJECT_VOTE_SECRET = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [REJECT_VOTE_OPTION, SALT]).toString('hex')

module.exports = function (callback) {
  const accounts = web3.eth.accounts

  let EthFundMeInstance
  let CampaignInstances = []

  EthFundMe.deployed().then((instance) => {
    EthFundMeInstance = instance

    let createCampaignPromises = []

    for (let i = 0; i < NUM_CAMPAIGNS; i++) {
      console.log(`creating campaign ${i}...`)
      let createCampaignPromise = EthFundMeInstance.createCampaign('Campaign ' + i, 30, 1, { from: accounts[3] })
        .then((result) => {
          CampaignInstances.push(Campaign.at(result.logs[0].args.campaignAddress))
        })
      createCampaignPromises.push(createCampaignPromise)
    }

    return Promise.all(createCampaignPromises)
  })
    .then(() => {
      // VOTE APPROVALS
      console.log(`${CampaignInstances.length} campaigns created`)
      let votePromises = []

      for (let i = 0; i < NUM_APPROVALS; i++) {
        for (let j = 0; j < NUM_ADMINS; j++) {
          console.log(`admin ${j} voting on campaign ${i}...`)
          let votePromise = CampaignInstances[i].vote(APPROVE_VOTE_SECRET, { from: accounts[j] })
          votePromises.push(votePromise)
        }
      }
      return Promise.all(votePromises)
    })
    .then(() => {
      // REVEAL APPROVALS
      let revealPromises = []

      for (let i = 0; i < NUM_APPROVALS; i++) {
        for (let j = 0; j < NUM_ADMINS - 1; j++) {
          console.log(`admin ${j} revealing vote for campaign ${i}...`)
          let revealPromise = CampaignInstances[i].reveal(APPROVE_VOTE_OPTION, SALT, { from: accounts[j] })
          revealPromises.push(revealPromise)
        }
      }
      return Promise.all(revealPromises)
    })
    .then(() => {
      // VOTE REJECTIONS
      console.log(`${CampaignInstances.length} campaigns created`)
      let votePromises = []

      for (let i = NUM_APPROVALS; i < NUM_APPROVALS + NUM_REJECTIONS; i++) {
        for (let j = 0; j < NUM_ADMINS; j++) {
          console.log(`admin ${j} voting on campaign ${i}...`)
          let votePromise = CampaignInstances[i].vote(REJECT_VOTE_SECRET, { from: accounts[j] })
          votePromises.push(votePromise)
        }
      }
      return Promise.all(votePromises)
    })
    .then(() => {
      // REVEAL REJECTIONS
      let revealPromises = []

      for (let i = NUM_APPROVALS; i < NUM_APPROVALS + NUM_REJECTIONS; i++) {
        for (let j = 0; j < NUM_ADMINS - 1; j++) {
          console.log(`admin ${j} revealing vote for campaign ${i}...`)
          let revealPromise = CampaignInstances[i].reveal(REJECT_VOTE_OPTION, SALT, { from: accounts[j] })
          revealPromises.push(revealPromise)
        }
      }
      return Promise.all(revealPromises)
    })

    .then(() => {
      // MAKE SOMME CONTRIBUTIONS

      let contributePromises = []

      for (let i = 0; i < NUM_APPROVALS; i++) {
        for (let j = 4; j < accounts.length; j++) {
          let contribution = Math.ceil((Math.random() + 1) * 3)
          console.log(`contributing ${contribution} eth from account ${j} to campaign ${i}...`)
          let contributePromise = CampaignInstances[i].contribute({ from: accounts[j], value: contribution })
          contributePromises.push(contributePromise)
        }
      }
      return Promise.all(contributePromises)
    })


    .then(() => {
      console.log('done')
      callback()
    })
}
