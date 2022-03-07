import { Reducer } from 'react'

import { Snapshot, Delta } from '../../services/types'
import mapTotal, { SortOrder } from '../../utils/mapTotal'

import { Order, OrderWithTotal } from './types'

export type OrderReduceState = {
  bids: OrderWithTotal[]
  asks: OrderWithTotal[]
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
  const [, size] = acc[index]
  acc[index] = [price, size + deltaSize]
  return acc
}

const reducer: Reducer<OrderReduceState, OrderReduceAction> = (
  state,
  action
) => {
  const { payload, type } = action

  switch (type) {
    case OrderReduceActionType.snapshot:
      return {
        bids: mapTotal(payload.bids, SortOrder.Descending),
        asks: mapTotal(payload.asks),
      }
    case OrderReduceActionType.update: {
      const bidsWithDeltas: Order[] = payload.bids.reduce(
        replaceWithDelta,
        state.bids as any
      )
      const asksWithDeltas: Order[] = payload.asks.reduce(
        replaceWithDelta,
        state.asks as any
      )
      return {
        bids: mapTotal(bidsWithDeltas, SortOrder.Descending),
        asks: mapTotal(asksWithDeltas),
      }
    }
    default:
      return state
  }
}

export default reducer
