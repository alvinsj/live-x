import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useState,
  useMemo,
  useRef,
} from 'react'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import useLiveFeed from '../../hooks/useLiveFeed'
import reducer, { initialState } from '../../entities/Order/reducer'
import { OrderData, ProductType } from '../../services/types'
import mapMessageToOrderAction from '../../entities/Order/mapMessageToOrderAction'
import { Order, OrderWithTotal } from '../../entities/Order/types'
import useFPS from '../../hooks/useFPS'
import useAnimationFrame from '../../hooks/useAnimationFrame'

const numberFormat = new Intl.NumberFormat('en-US')
const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
})
const percentageFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
})
const spreadFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const n = (num: number, isPrice = false) =>
  isPrice ? priceFormat.format(num) : numberFormat.format(num)

export type OrderBookProps = {
  productType: ProductType
}

export enum SortOder {
  asc = 'asc',
  desc = 'desc',
}

const limitedRows = (
  items: Order[],
  order = SortOder.asc
): [OrderWithTotal[], number] => {
  let prev = 0

  return [
    Array.from({ length: Math.min(20, items.length || 20) }).map((_, i) => {
      const itemIndex = order === SortOder.asc ? i : items.length - i - 1

      if (typeof items[itemIndex] !== 'undefined') {
        const total = items[itemIndex][1] + prev
        prev = total
        return [items[itemIndex][0], items[itemIndex][1], total]
      }

      return [0, 0, 0]
    }),
    prev,
  ]
}

const mapOrder = (
  items: OrderWithTotal[],
  highestTotal: number,
  mapper: {
    (
      [price, size, total]: OrderWithTotal,
      i: number,
      depth: number
    ): JSX.Element
  }
) =>
  items.map((item, i) => {
    return mapper(item, i, Math.round((item[2] / highestTotal) * 100))
  })

const OrderBook: FC<OrderBookProps> = ({ productType }) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState)
  const [isInactive, setIsInactive] = useState<string | boolean>(false)
  const [isSmallScreen, setIsSmallScreen] = useState(
    window?.matchMedia('(max-width: 600px)').matches
  )
  const [state, setState] = useState(reducerState)

  const ref = useRef(reducerState)
  ref.current = reducerState
  useAnimationFrame(() => {
    setState(ref.current)
  })

  const handleLiveFeed = useCallback((data: OrderData) => {
    const msg = mapMessageToOrderAction(data)
    if (typeof msg !== 'undefined') dispatch(msg)
  }, [])

  const handleFeedError = useCallback(() => {
    setIsInactive('Error connecting to feed. Click to retry.')
  }, [])

  const { close, subscribe } = useLiveFeed(handleLiveFeed, handleFeedError)

  useEffect(() => {
    subscribe(productType)
    setIsInactive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType])

  useEffect(() => {
    return () => {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    const handleClose = () => {
      setIsInactive(
        'Updates were stopped due to inactivity. Click to reconnect.'
      )
      close()
    }
    window.addEventListener('blur', handleClose)
    return () => {
      window.removeEventListener('blur', handleClose)
    }
  }, [close])

  useEffect(() => {
    const mediaQuery = window?.matchMedia('(max-width: 600px)')
    const handleSmallScreenSchange = (e: any) => {
      if (e.matches) {
        setIsSmallScreen(true)
      } else setIsSmallScreen(false)
    }
    mediaQuery.addEventListener('change', handleSmallScreenSchange)

    return () => {
      mediaQuery.removeEventListener('change', handleSmallScreenSchange)
    }
  }, [])

  const handleReconnect = useCallback(async () => {
    await subscribe(productType)
    setIsInactive(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType, subscribe])

  const { spreadNumbers } = useMemo(() => {
    const spreadAmount =
        state.bids.length > 0 && state.asks.length > 0
          ? Math.abs(state.bids[state.bids.length - 1][0] - state.asks[0][0])
          : 0,
      spreadPercentage =
        state.asks.length > 0 ? spreadAmount / state.asks[0][0] : 0,
      spreadNumbers = `${spreadFormat.format(
        spreadAmount
      )} (${percentageFormat.format(spreadPercentage)}%)`

    return { spreadAmount, spreadPercentage, spreadNumbers }
  }, [state.bids, state.asks])

  const [bids, bidsTotal] = useMemo(
    () => limitedRows(state.bids, SortOder.desc),
    [state.bids]
  )
  const [asks, asksTotal] = useMemo(
    () => limitedRows(state.asks, SortOder.asc),
    [state.asks]
  )
  const highestTotal = Math.max(bidsTotal, asksTotal)

  return (
    <section className={styles.orders}>
      {isInactive && (
        <div className={styles.orders_overlay} onClick={handleReconnect}>
          {isInactive}
        </div>
      )}
      <p className={styles.spread}>
        Spread: <span className={styles.spread_number}>{spreadNumbers}</span>
      </p>
      <div className={styles.bids}>
        <header className={styles.orders_header}>
          <span className={styles.orders_headerItem}>Price</span>
          <span className={styles.orders_headerItem}>Size</span>
          <span className={styles.orders_headerItem}>Total</span>
        </header>
        {mapOrder(bids, highestTotal, ([price, size, total], index, depth) => (
          <div
            key={`row-${index}`}
            className={styles.order}
            style={{
              background: `linear-gradient(to ${
                isSmallScreen ? 'right' : 'left'
              }, var(--buyChart) ${depth}%, transparent ${depth}%)`,
            }}
          >
            <span className={styles.bid_price}>{n(price, true)}</span>
            <span className={styles.order_size}>{n(size)}</span>
            <span className={styles.order_total}>{n(total)}</span>
          </div>
        ))}
      </div>

      <div className={styles.asks}>
        <header className={styles.orders_header}>
          <span className={styles.orders_headerItem}>Price</span>
          <span className={styles.orders_headerItem}>Size</span>
          <span className={styles.orders_headerItem}>Total</span>
        </header>
        {mapOrder(
          isSmallScreen ? asks.reverse() : asks,
          highestTotal,
          ([price, size, total], index, depth) => (
            <div
              key={`row-${index}`}
              className={styles.order}
              style={{
                background: `linear-gradient(to right, var(--sellChart) ${depth}%, transparent ${depth}%)`,
              }}
            >
              <span className={styles.ask_price}>{n(price, true)}</span>
              <span className={styles.order_size}>{n(size)}</span>
              <span className={styles.order_total}>{n(total)}</span>
            </div>
          )
        )}
      </div>
    </section>
  )
}

export default dynamic(() => Promise.resolve(OrderBook), { ssr: false })
