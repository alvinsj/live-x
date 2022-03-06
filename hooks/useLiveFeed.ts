import { useCallback, useEffect, useRef } from 'react'
import * as Comlink from 'comlink'

import { OrderData, ProductType } from '../services/types'
import OrderFeed from '../services/OrderFeed'

export type LiveFeedHandler = (data: OrderData) => void
export type FeedRef = OrderFeed | Comlink.Remote<OrderFeed>

export const useLiveFeed = (handleLiveFeed: LiveFeedHandler) => {
  const feedRef = useRef<FeedRef>(
    new OrderFeed(process.env.NEXT_PUBLIC_BOOK_WS_URL!)
  )
  useEffect(() => {
    const worker = new Worker(new URL('../workers/ws', import.meta.url))
    feedRef.current = Comlink.wrap(worker) || feedRef.current

    return () => {
      feedRef.current.close()
    }
  }, [])

  const close = useCallback(async () => {
    await feedRef.current.close()
  }, [])

  const subscribe = useCallback(
    async (type: ProductType) => {
      await feedRef.current.subscribe(
        type,
        Comlink.proxy((msg: OrderData) => {
          handleLiveFeed(msg)
        })
      )
    },
    [handleLiveFeed]
  )

  return {
    close,
    subscribe,
  }
}

export default useLiveFeed
