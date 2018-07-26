const initialState = {
  data: null
}

const campaignReducer = (state = initialState, action) => {
  if (action.type === 'CAMPAIGN_CREATED') {
    return Object.assign({}, state, {
      data: action.payload
    })
  }

  return state
}

export default campaignReducer
