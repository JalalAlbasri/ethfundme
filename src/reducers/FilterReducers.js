import { SET_FILTER_GROUP, SET_ADMIN_FILTER } from '../actions/FilterActions'

const initialState = {
  All: {
    isActive: true
  },
  Pending: {
    isActive: true,
    adminFilters: {
      Commit: {
        isActive: true
      },
      Reveal: {
        isActive: true
      }
    }
  },
  Active: {
    isActive: true
  },
  Successful: {
    isActive: true
  },
  Unsuccessful: {
    isActive: true,
    adminFilters: {
      Approved: {
        isActive: true
      },
      Rejected: {
        isActive: true
      }
    }
  },
  Cancelled: {
    isActive: true
  }
}

function filters(state = initialState, action) {
  switch (action.type) {
    case 'SET_FILTER_GROUP':
      return {
        ...state,
        [action.filterGroupName]: {
          ...state[action.filterGroupName],
          isActive: action.isActive
        }
      }
      // return Object.assign({}, state, {
      //   [action.filterGroupName]: action.isActive
      // })
    case 'SET_ADMIN_FILTER':
      return {
        ...state,
        [action.filterGroupName]: {
          ...state[action.filterGroupName],
          adminFilters: {
            ...state[action.filterGroupName].adminFilters,
            [action.adminFilterName]: {
              ...state[action.filterGroupName].adminFilters[action.adminFilterName],
              isActive: action.isActive
            }
          }
        }
      }
    // case 'TOGGLE_FILTER':
    //   return state.map(
    //     (filter) => filter.name === action.filterName
    //       ? {
    //         name: action.filterName,
    //         isActive: !filter.isActive
    //       }
    //       : filter
    //   )
    default:
      return state
  }
}

export default filters

// {
//   name: 'All',
//   isActive: false
// },
// {
//   name: 'Pending',
//   isActive: true,
//   adminFilters: [
//     {
//       name: 'Commit',
//       isActive: 'true'
//     },
//     {
//       name: 'Reveal',
//       isActive: true
//     }
//   ]
// },
// {
//   name: 'Active',
//   isActive: true
// },
// {
//   name: 'Successful',
//   isActive: true
// },
// {
//   name: 'Unsuccessful',
//   isActive: false,
//   adminFilters: [
//     {
//       name: 'Rejected',
//       isActive: false
//     }
//   ]
// },
// {
//   name: 'Cancelled',
//   isActive: false
// }
// ]

// const initialState = [
//   {
//     name: 'All',
//     isActive: false
//   },
//   {
//     name: 'Commit',
//     isActive: true
//   },
//   {
//     name: 'Reveal',
//     isActive: true
//   },
//   {
//     name: 'Approved',
//     isActive: true
//   },
//   {
//     name: 'Rejected',
//     isActive: false
//   },
//   {
//     name: 'Pending',
//     isActive: true
//   },
//   {
//     name: 'Active',
//     isActive: true
//   },
//   {
//     name: 'Successful',
//     isActive: false
//   },
//   {
//     name: 'Unsuccessful',
//     isActive: false
//   },
//   {
//     name: 'Cancelled',
//     isActive: false
//   }
// ]
