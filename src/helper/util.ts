const toString = Object.prototype.toString

export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

export function isObject(val: any): val is Object {
  return val !== null && typeof val === 'object'
}

export function isPlainObject(val: any): val is Object {
  return toString.call(val) === '[object Object]'
}

export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}

export function deepMerge(...objs: any[]): any {
  const res = Object.create(null)
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          // 进行这一步判断的目的是怕res中已经有了其他配置拷贝过来的属性相同的值
          // 例如 config1 = {a: {b:1 }} config2 = {a: {c: 2}} 这时需要将b,c合并而不是覆盖
          if (isPlainObject(res[key])) {
            res[key] = deepMerge(val, res[key])
          } else {
            res[key] = deepMerge(val)
          }
        } else {
          res[key] = val
        }
      })
    }
  })

  return res
}

export function isFormData(data: any): data is FormData {
  return typeof data !== undefined && data instanceof FormData
}

export function isURLSearchParams(params: any): params is URLSearchParams {
  return typeof params !== undefined && params instanceof URLSearchParams
}

export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url)
}

export function combineURL(baseURL: string, relativeURL: string) {
  return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL
}
