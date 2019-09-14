export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'Delete'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'

export interface AxiosRequestConfig {
  url?: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType
  timeout?: number | null
}

export interface AxiosResponse {
  data: any
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

// 之所以让AxiosPromise继承Promise是因为后面如果返回的是此类型数据，能调用then
// promise泛型中给的AxiosResponse意味着onfulfilled返回的类型为AxiosResponse
export interface AxiosPromise extends Promise<AxiosResponse> {}

export interface AxiosError extends Error {
  // 暂时没弄懂这个参数的用处
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse
}

// 实际使用中Axios可以作为函数使用，如下
// axios({
//   method: 'post',
//   url: '/user/12345',
//   data: {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
//   }
// });
// 也可以使用axios.get(config)
// 因此此处可以使用混合类型，根据typescript官网，
// 混合类型最典型的应用是一个对象可以同时做为函数和对象使用，并带有额外的属性。
// 完美符合当前使用环境，因此除了类类型，需要再创建一个函数类型
export interface Axios {
  request(config: AxiosRequestConfig): AxiosPromise

  get(url: string, config?: AxiosRequestConfig): AxiosPromise

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise

  head(url: string, config?: AxiosRequestConfig): AxiosPromise

  options(url: string, config?: AxiosRequestConfig): AxiosPromise

  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise

  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise
}

// 函数类型，使用时与上面的类类型进行混合
// 为什么不把AxiosInstance里面的声明放到Axios声明里面呢，主要是这个Axios接口对应Axios类，
// Axios类无法作为函数调用，需要AxiosInstance补充
// 根据Axios文档中Axios作为函数时可以接受两种调用调用方法,所以需要重载request函数
// Axios(config) Axios(url[, config])
export interface AxiosInstance extends Axios {
  (config: AxiosRequestConfig): AxiosPromise
  (url: string, config?: AxiosRequestConfig): AxiosPromise
}
