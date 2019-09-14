import { isPlainObject } from './util'

function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

export function parseHeaders(headers: any) {
  // 此处parsed不能直接赋值null，否则后续无法设置键值对
  let parsed = Object(null)
  if (!headers) {
    return parsed
  }
  headers.split('\r\n').forEach((line: string) => {
    let [key, value] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return
    }

    // value 不能直接trim，原因是空白行分隔后key为空字符串，value为undefined
    if (value) {
      value = value.trim()
    }
    parsed[key] = value
  })

  return parsed
}
