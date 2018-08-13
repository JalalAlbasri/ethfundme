import TOGGLE_FILTER from '../actions/FilterActions'

const initialState = [
  {
    name: 'All',
    isActive: false
  },
  {
    name: 'Commit',
    isActive: true
  },
  {
    name: 'Reveal',
    isActive: true
  },
  {
    name: 'Approved',
    isActive: true
  },
  {
    name: 'Rejected',
    isActive: false
  },
  {
    name: 'Pending',
    isActive: true
  },
  {
    name: 'Active',
    isActive: true
  },
  {
    name: 'Successful',
    isActive: false
  },
  {
    name: 'Unsuccessful',
    isActive: false
  },
  {
    name: 'Cancelled',
    isActive: false
  }
]


function filters(state = initialState, action) {
  switch (action.type) {
    case 'TOGGLE_FILTER':
      return state.map((filter) => (filter.name === action.filterName) ? {
        name: action.filterName,
        isActive: !filter.isActive
      } : filter)
    default:
      return state
  }
}

export default filters
