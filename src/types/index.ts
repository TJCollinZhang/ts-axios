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

export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: AxiosRequestConfig
  request: any
}

// 之所以让AxiosPromise继承Promise是因为后面如果返回的是此类型数据，能调用then
// promise泛型中给的AxiosResponse意味着resolve返回的类型为AxiosResponse
export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

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
// 所有的请求方法都可以传入泛型约束，并且约定返回的也是该类型
export interface Axios {
  interceptor: AxiosInterceptor

  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
}

// 函数类型，使用时与上面的类类型进行混合
// 为什么不把AxiosInstance里面的声明放到Axios声明里面呢，主要是这个Axios接口对应Axios类，
// Axios类无法作为函数调用，需要AxiosInstance补充
// 根据Axios文档中Axios作为函数时可以接受两种调用调用方法,所以需要重载request函数
// Axios(config) Axios(url[, config])
export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

// axios.interceptor有两个属性，request和response
export interface AxiosInterceptor {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

// axios.interceptor.request(response)这两个函数分别管理响应和请求拦截
// 二者都通过use和eject管理拦截，但请求拦截接收AxiosRequestConfig, 相应接收AxiosResponse
// 所以resolved函数必须用泛型，返回的错误各种各样，只能用any
export interface InterceptorManager<T = any> {
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number
  eject(id: number): void
}

export interface ResolvedFn<T = any> {
  // 这里使用Promise而不是AxiosPromise的原因是AxiosPromise resolved参数必须返回AxiosResponce
  // 这里传入config可以处理后返回config，同时拦截器要求可以链式顺序调用，因此可以返回promise
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  (error: any): any
}
