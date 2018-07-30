import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducer'
import { generateContractsInitialState } from 'drizzle'
import drizzleOptions from './drizzleOptions'

const initialState = {
  contracts: generateContractsInitialState(drizzleOptions)
}

const store = createStore(
  reducer,
  initialState
)

export default store
