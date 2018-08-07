export const ADD_CAMPAIGN = 'ADD_CAMPAIGN'
export const UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'

export const addCampaign = (address) => ({
  type: ADD_CAMPAIGN,
  address
})

function campaignUpdated(campaign) {
  console.log(`campaignUpdated: ${JSON.stringify(campaign)}`)
  return {
    type: UPDATE_CAMPAIGN,
    campaign
  }
}

export function updateCampaign(address) {
  console.log('updateCampaign')

  return function (dispatch) {
    const web3Campaign = contract(CampaignContract)
    web3Campaign.setProvider(web3.currentProvider)
    let CampaignInstance

    let campaign = {
      address
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
        .then((status) => {
          campaign.status = Number(status)
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
          campaign.numVoteSecrets = Number(numVoteSecrets)
          return CampaignInstance.numVoteReveals.call({ from: coinbase })
        })
        .then((numVoteReveals) => {
          campaign.numVoteReveals = Number(numVoteReveals)
          return CampaignInstance.hasVoted.call(coinbase, { from: coinbase })
        })
        .then((hasVoted) => {
          console.log(`typeof hasVoted: ${typeof hasVoted}`)
          campaign.hasVoted = hasVoted
          return CampaignInstance.hasRevealed.call(coinbase, { from: coinbase })
        })
        .then((hasRevealed) => {
          campaign.hasRevealed = hasRevealed
          console.log(`campaign: ${JSON.stringify(campaign)}`)
          dispatch(campaignUpdated(campaign))
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
