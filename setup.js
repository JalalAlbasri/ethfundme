let CampaignFactory = artifacts.require('CampaignFactory')
let Campaign = artifacts.require('Campaign')

let ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
let loremIpsum = require('lorem-ipsum')
let coolImages = require('cool-images') // TODO: savedev

const NUM_ADMINS = 3
const NUM_CAMPAIGNS = 10
const NUM_APPROVALS = 5
const NUM_REJECTIONS = 2

const SALT = 12345
const APPROVE_VOTE_OPTION = true
const REJECT_VOTE_OPTION = false
const APPROVE_VOTE_SECRET = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [APPROVE_VOTE_OPTION, SALT]).toString('hex')
const REJECT_VOTE_SECRET = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [REJECT_VOTE_OPTION, SALT]).toString('hex')

const GOAL_MIN = 20
const GOAL_MAX = 30
const DURATION_MIN = 1
const DURATION_MAX = 7
const CONTRIBUTION_MIN = 1
const CONTRIBUTION_MAX = 8

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports = function (callback) {
  const accounts = web3.eth.accounts

  let CampaignFactoryInstance
  let CampaignInstances = []

  let images = coolImages.many(200, 200, NUM_CAMPAIGNS)

  CampaignFactory.deployed()
    .then((instance) => {
      CampaignFactoryInstance = instance

      let adminPromises = []

      for (let i = 1; i < NUM_ADMINS; i++) {
        console.log(`granting account ${i} admin priviledges...`)
        let adminPromise = CampaignFactoryInstance.addAdminRole(accounts[i], { from: accounts[0] })
        adminPromises.push(adminPromise)
      }

      return Promise.all(adminPromises)
    })
    .then(() => {
      let createCampaignPromises = []

      for (let i = 0; i < NUM_CAMPAIGNS; i++) {
        console.log(`creating campaign ${i}...`)
        let title = loremIpsum({
          count: 1,
          units: 'sentences',
          sentenceLowerBound: 1,
          sentenceUpperBound: 4,
          format: 'plain'
        })
        let description = loremIpsum({
          count: 1,
          units: 'paragraph',
          paragraphLowerBound: 5,
          sentenceUpperBound: 10,
          format: 'plain'
        })
        let goal = web3.toWei(getRandomInt(GOAL_MIN, GOAL_MAX))
        let duration = getRandomInt(DURATION_MIN, DURATION_MAX)

        let createCampaignPromise = CampaignFactoryInstance.createCampaign(
          title,
          goal,
          duration,
          description,
          images[i],
          { from: accounts[3] }
        ).then((result) => {
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
          console.log(`admin ${j} approving campaign ${i}...`)
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
          let revealPromise = CampaignInstances[i].reveal(APPROVE_VOTE_OPTION, SALT, {
            from: accounts[j]
          })
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
          console.log(`admin ${j} rejecting campaign ${i}...`)
          let votePromise = CampaignInstances[i].vote(REJECT_VOTE_SECRET, { from: accounts[j] })
          votePromises.push(votePromise)
        }
      }
      return Promise.all(votePromises)
    })
    // TODO: put some campaigns in reveal phase
    .then(() => {
      // REVEAL REJECTIONS
      let revealPromises = []

      for (let i = NUM_APPROVALS; i < NUM_APPROVALS + NUM_REJECTIONS; i++) {
        for (let j = 0; j < NUM_ADMINS - 1; j++) {
          console.log(`admin ${j} revealing vote for campaign ${i}...`)
          let revealPromise = CampaignInstances[i].reveal(REJECT_VOTE_OPTION, SALT, {
            from: accounts[j]
          })
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
          let contribution = web3.toWei(getRandomInt(CONTRIBUTION_MIN, CONTRIBUTION_MAX))
          if (contribution > 0) {
            console.log(
              `contributing ${web3.fromWei(contribution)} eth from account ${j} to campaign ${i}...`
            )
            let contributePromise = CampaignInstances[i].contribute({
              from: accounts[j],
              value: contribution
            })
            contributePromises.push(contributePromise)
          }
        }
      }
      return Promise.all(contributePromises)
    })

    .then(() => {
      console.log('done')
      callback()
    })
}
