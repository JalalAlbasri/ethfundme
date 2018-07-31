import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import campaigns from './campaign/reducers'

const reducer = combineReducers({
  campaigns,
  routing: routerReducer,
  ...drizzleReducers
})

export default reducer
