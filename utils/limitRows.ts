import { Order, OrderWithTotal } from '../entities/Order/types'
export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

const limitRows = (
  items: Order[],
  order = SortOrder.asc
): [OrderWithTotal[], number] => {
  let prev = 0

  return [
    Array.from({ length: Math.min(20, items.length || 20) }).map((_, i) => {
      const itemIndex = order === SortOrder.asc ? i : items.length - i - 1

      if (typeof items[itemIndex] !== 'undefined') {
        const total = items[itemIndex][1] + prev
        prev = total
        return [items[itemIndex][0], items[itemIndex][1], total]
      }

      return [0, 0, 0]
    }),
    prev,
  ]
}

export default limitRows
