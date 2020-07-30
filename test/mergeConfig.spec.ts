import axios from '../src/index'
import mergeConfig from '../src/core/mergeConfig'

describe('mergeConfig', () => {
  const defaults = axios.defaults
  test('should accept undefined for second argument', () => {
    expect(mergeConfig(defaults, undefined)).toEqual(defaults)
  })
  test('should accept object for second argument', () => {
    expect(mergeConfig(defaults, {})).toEqual(defaults)
  })
  test('should not leave references', () => {
    const merged = mergeConfig(defaults, {})
    expect(merged).not.toBe(defaults)
    expect(merged.headers).not.toBe(defaults.headers)
  })
  test('should allow set request options', () => {
    const config = {
      url: 'test url',
      params: 'test url',
      data: { a: 1 }
    }
    expect(mergeConfig(defaults, config).url).toBe(config.url)
    expect(mergeConfig(defaults, config).params).toBe(config.params)
    expect(mergeConfig(defaults, config).data).toEqual(config.data)
  })
  test('should not inherit resquest options', () => {
    const config = {
      url: 'test url',
      params: 'test url',
      data: { a: 1 }
    }
    const merged = mergeConfig(config, {})
    expect(merged.url).toBeUndefined()
    expect(merged.params).toBeUndefined()
    expect(merged.data).toBeUndefined()
  })

  test('should merge auth, headers with defaults', () => {
    expect(
      mergeConfig(
        {
          auth: undefined
        },
        {
          auth: {
            username: 'foo',
            password: 'test'
          }
        }
      )
    ).toEqual({
      auth: {
        username: 'foo',
        password: 'test'
      }
    })
    expect(
      mergeConfig(
        {
          auth: {
            username: 'foo',
            password: 'test'
          }
        },
        {
          auth: {
            username: 'baz',
            password: 'foobar'
          }
        }
      )
    ).toEqual({
      auth: {
        username: 'baz',
        password: 'foobar'
      }
    })
  })

  test('should overwride auth, headers ets with a non-object value', () => {
    expect(mergeConfig({ headers: { a: 1 } }, { headers: null }).headers).toBeNull()
  })

  test('should allow setting other options', () => {
    const merged = mergeConfig(defaults, {
      timeout: 123
    })
    expect(merged.timeout).toBe(123)
  })
})
