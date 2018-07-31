import ADD_CAMPAIGN from './actions'

// const initialState = {
//   campaigns: []
// }

const initialState = []

function campaigns(state = initialState, action) {
  console.log(`campaigns reducer, action.type: ${action.type}`)
  switch (action.type) {
    case 'ADD_CAMPAIGN':
      console.log('ADD_CAMPAIGN')
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
