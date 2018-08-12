export const TOGGLE_FILTER = 'TOGGLE_FILTER'

export function toggleFilter(filterIndex) {
  console.log(`filterIndex: ${filterIndex}`)
  return {
    type: TOGGLE_FILTER,
    filterIndex
  }
}
