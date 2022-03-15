import { OrderData } from '../../services/types'
import { OrderReduceAction, OrderReduceActionType } from './reducer'

export const mapMessageToOrderAction = (
  message: OrderData
): OrderReduceAction | undefined => {
  switch (true) {
    case 'feed' in message && message.feed === 'book_ui_1_snapshot':
      return {
        type: OrderReduceActionType.snapshot,
        payload: {
          bids: message.bids,
          asks: message.asks,
        },
      } as OrderReduceAction

    case 'feed' in message && message.feed === 'book_ui_1':
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
