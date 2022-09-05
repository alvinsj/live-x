import { Bid, Ask } from '../entities/Order/types'

export enum EventType {
  info = 'info',
  subscribed = 'subscribed',
}

export type Event = {
  event: EventType
  version?: string
  feed?: string
  product_ids?: ProductType[]
}

export enum ProductType {
  PI_XBTUSD = 'PI_XBTUSD',
  PI_ETHUSD = 'PI_ETHUSD',
}

export type Snapshot = {
  numLevels: number
  feed: string
  product_id: ProductType
  bids: Bid[]
  asks: Ask[]
}

export type Delta = {
  feed: string
  product_id: ProductType
  bids: Bid[]
  asks: Ask[]
}

export type OrderData = Snapshot | Delta
export type Message = Snapshot | Delta | Event
