import axios from '../src/index'
import { getAjaxRequest } from './helper'

function testHeaderValue(headers: any, key: string, value: any) {
  let found = false
  for (let k in headers) {
    if (k.toLowerCase() === key.toLowerCase()) {
      found = true
      expect(headers[k]).toEqual(value)
      break
    }
  }
  if (!found) {
    if (typeof value === 'undefined') {
      expect(headers.hasOwnProperty(key)).toBeFalsy()
    } else {
      throw new Error(key + ' not Found in headers')
    }
  }
}

describe('headers', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
  })

  test('should use default common headers', () => {
    let headers = axios.defaults.headers.common
    axios('/foo')
    return getAjaxRequest().then(request => {
      for (let key in headers) {
        expect(headers[key]).toEqual(request.requestHeaders[key])
      }
    })
  })

  test('should add extra headers for post', () => {
    axios.post('/foo', 'foo=bar')
    return getAjaxRequest().then(req => {
      testHeaderValue(req.requestHeaders, 'Content-Type', 'application/x-www-form-urlencoded')
    })
  })

  test('should use application/json when posting an object', () => {
    axios.post('/foo/bar', {
      firstName: 'foo',
      lastName: 'bar'
    })

    return getAjaxRequest().then(request => {
      testHeaderValue(request.requestHeaders, 'Content-Type', 'application/json;charset=utf-8')
    })
  })

  test('should remove content-type if data is empty', () => {
    axios.post('/foo')

    return getAjaxRequest().then(request => {
      testHeaderValue(request.requestHeaders, 'Content-Type', undefined)
    })
  })

  it('should preserve content-type if data is false', () => {
    axios.post('/foo', false)
    return getAjaxRequest().then(request => {
      testHeaderValue(request.requestHeaders, 'Content-Type', 'application/x-www-form-urlencoded')
    })
  })

  test('should remove content-type if data is FormData', () => {
    const data = new FormData()
    data.append('foo', 'bar')

    axios.post('/foo', data)

    return getAjaxRequest().then(request => {
      testHeaderValue(request.requestHeaders, 'Content-Type', undefined)
    })
  })
})
