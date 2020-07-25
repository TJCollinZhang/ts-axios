import {
  AxiosPromise,
  AxiosRequestConfig,
  Method,
  Axios as AxiosInterface,
  AxiosResponse,
  ResolvedFn,
  RejectedFn
} from '../types'
import dispatchRequest, { transformURL } from './dispatchRequest'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'

interface RequestPromiseNode {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

export default class Axios implements AxiosInterface {
  interceptors: Interceptors
  defaults: AxiosRequestConfig

  constructor(defaultConfig: AxiosRequestConfig) {
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
    this.defaults = defaultConfig
  }

  // 重载request方法，被重载的原因参考src/axios.ts
  // 根据文档，Axios.request方法调用时只能传入config参数，
  // 因此request方法的实现需要兼容AxiosInterface类型定义，但不能和定义完全一致
  request(config: AxiosRequestConfig): AxiosPromise
  request(url: string, config?: AxiosRequestConfig): AxiosPromise
  request(url: any, config?: AxiosRequestConfig): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }
    config = mergeConfig(this.defaults, config)

    // 拦截器调用时注意，越先注册的拦截器越靠近请求本身，
    // 意味着请求拦截器越先注册越后调用，响应拦截器先注册先调用
    const promiseChain: RequestPromiseNode[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    this.interceptors.request.forEach(interceptor => {
      promiseChain.unshift(interceptor)
    })

    this.interceptors.response.forEach(interceptor => {
      promiseChain.push(interceptor)
    })

    // 注意这里传的泛型any
    // 这里的Promise.resolve是个函数，点进去发现这个函数必须要传泛型，返回Promise<T>
    // 根据类型推论，如果不传则T默认为config的类型
    // 根据需求分析，链式调用拦截器，
    // 在请求发送前，
    // resolved返回config类型或者以config类型为泛型的promise对象
    // 如果返回了promise对象，按道理不可以直接执行dispatchRequest，因为参数要求为config
    // 阮一峰的源码阅读解释如下：
    // 前一个回调函数，有可能返回的还是一个Promise对象（即有异步操作），这时后一个回调函数，就会等待该Promise对象的状态发生变化，才会被调用
    // （待测试）也就是说返回的promise对象如果一直没有执行resolved函数，这个请求就不会被发出去，从中间就被拦截掉了
    // 在请求发送后，
    // resolved函数返回的是response类型或者以response类型为泛型的promise对象，
    // 根据以上分析这个泛型可以为AxiosRequestConfig | AxiosResponse
    // 即 let promise = Promise.resolve<AxiosRequestConfig | AxiosResponse>(config)
    // 即链式调用结束后返回的是Promise<AxiosRequestConfig | AxiosResponse>
    // 但promise对象最终要被返回，要求符合AxiosPromise（继承自Promise<AxiosResponse<T>>）,
    // 所以这里的泛型只能为any
    let promise = Promise.resolve<any>(config)
    while (promiseChain.length) {
      const { resolved, rejected } = promiseChain.shift()!
      promise = promise.then(resolved, rejected)
    }
    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  getUri(config?: AxiosRequestConfig) {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }
}
