import { AxiosRequestConfig } from './types'
import { processHeaders } from './helper/headers'
import { transform } from './core/transform'
import { transformRequest, transformResponse } from './helper/data'

const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  transformRequest: [
    (data, headers) => {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: [
    (data, headers) => {
      return transformResponse(data)
    }
  ],
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  validateStatus: (status: number): boolean => {
    return status >= 200 && status <= 300
  }
}

const methodWithoutData = ['delete', 'get', 'head', 'options']
methodWithoutData.forEach(method => {
  defaults.headers[method] = {}
})

const methodWithData = ['post', 'put', 'patch']

methodWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
