import EthFundMe from './../build/contracts/EthFundMe.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:7545'
    }
  },
  contracts: [
    EthFundMe
  ],
  events: {
    EthFundMe: [
      'CampaignCreated'
    //   {
    //   eventName: 'CampaignCreated',
    //   eventOptions: {

    //   } 
    // }
  ]

  },
  polls: {
    accounts: 1500
  },
  syncAlways: true
}

export default drizzleOptions
