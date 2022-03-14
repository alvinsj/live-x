import { FC, useCallback, useEffect, useReducer } from 'react'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import useLiveFeed from '../../hooks/useLiveFeed'
import reducer, { initialState } from '../../entities/Order/reducer'
import { OrderData, ProductType } from '../../services/types'
import mapMessageToOrderAction from '../../entities/Order/mapMessageToOrderAction'
import { Order, OrderWithTotal } from '../../entities/Order/types'

const numberFormat = new Intl.NumberFormat('en-US')
const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
})
const percentageFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
})
const spreadFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
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
  mapper: {
    ([price, size, total]: OrderWithTotal, i: number): JSX.Element
  },
  order = SortOder.asc
) => {
  let prev = 0
  return Array.from({ length: Math.min(20, items.length || 20) }).map(
    (_, i) => {
      const itemIndex = order === SortOder.asc ? i : items.length - i - 1

      if (typeof items[itemIndex] !== 'undefined') {
        const total = items[itemIndex][1] + prev
        prev = total
        return mapper([items[itemIndex][0], items[itemIndex][1], total], i)
      }

      return mapper([0, 0, 0], i)
    }
  )
}

const OrderBook: FC<OrderBookProps> = ({ productType }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleLiveFeed = useCallback((data: OrderData) => {
    const msg = mapMessageToOrderAction(data)
    if (typeof msg !== 'undefined') dispatch(msg)
  }, [])

  const { close, subscribe } = useLiveFeed(handleLiveFeed)

  useEffect(() => {
    subscribe(productType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType])

  useEffect(() => {
    return () => {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const spreadAmount =
      state.bids.length > 0 && state.asks.length > 0
        ? Math.abs(state.bids[0][0] - state.asks[0][0])
        : 0,
    spreadPercentage =
      state.asks.length > 0 ? spreadAmount / state.asks[0][0] : 0,
    spreadNumbers = `${spreadFormat.format(
      spreadAmount
    )} (${percentageFormat.format(spreadPercentage)}%)`

  return (
    <section className={styles.orders}>
      <p className={styles.spread}>
        Spread: <span className={styles.spread_number}>{spreadNumbers}</span>
      </p>
      <div className={styles.bids}>
        <header className={styles.orders_header}>
          <span className={styles.orders_headerItem}>Price</span>
          <span className={styles.orders_headerItem}>Size</span>
          <span className={styles.orders_headerItem}>Total</span>
        </header>
        {limitedRows(
          state.bids,
          ([price, size, total], index) => (
            <div
              key={`row-${index}`}
              className={styles.order}
              style={{
                background: `linear-gradient(to left, var(--buyChart) ${Math.round(
                  (total / state.highestTotal) * 100
                )}%, transparent ${Math.round(
                  (total / state.highestTotal) * 100
                )}%)`,
              }}
            >
              <span className={styles.bid_price}>{n(price, true)}</span>
              <span className={styles.order_size}>{n(size)}</span>
              <span className={styles.order_total}>{n(total)}</span>
            </div>
          ),
          SortOder.desc
        )}
      </div>

      <div className={styles.asks}>
        <header className={styles.orders_header}>
          <span className={styles.orders_headerItem}>Price</span>
          <span className={styles.orders_headerItem}>Size</span>
          <span className={styles.orders_headerItem}>Total</span>
        </header>
        {limitedRows(state.asks, ([price, size, total], index) => (
          <div
            key={`row-${index}`}
            className={styles.order}
            style={{
              background: `linear-gradient(to right, var(--sellChart) ${Math.round(
                (total / state.highestTotal) * 100
              )}%, transparent ${Math.round(
                (total / state.highestTotal) * 100
              )}%)`,
            }}
          >
            <span className={styles.ask_price}>{n(price, true)}</span>
            <span className={styles.order_size}>{n(size)}</span>
            <span className={styles.order_total}>{n(total)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default dynamic(() => Promise.resolve(OrderBook), { ssr: false })