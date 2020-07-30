import axios, { AxiosRequestConfig } from '../../src/index'
import { getAjaxRequest } from '../helper'
import Cancel from '../../src/cancel/Cancel'
import { request } from 'http'

describe('cancel', () => {
  const cancelToken = axios.CancelToken
  const cancel = axios.Cancel
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
  })
  describe('canceled before sending request', () => {
    test('should reject promise with Cancel Object', done => {
      const source = cancelToken.source()
      source.cancel('canceled')
      axios
        .get('/foo', {
          cancelToken: source.token
        })
        .catch(e => {
          expect(e).toEqual(expect.any(Cancel))
          expect(e.message).toBe('canceled')
          done()
        })
    })
  })
  describe('canceled after sending request', () => {
    test('should reject promise with Cancel object', done => {
      const source = cancelToken.source()
      axios
        .get('/foo', {
          cancelToken: source.token
        })
        .catch(e => {
          expect(e).toEqual(expect.any(Cancel))
          expect(e.message).toBe('canceled')
          done()
        })
      getAjaxRequest().then(request => {
        source.cancel('canceled')
        setTimeout(() => {
          request.respondWith({
            status: 200,
            responseText: 'OK'
          })
        }, 20)
      })
    })
    test('calls abort function on request object', done => {
      const source = cancelToken.source()
      let req: any
      axios
        .get('/foo', {
          cancelToken: source.token
        })
        .catch(() => {
          expect(req.statusText).toBe('abort')
          done()
        })
      getAjaxRequest().then(request => {
        source.cancel('canceled')
        req = request
      })
    })
  })
  describe('canceled after received response', () => {
    test('should not cause unhandlerejection', done => {
      const source = cancelToken.source()
      axios
        .get('/foo', {
          cancelToken: source.token
        })
        .then(res => {
          window.addEventListener('unhandledrejection', () => {
            done.fail('Unhandled rejection.')
          })
          source.cancel('canceled')
          setTimeout(done, 100)
        })
      getAjaxRequest().then(request => {
        request.respondWith({
          status: 200,
          responseText: 'OK'
        })
      })
    })
  })
})
