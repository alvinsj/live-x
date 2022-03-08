import { FC, useCallback, useEffect, useReducer } from 'react'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import useLiveFeed from '../../hooks/useLiveFeed'
import reducer, { initialState } from '../../entities/Order/reducer'
import { OrderData, ProductType } from '../../services/types'
import mapMessageToOrderAction from '../../entities/Order/mapMessageToOrderAction'
import { OrderWithTotal } from '../../entities/Order/types'

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
    spreadText = `Spread: ${spreadFormat.format(
      spreadAmount
    )} (${percentageFormat.format(spreadPercentage)}%)`

  const limitedRows = (
    items: OrderWithTotal[],
    mapper: {
      ([price, size, total]: OrderWithTotal, i: number): JSX.Element
    }
  ) =>
    Array.from({ length: Math.min(20, items.length) }).map((_, i) => {
      return typeof items[i] !== 'undefined' ? mapper(items[i], i) : false
    })

  return (
    <section className={styles.orders}>
      <p className={styles.spread}>{spreadText}</p>
      <table className={styles.bids}>
        <thead>
          <tr>
            <th>Price</th>
            <th>Size</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {limitedRows(state.bids, ([price, size, total], index) => (
            <tr key={`row-${index}`} className={styles.order}>
              <td className={styles.order_price}>{n(price, true)}</td>
              <td className={styles.order_size}>{n(size)}</td>
              <td className={styles.order_total}>{n(total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className={styles.asks}>
        <thead>
          <tr>
            <th>Price</th>
            <th>Size</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {limitedRows(state.asks, ([price, size, total], index) => (
            <tr key={`row-${index}`} className={styles.order}>
              <td className={styles.order_price}>{n(price, true)}</td>
              <td className={styles.order_size}>{n(size)}</td>
              <td className={styles.order_total}>{n(total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default dynamic(() => Promise.resolve(OrderBook), { ssr: false })
