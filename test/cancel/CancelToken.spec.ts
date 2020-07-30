import CancelToken from '../../src/cancel/CancelToken'
import Cancel from '../../src/cancel/Cancel'
import { Canceler } from '../../src/types'
import { AxiosError } from '../../src/helper/error'

describe('CancelToken', () => {
  describe('reason', () => {
    test('should returns a Cancel if cancelation has been requested', () => {
      let canceler: Canceler
      let token = new CancelToken(c => {
        canceler = c
      })
      canceler!('canceled')
      expect(token.reason).toEqual(expect.any(Cancel))
      expect(token.reason!.message).toBe('canceled')
    })
    test('should have no side effect if cancelation has been requested for many times', () => {
      let canceler: Canceler
      let token = new CancelToken(c => {
        canceler = c
      })
      canceler!('canceled')
      canceler!('canceled')
      expect(token.reason).toEqual(expect.any(Cancel))
      expect(token.reason!.message).toBe('canceled')
    })
    test('should return undefined if cancelation has not been requested', () => {
      let canceler: Canceler
      let token = new CancelToken(c => {
        canceler = c
      })
      expect(token.reason).toBeUndefined()
    })

    describe('promise', () => {
      test('should returns a Promise that resolves when cancelation has been requested', done => {
        let canceler: Canceler
        let token = new CancelToken(c => {
          canceler = c
        })
        token.promise.then(reason => {
          expect(reason).toEqual(expect.any(Cancel))
          expect(reason!.message).toBe('canceled')
          done()
        })

        canceler!('canceled')
      })
    })

    describe('throwIfRequested', () => {
      test('should throw when cancelation has been requested', () => {
        let canceler: Canceler
        let token = new CancelToken(c => {
          canceler = c
        })
        canceler!('canceled')
        // 如果直接运行throwIfRequested，会抛出异常，测试程序会直接停掉，需要try catch
        try {
          token.throwIfRequested()
          // 如果上一句生效了，下一句直接被跳过，进入到catch中
          fail('Expected throwIfRequested to throw.')
        } catch (e) {
          if (!(e instanceof Cancel)) {
            fail('Expected throwIfRequested to throw a Cancel, but test threw ' + e + '.')
          } else {
            expect(e.message).toBe('canceled')
          }
        }
      })
      test('should not throw when cancelation has not been requested', () => {
        let canceler: Canceler
        let token = new CancelToken(c => {
          // canceler = c
        })
        // 如果直接运行throwIfRequested，没有抛出异常，测试程序没有停掉，证明canceler没运行过
        token.throwIfRequested()
      })
    })
    describe('source', () => {
      test('should returns an object containing token and cancel function', () => {
        const source = CancelToken.source()
        expect(source.token).toEqual(expect.any(CancelToken))
        expect(source.cancel).toEqual(expect.any(Function))
        expect(source.token.reason).toBeUndefined()
        source.cancel('Operation has been canceled.')
        expect(source.token.reason).toEqual(expect.any(Cancel))
        expect(source.token.reason!.message).toBe('Operation has been canceled.')
      })
    })
  })
})
