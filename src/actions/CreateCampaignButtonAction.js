const contract = require('truffle-contract')
import EthFundMeContract from '../../build/contracts/EthFundMe.json'
import CampaignContract from '../../build/contracts/Campaign.json'

export const CAMPAIGN_CREATED = 'CAMPAIGN_CREATED'

function campaignCreated(contractConfig, events, web3) {
  return {
    type: ADD_CONTRACT,
    drizzle,
    contractConfig,
    events,
    web3
  }
}

export function createCampaign() {
  console.log('createCampaign()')

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {
    return function (dispatch) {


      const ethfundme = contract(EthFundMeContract)
      ethfundme.setProvider(web3.currentProvider)
      let ethfundmeInstance
      web3.eth.getCoinbase((err, coinbase) => {
        if (err) {
          console.log(err)
        }
        ethfundme.deployed().then((instance) => {
          ethfundmeInstance = instance
          return ethfundmeInstance.createCampaign('web campaign', 10, 1, { from: coinbase })
        }).then((result) => {
          console.log(`campaignAddress: ${result.logs[0].args.campaignAddress}`)
          const campaignAddress = result.logs[0].args.campaignAddress

          let contractConfig = {
            contractName: campaignAddress,
            web3Contract: new web3.eth.contract(CampaignContract, campaignAddress)
          }
        
          let events = []
          
          dispatch({type: 'ADD_CONTRACT', drizzle, contractConfig, events, web3})
        }).catch((err) => {
          console.log(err)
        })
      })


      
    }
  }
}
