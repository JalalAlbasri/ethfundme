import TOGGLE_IS_STOPPED from '../actions/IsStoppedActions'

const initialState = false

function isStopped(state = initialState, action) {
  switch (action.type) {
    case 'TOGGLE_IS_STOPPED':
      return !state
    default:
      return state
  }
}

export default isStopped
