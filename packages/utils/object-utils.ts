export const removeUndefinedValues = <T extends Record<string, unknown>>(
  params: T,
) => {
  if (!Array.isArray(params)) {
    if (typeof params !== 'object') {
      return params
    }

    const keysValues = Object.entries(params as object)
    const newObject = {}

    keysValues.forEach(([key, value]) => {
      if (!value) {
        return
      }

      Object.assign(newObject, {
        [key]: value,
      })

      return
    })

    return newObject as T
  }
}
