export const ADD_CAMPAIGN = 'ADD_CAMPAIGN'
export const UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN'
const contract = require('truffle-contract')

import CampaignContract from '../../build/contracts/Campaign.json'
import CampaignFactoryContract from '../../build/contracts/CampaignFactory.json'

import { getAccountDetails } from './AccountActions'

export const CAMPAIGN_STATES = ['Pending', 'Active', 'Successful', 'Unsuccessful', 'Cancelled']
export const APPROVAL_STATES = ['Commit', 'Reveal', 'Approved', 'Rejected', 'Cancelled']

import { inLogs } from 'zeppelin-solidity/test/helpers/expectEvent'

function campaignAdded(campaign) {
  // console.log(`campaignAdded() campaign.address: ${campaign.address}`)
  return {
    type: ADD_CAMPAIGN,
    campaign
  }
}

function campaignUpdated(campaign) {
  // console.log(`campaignUpdated(), ${campaign.address}`)
  return {
    type: UPDATE_CAMPAIGN,
    campaign
  }
}

function getCampaignDetails(address) {
  // console.log(`getCampaignDetails() address: ${address}`)

  return new Promise((resolve, reject) => {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    let campaign = {
      address,
      contributions: []
    }

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.id.call({ from: coinbase })
        })
        .then((id) => {
          campaign.id = Number(id)
          return CampaignInstance.isStopped.call({ from: coinbase })
        })
        .then((isStopped) => {
          campaign.isStopped = isStopped
          return CampaignInstance.title.call({ from: coinbase })
        })
        .then((title) => {
          campaign.title = title
          return CampaignInstance.goal.call({ from: coinbase })
        })
        .then((goal) => {
          campaign.goal = web3.fromWei(Number(goal))
          return CampaignInstance.duration.call({ from: coinbase })
        })
        .then((duration) => {
          campaign.duration = Number(duration)
          return CampaignInstance.description.call({ from: coinbase })
        })
        .then((description) => {
          campaign.description = description
          return CampaignInstance.image.call({ from: coinbase })
        })
        .then((image) => {
          campaign.image = image
          return CampaignInstance.endDate.call({ from: coinbase })
        })
        .then((endDate) => {
          campaign.endDate = Number(endDate)
          return CampaignInstance.funds.call({ from: coinbase })
        })
        .then((funds) => {
          campaign.funds = web3.fromWei(Number(funds))
          return CampaignInstance.campaignState.call({ from: coinbase })
        })
        .then((campaignState) => {
          campaign.campaignState = CAMPAIGN_STATES[Number(campaignState)]
          return CampaignInstance.manager.call({ from: coinbase })
        })
        .then((manager) => {
          campaign.manager = manager
          return CampaignInstance.approvalState.call({ from: coinbase })
        })
        .then((approvalState) => {
          campaign.approvalState = APPROVAL_STATES[Number(approvalState)]
          return CampaignInstance.numVoteSecrets.call({ from: coinbase })
        })
        .then((numVoteSecrets) => {
          campaign.numVoteSecrets = Number(numVoteSecrets)
          return CampaignInstance.numVoteReveals.call({ from: coinbase })
        })
        .then((numVoteReveals) => {
          campaign.numVoteReveals = Number(numVoteReveals)
          return CampaignInstance.hasVoted.call(coinbase, { from: coinbase })
        })
        .then((hasVoted) => {
          campaign.hasVoted = hasVoted
          return CampaignInstance.hasRevealed.call(coinbase, { from: coinbase })
        })
        .then((hasRevealed) => {
          campaign.hasRevealed = hasRevealed
          return CampaignInstance.hasContributed.call(coinbase, { from: coinbase })
        })
        .then((hasContributed) => {
          campaign.hasContributed = hasContributed
          return CampaignInstance.hasWithdrawn.call(coinbase, { from: coinbase })
        })
        .then((hasWithdrawn) => {
          campaign.hasWithdrawn = hasWithdrawn
          return CampaignInstance.totalRaised.call({ from: coinbase })
        })
        .then((totalRaised) => {
          campaign.totalRaised = web3.fromWei(Number(totalRaised))
          return CampaignInstance.getTotalContributed.call({ from: coinbase })
        })
        .then((totalContributed) => {
          campaign.totalContributed = web3.fromWei(Number(totalContributed))
          return CampaignInstance.getNumContributions.call({ from: coinbase })
        })
        .then((numContributions) => {
          campaign.numContributions = Number(numContributions)

          let contributionPromises = []

          if (campaign.numContributions > 0) {
            for (let i = 0; i < campaign.numContributions; i++) {
              let contributionPromise = CampaignInstance.contributions
                .call(i, { from: coinbase })
                .then((contribution) => {
                  campaign.contributions[i] = {
                    address: contribution[0],
                    amount: web3.fromWei(Number(contribution[1])),
                    time: Number(contribution[2]),
                    withdrawn: contribution[3]
                  }
                })
              contributionPromises.push(contributionPromise)
            }
          }

          return Promise.all(contributionPromises)
        })

        .then(() => {
          resolve(campaign)
        })

        .catch((err) => {
          reject(err)
        })
    })
  })
}

