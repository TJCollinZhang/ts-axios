import cookie from '../../src/helper/cookie'

describe('helpers:cookie', () => {
  test('should read cookies', () => {
    document.cookie = 'foo=bar'
    expect(cookie.read('foo')).toBe('bar')
  })

  test('should return null if cookie name not exist', () => {
    document.cookie = 'foo=bar'
    expect(cookie.read('baz')).toBeNull()
  })
})
