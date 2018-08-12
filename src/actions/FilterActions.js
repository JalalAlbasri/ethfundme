export const TOGGLE_FILTER = 'TOGGLE_FILTER'

export function toggleFilter(filterName) {
  console.log(`filterName: ${filterName}`)
  return {
    type: TOGGLE_FILTER,
    filterName
  }
}