function addCampaign(campaignAddress, isNew) {
  return function (dispatch) {
    getCampaignDetails(campaignAddress).then((campaign) => {
      dispatch(campaignAdded({ ...campaign, isNew }))
    })
  }
}

export function updateCampaign(campaignAddress) {
  return function (dispatch) {
    getCampaignDetails(campaignAddress).then((campaign) => {
      dispatch(campaignUpdated(campaign))
    })
  }
}

export function addCampaigns() {
  return function (dispatch) {
    const web3CampaignFactory = contract(CampaignFactoryContract)
    web3CampaignFactory.setProvider(web3.currentProvider)

    let CampaignFactoryInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3CampaignFactory
        .deployed()
        .then((instance) => {
          CampaignFactoryInstance = instance
          return CampaignFactoryInstance.getNumCampaigns.call({ from: coinbase })
        })
        .then((numCampaigns) => {
          for (let i = 0; i < numCampaigns; i++) {
            CampaignFactoryInstance.campaigns.call(i, { from: coinbase }).then((campaignAddress) => {
              dispatch(addCampaign(campaignAddress))
            })
          }
        })
    })
  }
}

function updateCampaigns() {
  return function (dispatch, getState) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)

    const state = getState()
    const campaigns = state.campaigns

    for (let i = 0; i < campaigns.length; i++) {
      dispatch(updateCampaign(campaigns[i].address))
    }
  }
}

export function createCampaign(title, goal, duration, description, image) {
  return function (dispatch) {
    const web3CampaignFactory = contract(CampaignFactoryContract)
    web3CampaignFactory.setProvider(web3.currentProvider)

    let CampaignFactoryInstance
    let campaignAddress

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3CampaignFactory
        .deployed()
        .then((instance) => {
          CampaignFactoryInstance = instance
          return CampaignFactoryInstance.createCampaign(
            title,
            web3.toWei(goal, 'ether'),
            duration,
            description,
            image,
            {
              from: coinbase
            }
          )
        })
        .then((result) => {
          campaignAddress = result.logs[0].args.campaignAddress
          setTimeout(() => dispatch(addCampaign(campaignAddress, true)), 6000)
        })
    })
  }
}

export function contribute(campaign, contribution) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.contribute({
            from: coinbase,
            value: web3.toWei(contribution, 'ether')
          })
        })
        .then((result) => {
          setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}

export function placeVote(campaign, voteSecret) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)

    web3.eth.getCoinbase(async (err, coinbase) => {
      if (err) {
        console.log(err)
      }

      const instance = await web3Campaign.at(campaign.address)
      const receipt = await instance.vote(voteSecret, { from: coinbase })
      await inLogs(receipt.logs, 'LogVoteComitted')
      setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
    })
  }
}

export function revealVote(campaign, voteOption, salt) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.reveal(voteOption, salt, { from: coinbase })
        })
        .then((result) => {
          setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}

export function cancel(campaign) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.cancelCampaign({ from: coinbase })
        })
        .then((result) => {
          setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}

export function withdraw(campaign) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.withdraw({ from: coinbase })
        })
        .then((result) => {
          setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
          setTimeout(() => dispatch(getAccountDetails(coinbase)), 6000)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}

export function emergencyWithdraw(campaign) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.emergencyWithdraw({ from: coinbase })
        })
        .then((result) => {
          setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
          setTimeout(() => dispatch(getAccountDetails(coinbase)), 6000)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}

export function emergencyStop(campaign) {
  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          if (campaign.isStopped) return CampaignInstance.resumeContract({ from: coinbase })
          return CampaignInstance.stopContract({ from: coinbase })
        })
        .then((result) => {
          setTimeout(() => dispatch(updateCampaign(campaign.address)), 6000)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}
