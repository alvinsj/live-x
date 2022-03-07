import { useCallback, useEffect, useRef, useState } from 'react'
import * as Comlink from 'comlink'

import { OrderData, ProductType } from '../services/types'
import OrderFeed from '../services/OrderFeed'

export type LiveFeedHandler = (data: OrderData) => void
export type FeedRef = OrderFeed | Comlink.Remote<OrderFeed>

export const useLiveFeed = (handleLiveFeed: LiveFeedHandler) => {
  const [productType, setProductType] = useState(ProductType.PI_XBTUSD)
  const feedRef = useRef<FeedRef>(
    new OrderFeed(process.env.NEXT_PUBLIC_BOOK_WS_URL!)
  )
  useEffect(() => {
    const worker = new Worker(new URL('../workers/ws', import.meta.url))
    feedRef.current = Comlink.wrap(worker) || feedRef.current
    feedRef.current.connect()

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
      setProductType(type)
    },
    [handleLiveFeed]
  )

  return {
    close,
    subscribe,
    productType,
  }
}

export default useLiveFeed
