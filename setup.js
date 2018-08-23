let CampaignFactory = artifacts.require('CampaignFactory')
let Campaign = artifacts.require('Campaign')

const ethjsAbi = require('ethereumjs-abi') // for soliditySha3 algo
const loremIpsum = require('lorem-ipsum')
const coolImages = require('cool-images')

const NUM_ADMINS = 3
const NUM_CAMPAIGNS = 20
const NUM_APPROVALS = 15
const NUM_REJECTIONS = 3

const SALT = ''
const APPROVE_VOTE_OPTION = true
const REJECT_VOTE_OPTION = false
const APPROVE_VOTE_SECRET = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [APPROVE_VOTE_OPTION, SALT]).toString('hex')
const REJECT_VOTE_SECRET = '0x' + ethjsAbi.soliditySHA3(['bool', 'uint'], [REJECT_VOTE_OPTION, SALT]).toString('hex')

const GOAL_MIN = 20
const GOAL_MAX = 50
const DURATION_MIN = 1
const DURATION_MAX = 7
const CONTRIBUTION_MIN = 1
const CONTRIBUTION_MAX = 10

const FIVE_DAYS = 5 * 24 * 60 * 60

// HACK
// Truffle exec has issues using OpenZeppelin Libraries from npm
// So I copied the increaseTime function here to make this script work.
function increaseTime(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    console.log(`timestamp (before): ${new Date(web3.eth.getBlock('latest').timestamp * 1000)}`)
    console.log('increasing time...')
    web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [duration],
        id: id
      },
      (err1) => {
        if (err1) return reject(err1)

        web3.currentProvider.sendAsync(
          {
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1
          },
          (err2, res) => {
            console.log(
              `timestamp (after): ${new Date(web3.eth.getBlock('latest').timestamp * 1000)}`
            )
            return err2 ? reject(err2) : resolve(res)
          }
        )
      }
    )
  })
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports = function (callback) {
  console.log('setup script starting...')
  const accounts = web3.eth.accounts

  let CampaignFactoryInstance
  let CampaignInstances = []
  let CampaignEndDates = []

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
    .then(() => {
      // REVEAL REJECTIONS
      let revealPromises = []

      for (let i = NUM_APPROVALS; i < NUM_APPROVALS + NUM_REJECTIONS - 2; i++) {
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
        for (let j = 4; j < accounts.length - 1; j++) {
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

    .then(() => increaseTime(FIVE_DAYS))
    .then(() => {
      console.log('get camapign end dates...')
      let endDatePromises = []

      for (let i = 0; i < NUM_CAMPAIGNS; i++) {
        let endDatePromise = CampaignInstances[i].endDate.call().then((endDate) => {
          CampaignEndDates.push(Number(endDate))
        })
        endDatePromises.push(endDatePromise)
      }

      return Promise.all(endDatePromises)
    })
    .then(() => {
      console.log('transition campaigns...')
      let transitionCampaignPromises = []

      for (let i = 0; i < NUM_CAMPAIGNS; i++) {
        if (
          CampaignEndDates[i] !== 0
          && Number(web3.eth.getBlock('latest').timestamp) >= CampaignEndDates[i]
        ) {
          console.log(`ending campaign ${i}`)
          let transitionCampaignPromise = CampaignInstances[i].endCampaign()
          transitionCampaignPromises.push(transitionCampaignPromise)
        }
      }

      return Promise.all(transitionCampaignPromises)
    })

    .then(() => {
      console.log('done')
      callback()
    })
    .catch((err) => {
      console.log(`${err}}`)
    })
}
