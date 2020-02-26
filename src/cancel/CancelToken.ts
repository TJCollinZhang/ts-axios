import { Canceler, CancelExecutor } from '../types'
// 引用Cancel必须通过Cancel类引用，从types中引用的只能当作类型用
// 这里需要将其当作值使用 下面有new Cancel()
import Cancel from './Cancel'

interface ResolvePromise {
  // (message: string): void
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = resolve
    })

    // 向executor函数中传入一个canceler方法
    // 使用者可以获得这个canceler方法，一旦canceler方法被执行，就会将这个promise变成resolve状态
    // 从而执行then函数
    // cancelToken: new CancelToken(function executor(c) {
    //   cancel = c;
    // })
    executor(message => {
      if (this.reason) {
        return
      } else {
        this.reason = new Cancel(message)
        resolvePromise(this.reason)
      }
    })
  }

  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }

  static source() {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }
}
