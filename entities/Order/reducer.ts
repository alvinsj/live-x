import { Reducer } from 'react'

import { Snapshot, Delta } from '../../services/types'

import { Order } from './types'

export type OrderReduceState = {
  bids: Order[]
  asks: Order[]
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
        bids: bids.sort((a, b) => a[0] - b[0]),
        asks: asks.sort((a, b) => a[0] - b[0]),
      }
    }
    case OrderReduceActionType.update: {
      const { bids, asks } = payload
      const bidsWithDeltas = bids
        .reduce(replaceWithDelta, state.bids)
        .filter(([, size]) => size > 0)
        .sort((a, b) => a[0] - b[0])
      const asksWithDeltas: Order[] = asks
        .reduce(replaceWithDelta, state.asks as Order[])
        .filter(([, size]) => size > 0)
        .sort((a, b) => a[0] - b[0])

      return {
        bids: bidsWithDeltas,
        asks: asksWithDeltas,
      }
    }
    default:
      return state
  }
}

export default reducer
