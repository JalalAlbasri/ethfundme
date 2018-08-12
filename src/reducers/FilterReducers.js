import TOGGLE_FILTER from '../actions/FilterActions'

const initialState = [true, true, true, false, false]

console.log(`initialState: ${initialState}`)
console.log(`typeof initialState: ${typeof initialState}`)

function filter(state = initialState, action) {
  switch (action.type) {
    case 'TOGGLE_FILTER':
      console.log(`TOGGLE_FILTER action.filterIndex: ${action.filterIndex}`)
      return state.map((filterState, i) => (i === action.filterIndex) ? !filterState : filterState)
    default:
      return state
  }
}

export default filter
