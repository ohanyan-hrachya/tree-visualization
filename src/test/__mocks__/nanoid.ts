let counter = 0

export const nanoid = () => {
  counter += 1
  return `test-id-${counter}`
}

export const __resetNanoid = () => {
  counter = 0
}
