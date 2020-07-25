import { AxiosRequestConfig } from '../types'
import { deepMerge, isPlainObject } from '../helper/util'

export default function mergeConfig(
  defaultConfig: AxiosRequestConfig,
  customConfig?: AxiosRequestConfig
): AxiosRequestConfig {
  customConfig = customConfig || {}

  /*****
   * 对于每一个属性执行一次合并策略函数，有些如果传参中没有，则也不给默认值，因为默认值没意义
   * 例如data有些则取默认值
   * *****/

  // 一个存储config属性与配置策略函数的map
  const strategies = Object.create(null)

  // 不能给默认值的属性
  const noDefaultProps = ['url', 'data', 'params']
  noDefaultProps.forEach(prop => {
    strategies[prop] = valJustFromCustomStrat
  })

  // 需要进行深拷贝的属性
  const objectProps = ['headers', 'auth']
  objectProps.forEach(prop => {
    strategies[prop] = deepMergeStrat
  })

  const config = Object.create(null)

  // 对于自定义的配置遍历，看用那种合并策略
  // key in customConfig 这种遍历
  for (let key in customConfig) {
    mergeField(key)
  }

  for (let key in defaultConfig) {
    if (!customConfig[key]) {
      mergeField(key)
    }
  }

  function mergeField(key: string) {
    const strategy = strategies[key] || valWithDefaultStrat
    config[key] = strategy(defaultConfig[key], customConfig![key])
  }

  // 不给默认值的合并策略
  function valJustFromCustomStrat(defaultVal: any, customVal: any): any {
    if (typeof customVal !== 'undefined') {
      return customVal
    }
  }

  // 可以有默认值的合并策略
  function valWithDefaultStrat(defaultVal: any, customVal: any): any {
    return typeof customVal === 'undefined' ? defaultVal : customVal
  }

  // 深拷贝合并策略
  function deepMergeStrat(defaultVal: any, customVal: any) {
    if (isPlainObject(customVal)) {
      return deepMerge(defaultVal, customVal)
    } else if (typeof customVal !== 'undefined') {
      return customVal
    } else if (isPlainObject(defaultVal)) {
      return deepMerge(defaultVal)
    } else if (typeof defaultVal !== 'undefined') {
      return defaultVal
    }
  }

  return config
}
