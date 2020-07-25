import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helper/headers'
import { AxiosError } from '../helper/error'
import { isURLSameOrigin } from '../helper/url'
import cookie from '../helper/cookie'
import { isFormData } from '../helper/util'

// 创建 XMLHttpRequest
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      data = null,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfHeaderName,
      xsrfCookieName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    configureRequest()
    addEvents()
    processHeaders()
    processCancel()

    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (!validateStatus || validateStatus(response.status)) {
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

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    function addEvents(): void {
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }

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
    }

    function processHeaders(): void {
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName && xsrfHeaderName) {
        const xsrfVal = cookie.read(xsrfCookieName)
        if (xsrfVal) {
          headers[xsrfHeaderName] = xsrfVal
        }

        if (auth) {
          headers['authorization'] = `Basic ${btoa(`${auth.username} : ${auth.password}`)}`
        }
      }

      // 如果请求数据为FormData，则删除自定义的Content-Type，由浏览器自行添加
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      Object.keys(headers).forEach(name => {
        // 不太清楚如果data为null但contentType有值会怎样，需要实验
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }
    function processCancel(): void {
      if (cancelToken) {
        // 但promise没有变成resolved状态时，then是不会执行的
        // 如何变成resolved状态查看CancelToken类
        cancelToken.promise.then(reason => {
          request.abort()
          reject(reason)
        })
      }
    }
  })
}
