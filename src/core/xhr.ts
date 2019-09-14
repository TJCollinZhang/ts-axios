import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helper/headers'
import { AxiosError } from '../helper/error'

// 创建 XMLHttpRequest
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, data = null, method = 'get', headers, responseType, timeout } = config

    const request = new XMLHttpRequest()

    if (responseType) {
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }

    request.open(method.toUpperCase(), url!, true)

    request.onreadystatechange = function handleLoad() {

      // readyState如果不是4代表请求没完成，没有处理的必要
      if (request.readyState !== 4) {
        return
      }

      // status = 0 代表请求根本没发出去，没法处理response，直接认为是网络问题，会触发下面的onerror
      // 404这种请求错误前提是网络请求成功了而且对方还设置了网络请求码，需要对response进行处理
      if (request.status === 0) {
        return
      }

      const responseHeaders = parseHeaders(request.getAllResponseHeaders())

      // responseType如果为text，response为""，否则responseText为null,所以data要分条件取值
      const responseData = responseType !== 'text' ? request.response : request.responseText
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }

      handleResponse(response)
    }

    request.onerror = function handleError() {
      reject(new AxiosError('Network Error', config, null, request))
    }

    request.ontimeout = function handleTime() {
      reject(new AxiosError(`Timout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
    }

    Object.keys(headers).forEach(name => {

      // 不太清楚如果data为null但contentType有值会怎样，需要实验
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          new AxiosError(
            `Request failed width status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
