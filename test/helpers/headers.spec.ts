import { flattenHeaders, processHeaders, parseHeaders } from '../../src/helper/headers'

describe('helper: headers', () => {
  describe('parseHeader', () => {
    test('should parse header', () => {
      const headers = parseHeaders(
        'Content-Type: application/json\r\n' +
          'Connection: keep-alive\r\n' +
          'Transfer-Encoding: chunked\r\n' +
          'Date: Tue, 21 May 2019 09:23:44 GMT\r\n' +
          ':aa\r\n' +
          'key:'
      )

      expect(headers['content-type']).toBe('application/json')
      expect(headers['connection']).toBe('keep-alive')
      expect(headers['transfer-encoding']).toBe('chunked')
      expect(headers['date']).toBe('Tue, 21 May 2019 09:23:44 GMT')
      expect(headers['key']).toBe('')
    })
    test('should  return empty object if header is empty string', () => {
      expect(parseHeaders('')).toEqual({})
    })
    test('should  return {} if header is null or undefined', () => {
      expect(parseHeaders(null)).toEqual({})
      expect(parseHeaders(undefined)).toEqual({})
    })
  })

  describe('processHeaders', () => {
    test('should normalize contentType header name', () => {
      const headers: any = {
        'conTenT-Type': 'foo/bar',
        'Content-length': 1024
      }
      processHeaders(headers, {})
      expect(headers['Content-Type']).toBe('foo/bar')
      expect(headers['conTenT-Type']).toBeUndefined()
      expect(headers['Content-length']).toBe(1024)
    })
    test('should set Content-type if data is PlainObject', () => {
      const headers: any = {}
      processHeaders(headers, { a: 1 })
      expect(headers['Content-Type']).toBe('application/json;charset=utf-8')
    })
    test('should not set Content-Type if data is not PlainObject', () => {
      const headers: any = {}
      processHeaders(headers, new URLSearchParams('foo=bar'))
      expect(headers['Content-Type']).toBeUndefined()
    })
    test('should do nothing if data is null or undefined', () => {
      expect(processHeaders(null, { a: 1 })).toBeNull()
      expect(processHeaders(undefined, { a: 1 })).toBeUndefined()
    })
  })
  describe('flattenHeaders', () => {
    test('should flatten headers and include common headers', () => {
      const headers = {
        Accept: 'application/json',
        common: {
          'X-COMMON-HEADER': 'commonHeaderValue'
        },
        get: {
          'X-GET-HEADER': 'getHeaderValue'
        },
        post: {
          'X-POST-HEADER': 'postHeaderValue'
        }
      }

      expect(flattenHeaders(headers, 'get')).toEqual({
        Accept: 'application/json',
        'X-COMMON-HEADER': 'commonHeaderValue',
        'X-GET-HEADER': 'getHeaderValue'
      })
    })
    test('should  flatter headers without common headers', () => {
      const headers = {
        Accept: 'application/json',
        get: {
          'X-GET-HEADER': 'getHeaderValue'
        },
        post: {
          'X-POST-HEADER': 'postHeaderValue'
        }
      }
      expect(flattenHeaders(headers, 'get')).toEqual({
        Accept: 'application/json',
        'X-GET-HEADER': 'getHeaderValue'
      })
    })
    test('should do nothing if data is null or undefined', () => {
      expect(flattenHeaders(null, 'get')).toBeNull()
      expect(flattenHeaders(undefined, 'get')).toBeUndefined()
    })
  })
})
