import axios from '../src/index'
import { getAjaxRequest } from './helper'

describe('progress', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
  })
  test('should add a download progress handler', () => {
    const progressFn = jest.fn()
    axios.get('/foo', {
      onDownloadProgress: progressFn
    })
    return getAjaxRequest().then(req => {
      req.respondWith({
        status: 200,
        responseText: 'ok'
      })
      expect(progressFn).toBeCalled()
    })
  })
  test('should add a upload progress handler', () => {
    const progressFn = jest.fn()
    axios.get('/foo', {
      onUploadProgress: progressFn
    })
    return getAjaxRequest().then(req => {
      // jasmin.ajax 不触发upload事件
      // req.respondWith({
      // 	status: 200,
      // 	responseText: 'ok'
      // })
      // expect(progressFn).toBeCalled()
    })
  })
})
