import {
  isDate,
  isPlainObject,
  isFormData,
  isURLSearchParams,
  extend,
  deepMerge,
  isObject
} from '../../src/helper/util'

describe('helpers:utl', () => {
  describe('isXX', () => {
    test('should validate Date', () => {
      expect(isDate(new Date())).toBeTruthy()
      expect(isDate(Date.now())).toBeFalsy()
    })

    test('should validate Object', () => {
      expect(isObject({})).toBeTruthy()
      expect(isObject([])).toBeTruthy()
      expect(isObject(null)).toBeFalsy()
    })

    test('should validate PlainObject', () => {
      expect(isPlainObject({})).toBeTruthy()
      expect(isPlainObject(new Date())).toBeFalsy()
    })

    test('should validate FormData', () => {
      expect(isFormData(new FormData())).toBeTruthy()
      expect(isFormData({})).toBeFalsy()
    })

    test('should validate URLSearchParams', () => {
      expect(isURLSearchParams(new URLSearchParams())).toBeTruthy()
      expect(isURLSearchParams('foo=1&bar=2')).toBeFalsy()
    })

    describe('extend', () => {
      test('should extend mutable', () => {
        const a = Object.create(null)
        const b = { foo: 123 }
        extend(a, b)
        expect(a.foo).toBe(123)
      })
      test('should extend properties', () => {
        const a = { bar: 'aaa', foo: 123 }
        const b = { foo: 789 }
        extend(a, b)
        expect(a.bar).toBe('aaa')
        expect(a.foo).toBe(789)
      })
    })
    describe('deepMerge', () => {
      test('should be immutable', () => {
        const a = Object.create(null)
        const b: any = { foo: 123 }
        const c: any = { bar: 456 }
        deepMerge(a, b, c)
        expect(a.bar).toBe(undefined)
        expect(a.foo).toBe(undefined)
        expect(b.bar).toBe(undefined)
        expect(c.foo).toBe(undefined)
      })

      test('should deepMerge properties', () => {
        const a = { foo: 123 }
        const b = { bar: 345 }
        const c = { foo: 567 }
        const d = deepMerge(a, b, c)
        expect(d.foo).toBe(567)
        expect(d.bar).toBe(345)
      })

      test('should deepMerge recursively', () => {
        const a = { foo: { bar: 123 } }
        const b = { foo: { baz: 456 }, bar: { tes: 678 } }
        const d = deepMerge(a, b)
        expect(d).toEqual({
          foo: { bar: 123, baz: 456 },
          bar: { tes: 678 }
        })
      })

      test('should remove all references from nested objects', () => {
        const a = { foo: { bar: 123 } }
        const b = {}
        const c = deepMerge(a, b)
        expect(a.foo).not.toBe(c.foo)
      })
      test('should handle all undefined and null arguments', () => {
        expect(deepMerge(undefined, undefined)).toEqual({})
        expect(deepMerge(undefined, { foo: 123 })).toEqual({ foo: 123 })
        expect(deepMerge({ foo: 123 }, undefined)).toEqual({ foo: 123 })
        expect(deepMerge(null, null)).toEqual({})
        expect(deepMerge(null, { foo: 123 })).toEqual({ foo: 123 })
        expect(deepMerge({ foo: 123 }, null)).toEqual({ foo: 123 })
      })
    })
  })
})
