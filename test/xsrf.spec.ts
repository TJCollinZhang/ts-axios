import axios from '../src/index'
import { getAjaxRequest } from './helper'
describe('xsrf', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
    document.cookie =
      axios.defaults.xsrfCookieName + '=;expires=' + new Date(Date.now() - 86400000).toUTCString()
  })

  test('should not set xsrf header if cookie is null', () => {
    axios('/foo')
    return getAjaxRequest().then(req => {
      expect(req.requestHeaders[axios.defaults.xsrfHeaderName!]).toBeUndefined()
    })
  })

  test('should set xsrf header if cookie is set', () => {
    document.cookie = axios.defaults.xsrfCookieName + '=123'
    axios('/foo')
    return getAjaxRequest().then(req => {
      expect(req.requestHeaders[axios.defaults.xsrfHeaderName!]).toBe('123')
    })
  })
  test('should not set xsrf header for cross origin', () => {
    document.cookie = axios.defaults.xsrfCookieName + '123'
    axios('http://example.com/')
    return getAjaxRequest().then(req => {
      expect(req.requestHeaders[axios.defaults.xsrfHeaderName!]).toBeUndefined()
    })
  })
  test('should set xsrf header for cross origin when using withCredencials', () => {
    document.cookie = axios.defaults.xsrfCookieName + '=123'
    axios('http://example.com/', {
      withCredentials: true
    })
    return getAjaxRequest().then(req => {
      expect(req.requestHeaders[axios.defaults.xsrfHeaderName!]).toBe('123')
    })
  })
})
