import { isPlainObject } from './util'

export function transformRequest (data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data)
	}
  return data
}

// 返回的数据如果是字符串，尝试转为Json
export function transformResponse (data: any) :any {
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data)
		} catch (error) {
			// Do nothing
		}
	}
	return data
}
