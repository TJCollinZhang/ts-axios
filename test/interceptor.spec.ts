import axios, { AxiosRequestConfig, AxiosResponse } from '../src/index'
import { getAjaxRequest } from './helper'

describe('interceptor', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
  })

  test('should add a request interceptor', () => {
    const instance = axios.create()
    instance.interceptors.request.use(config => {
      config.headers.test = 'test'
      return config
    })
    instance('/foo')
    return getAjaxRequest().then(request => {
      expect(request.requestHeaders.test).toBe('test')
    })
  })

  test('should add a request interceptor that returns a new config object', () => {
    const instance = axios.create()

    instance.interceptors.request.use(() => {
      return {
        url: '/bar',
        method: 'post'
      }
    })

    instance('/foo')

    return getAjaxRequest().then(request => {
      expect(request.method).toBe('POST')
      expect(request.url).toBe('/bar')
    })
  })

  test('should add a request interceptor that returns a promise', done => {
    const instance = axios.create()

    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      return new Promise(resolve => {
        setTimeout(() => {
          config.headers.async = 'promise'
          resolve(config)
        }, 10)
      })
    })

    instance('/foo')

    setTimeout(() => {
      getAjaxRequest().then(request => {
        expect(request.requestHeaders.async).toBe('promise')
        done()
      })
    }, 100)
  })

  test('should add multiple request config', done => {
    const instance = axios.create()

    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      config.headers.test1 = '1'
      return config
    })
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      config.headers.test2 = '2'
      return config
    })
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      config.headers.test3 = '3'
      return config
    })

    instance('/foo')

    return getAjaxRequest().then(request => {
      expect(request.requestHeaders.test1).toBe('1')
      expect(request.requestHeaders.test2).toBe('2')
      expect(request.requestHeaders.test3).toBe('3')
      done()
    })
  })

  test('should add a response interceptor', done => {
    const instance = axios.create()

    instance.interceptors.response.use(data => {
      data.data = data.data + ' - modified'
      return data
    })

    instance('/foo').then(res => {
      expect(res.data).toBe('OK - modified')
      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        responseText: 'OK'
      })
    })
  })

  test('should add a response interceptor that returns a new object', done => {
    const instance = axios.create()

    instance.interceptors.response.use(() => {
      return {
        data: 'stuff',
        headers: null,
        status: 500,
        statusText: 'ERR',
        request: null,
        config: {}
      }
    })

    instance('/foo').then(res => {
      expect(res.data).toBe('stuff')
      expect(res.headers).toBeNull()
      expect(res.status).toBe(500)
      expect(res.statusText).toBe('ERR')
      expect(res.request).toBeNull()
      expect(res.config).toEqual({})
      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        responseText: 'OK'
      })
    })
  })

  test('should add a response interceptor that returns a promise', done => {
    let response: AxiosResponse
    const instance = axios.create()

    instance.interceptors.response.use(data => {
      return new Promise(resolve => {
        // do something async
        setTimeout(() => {
          data.data = 'you have been promised!'
          resolve(data)
        }, 10)
      })
    })

    instance('/foo').then(res => {
      response = res
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        responseText: 'OK'
      })

      setTimeout(() => {
        expect(response.data).toBe('you have been promised!')
        done()
      }, 100)
    })
  })

  test('should add multiple response interceptors', done => {
    let response: AxiosResponse
    const instance = axios.create()

    instance.interceptors.response.use(data => {
      data.data = data.data + '1'
      return data
    })
    instance.interceptors.response.use(data => {
      data.data = data.data + '2'
      return data
    })
    instance.interceptors.response.use(data => {
      data.data = data.data + '3'
      return data
    })

    instance('/foo').then(data => {
      response = data
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        responseText: 'OK'
      })

      setTimeout(() => {
        expect(response.data).toBe('OK123')
        done()
      }, 100)
    })
  })

  test('should allow remove interceptor', done => {
    let interceptor
    const instance = axios.create()
    instance.interceptors.response.use(data => {
      data.data = data.data + '1'
      return data
    })
    interceptor = instance.interceptors.response.use(data => {
      data.data = data.data + '2'
      return data
    })
    instance.interceptors.response.use(data => {
      data.data = data.data + '3'
      return data
    })
    instance.interceptors.response.eject(interceptor)
    instance.interceptors.response.eject(1)

    instance('/foo').then(res => {
      expect(res.data).toBe('OK13')
      done()
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        responseText: 'OK'
      })
    })
  })
})
