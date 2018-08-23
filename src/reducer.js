import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'

import campaigns from './reducers/CampaignReducers'
import account from './reducers/AccountReducers'
import filters from './reducers/FilterReducers'
import isStopped from './reducers/IsStoppedReducers'

const reducer = combineReducers({
  account,
  campaigns,
  filters,
  isStopped,
  routing: routerReducer,
  ...drizzleReducers
})

export default reducer
