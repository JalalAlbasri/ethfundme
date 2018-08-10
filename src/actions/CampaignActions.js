export const ADD_CAMPAIGN = 'ADD_CAMPAIGN'
export const UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN'

const contract = require('truffle-contract')
import CampaignContract from '../../build/contracts/Campaign.json'
import EthFundMeContract from '../../build/contracts/EthFundMe.json'

function campaignAdded(campaign) {
  return {
    type: ADD_CAMPAIGN,
    campaign
  }
}

function campaignUpdated(campaign) {
  return {
    type: UPDATE_CAMPAIGN,
    campaign
  }
}

function getCampaignDetails(address) {
  console.log(`getCampaignDetails() address: ${address}`)

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
              let contributionPromise = CampaignInstance.contributions.call(i, { from: coinbase })
                .then((contribution) => {
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
          resolve(campaign)
        })

        .catch((err) => {
          reject(err)
        })
    })
  })
}

function addCampaign(campaignAddress) {
  return function (dispatch) {
    getCampaignDetails(campaignAddress).then((campaign) => {
      console.log(`addCampaign, campaign: ${JSON.stringify(campaign)}`)
      dispatch(campaignAdded(campaign))
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
  console.log('addCampaigns')
  return function (dispatch) {
    const web3EthFundMe = contract(EthFundMeContract)
    web3EthFundMe.setProvider(web3.currentProvider)

    let EthFundMeInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3EthFundMe.deployed().then((instance) => {
        EthFundMeInstance = instance
        return EthFundMeInstance.getNumCampaigns.call({ from: coinbase })
      })
        .then((numCampaigns) => {
          // let campaignPromises = []

          for (let i = 0; i < numCampaigns; i++) {
            EthFundMeInstance.campaigns.call(i, { from: coinbase })
            // let campaignPromise = EthFundMeInstance.campaigns.call(i, { from: coinbase })
              .then((campaignAddress) => {
                dispatch(addCampaign(campaignAddress))
              })
            // campaignPromises.push(campaignPromise)
          }

          // return Promise.all(campaignPromises)
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

export function createCampaign(title, duration, goal) {
  return function (dispatch) {
    const web3EthFundMe = contract(EthFundMeContract)
    web3EthFundMe.setProvider(web3.currentProvider)

    let EthFundMeInstance

    web3.eth.getCoinbase((err, coinbase) => {
      if (err) {
        console.log(err)
      }
      web3EthFundMe.deployed().then((instance) => {
        EthFundMeInstance = instance
        return EthFundMeInstance.createCampaign(title, duration, goal, { from: coinbase })
      })
        .then((result) => {
          const campaignAddress = result.logs[0].args.campaignAddress
          dispatch(addCampaign(campaignAddress))
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
          dispatch(updateCampaign(campaign.address))
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

export function timeTravel() {
  const id = Date.now()

  return function (dispatch) {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [1],
        id: id
      }, (err1) => {
        if (err1) return reject(err1)

        web3.currentProvider.sendAsync({
          jsonrpc: '2.0',
          method: 'evm_mine',
          id: id + 1
        }, (err2, res) => {
          return err2 ? reject(err2) : resolve(res)
        })
      })
    }).then(() => {
      dispatch(updateCampaigns())
    })
  }
}
