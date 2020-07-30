import axios from '../src/axios'
import { getAjaxRequest } from './helper'
import { AxiosResponse, AxiosError } from '../src/types/index'
import { done } from 'nprogress'

describe('request', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })
  afterEach(() => {
    jasmine.Ajax.uninstall()
  })

  test('should treat single string as url', () => {
    axios('/foo')
    return getAjaxRequest().then(request => {
      expect(request.url).toBe('/foo')
      expect(request.method).toBe('GET')
    })
  })

  test('should treat method value as lowercase string', done => {
    axios({
      url: '/foo',
      method: 'post'
    }).then(res => {
      expect(res.config.method).toBe('post')
      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({ status: 200 })
    })
  })

  test('should reject on network errors', done => {
    const resolveFn = jest.fn((res: AxiosResponse) => {
      return res
    })

    const rejectFn = jest.fn((e: AxiosError) => {
      return e
    })
    jasmine.Ajax.uninstall()
    axios('/foo')
      .then(resolveFn)
      .catch(rejectFn)
      .then(next)
    function next(reason: AxiosResponse | AxiosError) {
      expect(resolveFn).not.toHaveBeenCalled()
      expect(rejectFn).toHaveBeenCalled()
      expect(reason instanceof Error).toBeTruthy()
      expect((reason as AxiosError).message).toBe('Network Error')
      // expect.any 接收构造函数，表示任何一个该构造函数的实例
      // 整句解释为reason.request为XMLHttpRequest构造的实例
      expect(reason.request).toEqual(expect.any(XMLHttpRequest))
      jasmine.Ajax.install()
      done()
    }
  })

  test('should reject when validateStatus returns false', done => {
    const resolveSpy = jest.fn((res: AxiosResponse) => {
      return res
    })

    const rejectSpy = jest.fn((e: AxiosError) => {
      return e
    })

    axios('/for', {
      timeout: 2000,
      validateStatus(status) {
        return status !== 500
      }
    })
      .then(resolveSpy)
      .catch(rejectSpy)
      .then(next)

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 500
      })
    })

    function next(reason: AxiosError | AxiosResponse) {
      expect(resolveSpy).not.toHaveBeenCalled()
      expect(rejectSpy).toHaveBeenCalled()
      expect(reason instanceof Error).toBeTruthy()
      expect((reason as AxiosError).message).toBe('Request failed with status code 500')
      expect((reason as AxiosError).response!.status).toBe(500)

      done()
    }
  })

  test('should reject when request timeout', done => {
    axios('/foo', {
      timeout: 2000,
      method: 'POST'
    }).catch((err: AxiosError) => {
      expect(err.message).toBe('Timeout of 2000 ms exceeded')
      done()
    })
    getAjaxRequest().then(request => {
      // @ts-ignore
      request.eventBus.trigger('timeout')
    })
  })

  test('should resolve when validateStatus returns true', done => {
    const resolveFn = jest.fn((res: AxiosResponse) => {
      return res
    })

    const rejectFn = jest.fn((e: AxiosError) => {
      return e
    })
    axios('/foo', {
      validateStatus: status => {
        return status === 500
      }
    })
      .then(resolveFn)
      .catch(rejectFn)
      .then(next)
    function next(reason: AxiosResponse | AxiosError) {
      expect(rejectFn).not.toHaveBeenCalled()
      expect(resolveFn).toHaveBeenCalled()
      expect((reason as AxiosResponse).config.url).toBe('/foo')
      done()
    }

    getAjaxRequest().then(request => {
      request.respondWith({ status: 500 })
    })
  })

  test('should return json when resolved', done => {
    axios('/api/account/signup', {
      auth: {
        username: '',
        password: ''
      },
      method: 'post',
      headers: {
        Accept: 'application/json'
      }
    }).then(res => {
      expect(res.data).toEqual({ a: 1 })
      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        statusText: 'OK',
        responseText: '{"a": 1}'
      })
    })
  })

  test('should return json when rejected', done => {
    axios('/api/account/signup', {
      auth: {
        username: '',
        password: ''
      },
      method: 'post',
      headers: {
        Accept: 'application/json'
      }
    }).catch(err => {
      expect(typeof (err as AxiosError).response!.data).toBe('object')
      expect((err as AxiosError).response!.data.error).toBe('BAD USERNAME')
      expect((err as AxiosError).response!.data.code).toBe(1)

      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 400,
        statusText: 'Bad Request',
        responseText: '{"error": "BAD USERNAME", "code": 1}'
      })
    })
  })

  test('should supply correct response', done => {
    axios('/foo').then(res => {
      expect(res.data.foo).toBe('bar')
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toBe('application/json')
      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        statusText: 'OK',
        responseText: '{"foo": "bar"}',
        responseHeaders: {
          'Content-Type': 'application/json'
        }
      })
    })
  })

  test('should allow override content-type header case-insensitive', () => {
    axios.post(
      '/foo',
      { foo: 'bar' },
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    )

    return getAjaxRequest().then(request => {
      expect(request.requestHeaders['Content-Type']).toBe('application/json')
    })
  })

  test('should allow array buffer response', done => {
    function str2ab(str: string) {
      const buff = new ArrayBuffer(str.length * 2)
      const view = new Uint16Array(buff)
      for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i)
      }
      return buff
    }
    axios('/foo', {
      responseType: 'arraybuffer'
    }).then(res => {
      expect(res.data.byteLength).toBe(22)
      done()
    })
    getAjaxRequest().then(req => {
      req.respondWith({
        status: 200,
        // @ts-ignore
        response: str2ab('hello world')
      })
    })
  })
})
