import addEventListenerOnce, {
  addAndRemoveEventListener,
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

  private connect(): Promise<void> {
    // guard if already connected
    if (this.isConnected()) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
      const opened = () => {
        resolve()
      }
      const error = (error: any) => {
        reject(error)
      }

      this.socket = new WebSocket(this.url)
      addEventListenerOnce(this.socket, 'open', opened)
      addEventListenerOnce(this.socket, 'error', error)
    })
  }

  unsubscribe(productId: ProductType): Promise<void> {
    if (!this.isConnected()) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
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
      addAndRemoveEventListener(
        this.socket,
        'message',
        unsubscribed,
        shouldRemove
      )
      addEventListenerOnce(this.socket, 'error', (error: any) => {
        reject(error)
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

    return new Promise<void>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket is not open'))
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

        // throttle to avoid flooding
        addAndRemoveEventListener(
          this.socket,
          'message',
          throttle(throttleMS, this.createMessageHandler(onFeed)),
          () => this.subscription !== productId
        )
      }

      // add event listeners
      addAndRemoveEventListener(
        this.socket,
        'message',
        subscribed,
        () => this.subscription === productId,
        done
      )
      addEventListenerOnce(this.socket, 'error', (error: any) => {
        reject(error)
      })
    })
  }

  close(): Promise<void> {
    if (this.isClosed()) return Promise.resolve()
    if (this.socket) this.socket.close()

    return new Promise<void>((resolve, reject) => {
      const closed = () => {
        this.subscription = undefined
        resolve()
      }

      if (!this.socket) {
        reject(new Error('Socket is not open'))
        return
      }
      addEventListenerOnce(this.socket, 'close', closed)
      addEventListenerOnce(this.socket, 'error', (error: any) => {
        reject(error)
      })
    })
  }
}
