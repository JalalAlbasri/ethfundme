import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import campaigns from './reducers/CampaignReducers'
import account from './reducers/AccountReducers'

const reducer = combineReducers({
  account,
  campaigns,
  routing: routerReducer,
  ...drizzleReducers
})

export default reducer
