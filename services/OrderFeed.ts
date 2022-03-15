import addEventListenerOnce, {
  addErrorListenerOnce,
} from '../utils/addEventListenerOnce'
import parseEvent from '../utils/parseEvent'
import throttle from '../utils/throttle'

import { Message, OrderData, ProductType } from './types'

const filterEvents = (msg: Message) => {
  return msg?.feed === `${process.env.NEXT_PUBLIC_FEED_TYPE_SNAPSHOT}` ||
    msg?.feed === `${process.env.NEXT_PUBLIC_FEED_TYPE_DELTA}`
    ? msg
    : undefined
}

const createTimedPromise = <T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => void
): Promise<T> => {
  return Promise.race([
    new Promise<T>(executor),
    // // Time out request
    // new Promise<T>((resolve, reject) => {
    //   setTimeout(() => {
    //     reject('request timed out')
    //   }, 2000)
    // }),
  ])
}

export default class OrderFeed {
  private url: string

  private socket?: WebSocket
  private subscription?: ProductType

  constructor(url: string) {
    this.url = url
  }

  get productId() {
    return this.subscription
  }

  isConnected(): boolean {
    return (
      typeof this.socket !== 'undefined' &&
      this.socket?.readyState === WebSocket.OPEN
    )
  }

  isClosed(): boolean {
    return (
      typeof this.socket === 'undefined' ||
      (typeof this.socket !== 'undefined' &&
        this.socket?.readyState === WebSocket.CLOSED)
    )
  }

  createMessageHandler(onFeed: (msg: OrderData) => void) {
    return (event: any) => {
      const msg = filterEvents(parseEvent(event))

      if (msg && 'product_id' in msg && msg.product_id === this.subscription)
        onFeed(msg as OrderData)
    }
  }

  connect(): Promise<void> {
    // guard if already connected
    if (this.isConnected()) return Promise.resolve()

    return createTimedPromise<void>((resolve, reject) => {
      const opened = () => {
        resolve()
      }

      try {
        this.socket = new WebSocket(this.url)
        addEventListenerOnce(this.socket, 'open', opened)
        addErrorListenerOnce(this.socket, 'error', (error: any) => {
          reject(error.message)
          this.socket?.removeEventListener('open', opened)
        })
      } catch (error) {
        reject(error.message)
      }
    })
  }

  unsubscribe(productId: ProductType): Promise<void> {
    if (!this.isConnected()) return Promise.resolve()

    return createTimedPromise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket is not open'))
        return
      }

      this.socket.send(
        JSON.stringify({
          event: 'unsubscribe',
          feed: 'book_ui_1',
          product_ids: [productId],
        })
      )

      let isUnsubscribed = false
      // socket listeners
      const unsubscribed = (event: any) => {
        const msg = parseEvent(event)

        // confirmation
        if (
          msg?.event === 'unsubscribed' &&
          msg?.feed === 'book_ui_1' &&
          msg?.product_ids[0] === productId
        ) {
          resolve()
          isUnsubscribed = true
        }
      }
      const shouldRemove = () => {
        return isUnsubscribed
      }

      // add event listeners
      addEventListenerOnce(this.socket, 'message', unsubscribed, shouldRemove)
      addErrorListenerOnce(this.socket, 'error', (error: any) => {
        reject(error.message)
        this.socket?.removeEventListener('message', unsubscribed)
      })
    })
  }

  async subscribe(
    productId: ProductType,
    onFeed: (msg: OrderData) => void,
    throttleMS = 1000
  ): Promise<void> {
    // connect if not connected
    if (!this.isConnected()) await this.connect()

    if (typeof this.subscription !== 'undefined') {
      await this.unsubscribe(this.subscription)
      this.subscription = undefined
    }

    return createTimedPromise<void>((resolve, reject) => {
      if (!this.socket) {
        reject('Socket is not open')
        return
      }

      this.socket.send(
        JSON.stringify({
          event: 'subscribe',
          feed: 'book_ui_1',
          product_ids: [productId],
        })
      )

      // socket listeners
      const subscribed = (event: any) => {
        const msg = parseEvent(event)

        // confirmation of subscription
        if (
          msg?.event === 'subscribed' &&
          msg?.feed === 'book_ui_1' &&
          msg?.product_ids[0] === productId
        ) {
          this.subscription = productId
          resolve()
        }
      }
      const done = () => {
        if (!this.socket) return

        const throttled = throttle(
          throttleMS,
          this.createMessageHandler(onFeed)
        )
        // throttle to avoid flooding
        addEventListenerOnce(
          this.socket,
          'message',
          throttled,
          () => this.subscription !== productId
        )
        addErrorListenerOnce(this.socket, 'error', () => {
          this.socket?.removeEventListener('message', throttled)
        })
      }

      // add event listeners
      addEventListenerOnce(
        this.socket,
        'message',
        subscribed,
        () => this.subscription === productId,
        done
      )
      addErrorListenerOnce(this.socket, 'error', (error: any) => {
        reject(error.message)
        this.socket?.removeEventListener('message', subscribed)
      })
    })
  }

  close(): Promise<void> {
    if (this.isClosed()) return Promise.resolve()
    if (this.socket) this.socket.close()

    return createTimedPromise((resolve, reject) => {
      const closed = () => {
        this.subscription = undefined
        resolve()
      }

      if (!this.socket) {
        reject('Socket is not open')
        return
      }
      addEventListenerOnce(this.socket, 'close', closed)
      addErrorListenerOnce(this.socket, 'error', (error: any) => {
        reject(error.message)
        this.socket?.removeEventListener('close', closed)
      })
    })
  }
}
