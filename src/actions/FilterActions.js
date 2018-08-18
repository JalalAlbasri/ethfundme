export const SET_FILTER_GROUP = 'SET_FILTER_GROUP'
export const SET_ADMIN_FILTER = 'SET_ADMIN_FILTER'

function setFilterGroup(filterGroupName, isActive) {
  return {
    type: SET_FILTER_GROUP,
    filterGroupName,
    isActive
  }
}
function setAdminFilter(filterGroupName, adminFilterName, isActive) {
  console.log(
    `setAdminFilter, filterGroupName: ${filterGroupName}, adminFilterName ${adminFilterName}, isActive: ${isActive}`
  )
  return {
    type: SET_ADMIN_FILTER,
    filterGroupName,
    adminFilterName,
    isActive
  }
}

export function setFilter(filterGroupName, adminFilterName) {
  return (dispatch, getState) => {
    let state = getState()

    if (filterGroupName === 'All') {
      let isActive = !state.filters.All.isActive

      Object.keys(state.filters).forEach((filterGroupKey) => {
        dispatch(setFilterGroup(filterGroupKey, isActive))
        if (Object.prototype.hasOwnProperty.call(state.filters[filterGroupKey], 'adminFilters')) {
          Object.keys(state.filters[filterGroupKey].adminFilters).forEach((adminFilterKey) => {
            dispatch(setAdminFilter(filterGroupKey, adminFilterKey, isActive))
          })
        }
      })
    }

    if (adminFilterName) {
      dispatch(
        setAdminFilter(
          filterGroupName,
          adminFilterName,
          !state.filters[filterGroupName].adminFilters[adminFilterName].isActive
        )
      )
    } else {
      dispatch(setFilterGroup(filterGroupName, !state.filters[filterGroupName].isActive))
      if (Object.prototype.hasOwnProperty.call(state.filters[filterGroupName], 'adminFilters')) {
        Object.keys(state.filters[filterGroupName].adminFilters).forEach((adminFilterKey) => dispatch(
          setAdminFilter(
            filterGroupName,
            adminFilterKey,
            !state.filters[filterGroupName].isActive
          )
        ))
      }
    }
  }
}
