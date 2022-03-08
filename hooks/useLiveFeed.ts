import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import * as Comlink from 'comlink'

import { OrderData, ProductType } from '../services/types'
import OrderFeed from '../services/OrderFeed'

export type LiveFeedHandler = (data: OrderData) => void
export type FeedRef = OrderFeed | Comlink.Remote<OrderFeed>

let proxy: FeedRef

export const useLiveFeed = (handleLiveFeed: LiveFeedHandler) => {
  const [productType, setProductType] = useState(ProductType.PI_XBTUSD)
  const worker = useMemo(() => {
    proxy =
      proxy ||
      Comlink.wrap(new Worker(new URL('../workers/ws', import.meta.url)))
    return proxy
  }, [])

  const feedRef = useRef<FeedRef>(worker)

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
