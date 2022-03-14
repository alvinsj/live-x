import { ProductType } from './types'

export const mockConnected = (
  target: { readyState: number },
  event: string,
  fn: EventListener,
  done?: () => void
) => {
  if (event === 'open') {
    fn({} as Event)
    target.readyState = 1
    if (done) done()
  }
}

export const mockSubscribed =
  (type: ProductType) =>
  (
    _target: { readyState: number },
    event: string,
    fn: EventListener,
    shouldRemove: () => boolean,
    done?: (message: MessageEvent) => void
  ) => {
    if (event === 'message') {
      const message = {
        data: JSON.stringify({
          event: 'subscribed',
          feed: 'book_ui_1',
          product_ids: [type],
        }),
      } as MessageEvent
      fn(message)
      if (done) done(message)
    }
  }

export const mockUnsubscribed =
  (type: ProductType) =>
  (
    _target: { readyState: number },
    event: string,
    fn: EventListener,
    shouldRemove: () => boolean,
    done?: (message: MessageEvent) => void
  ) => {
    if (event === 'message') {
      const message = {
        data: JSON.stringify({
          event: 'unsubscribed',
          feed: 'book_ui_1',
          product_ids: [type],
        }),
      } as MessageEvent
      fn(message)
      if (done) done(message)
    }
  }

export const mockSnapshot = (type: ProductType) => ({
  feed: 'book_ui_1_snapshot',
  product_id: type,
  bids: [[1, 1]],
  asks: [[2, 2]],
})

// const mockDelta = {
//   feed: 'book_ui_1',
//   product_id: ProductType.PI_XBTUSD,
//   bids: [[1, 1]],
//   asks: [[2, 2]],
// }

export const mockFeed =
  (type: ProductType) =>
  (
    _target: { readyState: number },
    event: string,
    fn: EventListener,
    shouldRemove: () => boolean,
    done?: (message: MessageEvent) => void
  ) => {
    if (event === 'message') {
      const message = {
        data: JSON.stringify(mockSnapshot(type)),
      } as MessageEvent
      fn(message)
      if (done) done(message)
    }
  }

export const mockErrored = (
  target: { readyState: number },
  event: string,
  fn: (error: { message: string }) => void,
  done?: () => void
) => {
  if (event === 'error') {
    fn({ message: 'error connecting' })
    target.readyState = 2
    if (done) done()
  }
}
