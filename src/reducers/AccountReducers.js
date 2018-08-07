// TODO: does this const not work in swtich statements?
import UPDATE_ACCOUNT from '../actions/AccountActions'

const initialState = {}

function account(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        ...action.account
      }
    default:
      return state
  }
}

export default account
