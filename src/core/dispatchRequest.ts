// import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
// import xhr from './xhr'
// import { buildURL } from '../helper/url'
// import { transformRequest, transformResponse } from '../helper/data'
// import { flattenHeaders, processHeaders } from '../helper/headers'
// import { transform } from './transform'
//
// // typescript axios
// export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
//   processConfig(config)
//   return xhr(config).then(res => {
//     return transformResponseData(res)
//   })
// }
//
// // 处理参数
// function processConfig(config: AxiosRequestConfig) {
//   // 转换URL
//   config.url = transformURL(config)
//
//   /* // 处理headers
//      // config.headers = transformHeaders(config)
//      // 处理数据
//      // config.data = transformRequestData(config) */
//
//   // 将上述代码重构为
//   config.data = transform(config.data, config.headers, config.transformRequest)
//
//   // 这样处理headers有问题，content-Type和Content-Type会被认为是两种数据，但其实应该不分大小写
//   // 待解决
//   // 同时 transformHeaders里面有给headers添加content-type，并没有检测common和method里面有没有
//   config.headers = flattenHeaders(config.headers, config.method!)
//
// }
//
// // 转换URL
// function transformURL(config: AxiosRequestConfig): string {
//   const { url, params } = config
//   return buildURL(url!, params)
// }
//
// // 重构后这个函数不需要了
// // // 处理headers
// // function transformHeaders(config: AxiosRequestConfig): any {
// //   const { headers = {}, data } = config
// //
// //   return processHeaders(headers, data)
// // }
//
// // 重构后废弃
// // // 处理数据
// // function transformRequestData(config: AxiosRequestConfig): any {
// //   return transformRequest(config.data)
// // }
//
// function transformResponseData(res: AxiosResponse): AxiosResponse {
//   // res.data = transformResponse(res.data)
//   res.data = transform(res.data, res.headers, res.config.transformResponse)
//   return res
// }
//

import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL } from '../helper/url'
import { flattenHeaders } from '../helper/headers'
import { transform } from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)

  precessConfig(config)
  return xhr(config).then(res => {
    return transformResponseData(res)
  })
}

function precessConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transform(config.data, config.headers, config.transformRequest)

  // 这里 config.method 类型断言，可以保证运行时有值
  config.headers = flattenHeaders(config.headers, config.method!)
}

function transformURL(config: AxiosRequestConfig): string {
  const { url, params } = config

  // 这里可以保证运行时 url 是有值的
  return buildURL(url!, params)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
