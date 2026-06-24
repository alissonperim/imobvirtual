import { removeUndefinedValues } from '../object-utils'

describe('remove-undefined-values tests', () => {
  it('should return object without undefined properties', () => {
    const obj = {
      b: '123',
      c: 123,
      d: true,
      e: null,
      f: undefined,
    }

    expect(removeUndefinedValues(obj)).toEqual({ b: '123', c: 123, d: true })
  })
})
