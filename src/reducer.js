import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'

import campaigns from './reducers/CampaignReducers'
import account from './reducers/AccountReducers'
import filters from './reducers/FilterReducers'

const reducer = combineReducers({
  account,
  campaigns,
  filters,
  routing: routerReducer,
  ...drizzleReducers
})

export default reducer
