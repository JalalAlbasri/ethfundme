import ADD_CAMPAIGN from '../actions/CampaignActions'

// TODO: Consider using object w/ key address to hold campaigns instead of array,
const initialState = []

function campaigns(state = initialState, action) {
  switch (action.type) {
    case 'ADD_CAMPAIGN':
      return [
        ...state,
        {
          address: action.address
        }
      ]
    case 'UPDATE_CAMPAIGN':
      console.log(`UPDATE_CAMPAIGN: ${JSON.stringify(action.campaign)}`)
      return state.map((campaign) => (
        (campaign.address === action.campaign.address)
          ? { ...action.campaign } : campaign
      ))
    default:
      return state
  }
}

export default campaigns
