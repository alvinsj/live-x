import { OrderData } from '../../services/types'
import { OrderReduceAction, OrderReduceActionType } from './reducer'

export const mapMessageToOrderAction = (
  message: OrderData
): OrderReduceAction | undefined => {
  switch (true) {
    case 'feed' in message &&
      message.feed === `${process.env.NEXT_PUBLIC_FEED_TYPE_SNAPSHOT}`:
      return {
        type: OrderReduceActionType.snapshot,
        payload: {
          bids: message.bids,
          asks: message.asks,
        },
      } as OrderReduceAction

    case 'feed' in message &&
      message.feed === `${process.env.NEXT_PUBLIC_FEED_TYPE_DELTA}`:
      return {
        type: OrderReduceActionType.update,
        payload: {
          bids: message.bids,
          asks: message.asks,
        },
      } as OrderReduceAction

    default:
      return undefined
  }
}

export default mapMessageToOrderAction
