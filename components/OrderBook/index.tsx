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

import { OrderData, ProductType } from '../../services/types'

import reducer, { initialState } from '../../entities/Order/reducer'
import mapMessageToOrderAction from '../../entities/Order/mapMessageToOrderAction'

import useLiveFeed from '../../hooks/useLiveFeed'
import useMatchMedia from '../../hooks/useMatchMedia'
import useAnimationFrame from '../../hooks/useAnimationFrame'
import useWindowBlur from '../../hooks/useWindowBlur'

import limitRows, { SortOrder } from '../../utils/limitRows'
import mapOrder from '../../utils/mapOrder'

import styles from './styles.module.css'

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

const OrderBook: FC<OrderBookProps> = ({ productType }) => {
  const [isInactiveText, setIsInactiveText] = useState<string | boolean>(false)

  // useLiveFeed
  const [reducerState, dispatch] = useReducer(reducer, initialState)
  const handleLiveFeed = useCallback((data: OrderData) => {
    const msg = mapMessageToOrderAction(data)
    if (typeof msg !== 'undefined') dispatch(msg)
  }, [])
  const handleFeedError = useCallback(() => {
    setIsInactiveText('Error connecting to feed. Click to retry.')
  }, [])
  const { close, subscribe } = useLiveFeed(handleLiveFeed, handleFeedError)

  const handleClose = useCallback(() => {
    setIsInactiveText(
      'Updates were stopped due to inactivity. Click to reconnect.'
    )
    close()
  }, [close])

  const handleReconnect = useCallback(async () => {
    await subscribe(productType)
    setIsInactiveText(false)
  }, [productType, subscribe])

  // 1. Initial subscription and handles product type change
  useEffect(() => {
    subscribe(productType)
    setIsInactiveText(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType])

  // Handles unmount/cleanup, close connection
  useEffect(() => {
    return () => {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handles window blur, disconnect ws to save resources
  useWindowBlur(handleClose)

  // Handles size change
  const { isSmallScreen } = useMatchMedia('(max-width: 600px)')

  // Handles animation frame
  const [state, setState] = useState(reducerState)
  const ref = useRef(reducerState)
  ref.current = reducerState
  useAnimationFrame(() => {
    setState(ref.current)
  })

  const { spreadNumbers } = useMemo(() => {
    const spreadAmount =
        state.bids.length > 0 && state.asks.length > 0
          ? Math.abs(state.bids[state.bids.length - 1][0] - state.asks[0][0])
          : 0,
      // FIXME check how percentage is calculated
      spreadPercentage =
        state.asks.length > 0 ? spreadAmount / state.asks[0][0] : 0,
      spreadNumbers = `${spreadFormat.format(
        spreadAmount
      )} (${percentageFormat.format(spreadPercentage)}%)`

    return { spreadAmount, spreadPercentage, spreadNumbers }
  }, [state.bids, state.asks])

  const [bids, bidsTotal] = useMemo(
    () => limitRows(state.bids, SortOrder.desc),
    [state.bids]
  )
  const [asks, asksTotal] = useMemo(
    () => limitRows(state.asks, SortOrder.asc),
    [state.asks]
  )
  const highestTotal = Math.max(bidsTotal, asksTotal)

  return (
    <section className={styles.orders}>
      {isInactiveText && (
        <div className={styles.orders_overlay} onClick={handleReconnect}>
          {isInactiveText}
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
