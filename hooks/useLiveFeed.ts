import { useCallback, useRef, useState, useMemo } from 'react'
import * as Comlink from 'comlink'

import { OrderData, ProductType } from '../services/types'
import OrderFeed from '../services/OrderFeed'

export type LiveFeedHandler = (data: OrderData) => void
export type FeedRef = OrderFeed | Comlink.Remote<OrderFeed>

let proxy: FeedRef

export const useLiveFeed = (
  handleLiveFeed: LiveFeedHandler,
  handleError: (error: unknown) => void = () => undefined
) => {
  const [productType, setProductType] = useState(ProductType.PI_XBTUSD)
  const worker = useMemo(() => {
    proxy =
      proxy ||
      Comlink.wrap(new Worker(new URL('../workers/ws', import.meta.url)))
    return proxy
  }, [])

  const feedRef = useRef<FeedRef>(worker)

  const close = useCallback(async () => {
    try {
      await feedRef.current.close()
    } catch (error) {
      handleError(error)
    }
  }, [handleError])

  const subscribe = useCallback(
    async (type: ProductType, throttleMS = 8) => {
      try {
        await feedRef.current.subscribe(
          type,
          Comlink.proxy((msg: OrderData) => {
            handleLiveFeed(msg)
          }),
          throttleMS
        )
        setProductType(type)
      } catch (error) {
        handleError(error)
      }
    },
    [handleLiveFeed, handleError]
  )

  const isClosed = useCallback(async () => {
    try {
      return await feedRef.current.isClosed()
    } catch (error) {
      handleError(error)
    }
  }, [])

  return {
    close,
    subscribe,
    productType,
    isClosed,
  }
}

export default useLiveFeed
