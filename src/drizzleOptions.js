import CampaignFactory from './../build/contracts/CampaignFactory.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    CampaignFactory
  ],
  events: {
    CampaignFactory: [
      'LogCampaignCreated'
    ]

  },
  polls: {
    accounts: 1500
  },
  syncAlways: true
}

export default drizzleOptions
