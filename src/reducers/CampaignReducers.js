import ADD_CAMPAIGN from '../actions/CampaignActions'

// TODO: Why are Campaign Actions String not Working?
const initialState = []

function campaigns(state = initialState, action) {
  switch (action.type) {
    case 'ADD_CAMPAIGN':
      return state.concat(action.campaign)
    case 'UPDATE_CAMPAIGN':
      return state.map((campaign) => (
        (campaign.address === action.campaign.address)
          ? { ...action.campaign } : campaign
      ))
    default:
      return state
  }
}

export default campaigns
