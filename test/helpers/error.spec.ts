import { createError, AxiosError } from '../../src/helper/error'
import { transformRequest, transformResponse } from '../../src/helper/data'
import { AxiosRequestConfig, AxiosResponse } from '../../src/types/index'

describe('helper: error', () => {
  test('should create an Error with message, config, code, request, response and isAxiosError', () => {
    const request = new XMLHttpRequest()
    const config: AxiosRequestConfig = { method: 'post' }
    const response: AxiosResponse = {
      status: 200,
      statusText: 'OK',
      headers: null,
      request,
      config,
      data: { foo: 'bar' }
    }
    const error = createError('bomb!', config, 'code', request, response)
    expect(error instanceof Error).toBeTruthy()
    expect(error.isAxiosError).toBeTruthy
    expect(error.message).toBe('bomb!')
    expect(error.code).toBe('code')
    expect(error.request).toBe(request)
    expect(error.response).toBe(response)
  })
})
