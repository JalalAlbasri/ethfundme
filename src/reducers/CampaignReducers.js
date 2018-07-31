import ADD_CAMPAIGN from '../actions/CampaignActions'

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
    default:
      return state
  }
}

export default campaigns
