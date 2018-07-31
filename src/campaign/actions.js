export const ADD_CAMPAIGN = 'ADD_CAMPAIGN'

export function addCampaign(address) {
  return {
    type: ADD_CAMPAIGN,
    address
  }
}
