export const ADD_CAMPAIGN = 'ADD_CAMPAIGN'
export const UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN'

export const addCampaign = (address) => ({
  type: ADD_CAMPAIGN,
  address
})

export const updateCampaign = (campaign) => ({
  type: UPDATE_CAMPAIGN,
  campaign
})
