export const getSelectData = (select = []) => {
  return Object.fromEntries(
    select.map((key) => [key, 1])
  )
}

export const getUnSelectData = (unselect = []) => {
  return Object.fromEntries(
    unselect.map((key) => [key, 0])
  )
}