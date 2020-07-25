import { AxiosInstance, AxiosRequestConfig, AxiosStatic } from './types'
import Axios from './core/Axios'
import { extend } from './helper/util'
import defaults from './defaults'
import mergeConfig from './core/mergeConfig'
import CancelToken from './cancel/CancelToken'
import Cancel, { isCancel } from './cancel/Cancel'

function createInstance(config: AxiosRequestConfig): AxiosStatic {
  const context = new Axios(config)

  // 所有的请求最终调用的都是request方法，
  // 所以当axios对象直接作为函数调用时（即通过AxiosInstance混合补充的函数），最终调用的也是request方法
  // 两种调用方式axios(config) 和 axios(url[,config])，导致request需要重载
  // bind的原因是因为request内部访问了this
  // instance只是函数，AxiosInstance类型具有Axios所有的属性，所以混合context后才是AxiosInstance类型
  // 综上所述instance: AxiosInstance会报错
  const instance = Axios.prototype.request.bind(context)

  extend(instance, context)
  // instance强制转为AxiosStatic类型，但不具备create函数
  // 只要返回的instance在使用前添加create函数即可
  return instance as AxiosStatic
}

// 外界是使用axios都是 import axios from 'axios'，所有地方使用的都是一个被export的axios实例
// 需求中提到创建一个新的axios实例，并允许传入配置与默认配置合并作为新实例的默认配置
const axios = createInstance(defaults)

axios.create = config => {
  return createInstance(mergeConfig(defaults, config))
}

axios.CancelToken = CancelToken
axios.Cancel = Cancel
axios.isCancel = isCancel

axios.all = function all(promises) {
  return Promise.all(promises)
}

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr)
  }
}

export default axios
