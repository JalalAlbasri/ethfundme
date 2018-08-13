export const TOGGLE_FILTER = 'TOGGLE_FILTER'

export function toggleFilter(filterName) {
  return {
    type: TOGGLE_FILTER,
    filterName
  }
}
