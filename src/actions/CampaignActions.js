export const ADD_CAMPAIGN = 'ADD_CAMPAIGN'
export const UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

export const addCampaign = (address) => ({
  type: ADD_CAMPAIGN,
  address
})

export function updateCampaign(campaign) {
  return {
    type: UPDATE_CAMPAIGN,
    campaign
  }
}

export function getCampaignDetails(address) {
  return function (dispatch) {
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
          return CampaignInstance.title.call({ from: coinbase })
        })
        .then((title) => {
          campaign.title = title
          return CampaignInstance.goal.call({ from: coinbase })
        })
        .then((goal) => {
          campaign.goal = Number(goal)
          return CampaignInstance.duration.call({ from: coinbase })
        })
        .then((duration) => {
          campaign.duration = Number(duration)
          return CampaignInstance.funds.call({ from: coinbase })
        })
        .then((funds) => {
          campaign.funds = Number(funds)
          return CampaignInstance.campaignState.call({ from: coinbase })
        })
        .then((campaignState) => {
          campaign.campaignState = Number(campaignState)
          return CampaignInstance.manager.call({ from: coinbase })
        })
        .then((manager) => {
          campaign.manager = manager
          return CampaignInstance.approvalState.call({ from: coinbase })
        })
        .then((approvalState) => {
          campaign.approvalState = Number(approvalState)
          return CampaignInstance.numVoteSecrets.call({ from: coinbase })
        })
        .then((numVoteSecrets) => {
          console.log(`numVoteSecrets: ${numVoteSecrets}`)
          campaign.numVoteSecrets = Number(numVoteSecrets)
          return CampaignInstance.numVoteReveals.call({ from: coinbase })
        })
        .then((numVoteReveals) => {
          campaign.numVoteReveals = Number(numVoteReveals)
          return CampaignInstance.hasVoted.call(coinbase, { from: coinbase })
        })
        .then((hasVoted) => {
          console.log(`hasVoted: ${hasVoted}`)
          campaign.hasVoted = hasVoted
          return CampaignInstance.hasRevealed.call(coinbase, { from: coinbase })
        })
        .then((hasRevealed) => {
          campaign.hasRevealed = hasRevealed
          return CampaignInstance.hasContributed.call(coinbase, { from: coinbase })
        })
        .then((hasContributed) => {
          campaign.hasContributed = hasContributed
          return CampaignInstance.getNumContributions.call({ from: coinbase })
        })
        .then((numContributions) => {
          campaign.numContributions = numContributions

          let contributionPromises = []

          // FIXME: dispatch occurs before promises in loop resolve
          if (campaign.numContributions > 0) {
            for (let i = 0; i < campaign.numContributions; i++) {
              let contributionPromise = CampaignInstance.contributions.call(i, { from: coinbase }).then((contribution) => {
                campaign.contributions[i] = {
                  address: contribution[0],
                  amount: Number(contribution[1]),
                  time: Number(contribution[2])
                }
              })
              contributionPromises.push(contributionPromise)
            }
          }

          return Promise.all(contributionPromises)
        })

        .then(() => {
          dispatch(updateCampaign(campaign))
        })

        .catch((err) => {
          console.log(err)
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
          return CampaignInstance.contribute({ from: coinbase, value: contribution })
        }).then((result) => {
          dispatch(getCampaignDetails(campaign.address))
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
    let CampaignInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3Campaign
        .at(campaign.address)
        .then((instance) => {
          CampaignInstance = instance
          return CampaignInstance.vote(voteSecret, { from: coinbase })
        })
        .then((result) => {
          dispatch(getCampaignDetails(campaign.address))
        })
        .catch((err) => {
          console.log(err)
        })
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
          dispatch(getCampaignDetails(campaign.address))
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}


// TODO: Get Contributions, will only be able to interact with contributions once we have an approved campaign!
//   return CampaignInstance.getNumContributions.call({ from: coinbase })
// })
// .then((numContributions) => {
//   for (let i = 0; i < numContributions; i++) {
//     CampaignInstance.contributions.call(i, { from: coinbase })
//       .then((contribution) => {
//         console.log(contribution)
//       })
//   }
