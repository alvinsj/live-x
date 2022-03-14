import { Reducer } from 'react'

import { Snapshot, Delta } from '../../services/types'

import { Order } from './types'

export type OrderReduceState = {
  bids: Order[]
  asks: Order[]
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
  acc[index] = [price, deltaSize === 0 ? 0 : deltaSize]
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

      return {
        bids,
        asks,
        highestTotal: Math.max(
          bids.reduce((sum, item) => sum + item[1], 0),
          asks.reduce((sum, item) => sum + item[1], 0)
        ),
      }
    }
    case OrderReduceActionType.update: {
      const { bids, asks } = payload
      const bidsWithDeltas = bids
        .reduce(replaceWithDelta, state.bids)
        .filter(([, size]) => size > 0)
      const asksWithDeltas: Order[] = asks
        .reduce(replaceWithDelta, state.asks as Order[])
        .filter(([, size]) => size > 0)
      return {
        bids: bidsWithDeltas,
        asks: asksWithDeltas,
        highestTotal: Math.max(
          bidsWithDeltas.reduce((sum, item) => sum + item[1], 0),
          asksWithDeltas.reduce((sum, item) => sum + item[1], 0)
        ),
      }
    }
    default:
      return state
  }
}

export default reducer
