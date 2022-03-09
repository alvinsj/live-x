import { Reducer } from 'react'

import { Snapshot, Delta } from '../../services/types'
import mapTotal from '../../utils/mapTotal'

import { Order, OrderWithTotal } from './types'

export type OrderReduceState = {
  bids: OrderWithTotal[]
  asks: OrderWithTotal[]
  highestTotal: number
}

export enum OrderReduceActionType {
  snapshot = 'snapshot',
  update = 'update',
}

export type OrderReduceAction = {
  type: OrderReduceActionType
  payload: Snapshot | Delta
}

export const initialState = {
  bids: [],
  asks: [],
  highestTotal: 0,
}

const replaceWithDelta = (acc: Order[], [price, deltaSize]: Order): Order[] => {
  const index = acc.findIndex(([p]) => p === price)
  if (index === -1) {
    return [...acc, [price, deltaSize]]
  }
  const [, size] = acc[index]
  acc[index] = [price, deltaSize === 0 ? 0 : size + deltaSize]
  return acc
}

const reducer: Reducer<OrderReduceState, OrderReduceAction> = (
  state,
  action
) => {
  const { payload, type } = action

  switch (type) {
    case OrderReduceActionType.snapshot: {
      const { bids, asks } = payload
      const newBids = mapTotal(bids)
      const newAsks = mapTotal(asks)
      const highestTotal = Math.max(
        newBids[newBids.length - 1][2],
        newAsks[newAsks.length - 1][2]
      )

      return {
        bids: newBids,
        asks: newAsks,
        highestTotal,
      }
    }
    case OrderReduceActionType.update: {
      const { bids, asks } = payload
      const bidsWithDeltas: Order[] = bids.reduce(
        replaceWithDelta,
        state.bids as any
      )
      const asksWithDeltas: Order[] = asks.reduce(
        replaceWithDelta,
        state.asks as any
      )
      const newBids = mapTotal(bidsWithDeltas)
      const newAsks = mapTotal(asksWithDeltas)
      const highestTotal = Math.max(
        newBids[newBids.length - 1][2],
        newAsks[newAsks.length - 1][2]
      )
      return {
        bids: newBids,
        asks: newAsks,
        highestTotal,
      }
    }
    default:
      return state
  }
}

export default reducer
