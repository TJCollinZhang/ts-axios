import { AxiosInstance } from './types'
import Axios from './core/Axios'
import { extend } from './helper/util'


function createInstance(): AxiosInstance {
  const context = new Axios()
  // bind的原因是因为request内部访问了this
  // instance只是函数，AxiosInstance类型具有Axios所有的属性，所以混合context后才是AxiosInstance类型
  // 综上所述instance: AxiosInstance会报错
  const instance = Axios.prototype.request.bind(context)

  extend(instance, context)
  return instance as AxiosInstance
}

const axios = createInstance()

export default axios
