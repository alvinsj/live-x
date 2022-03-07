import { Order, OrderWithTotal } from '../entities/Order/types'

export enum SortOrder {
  Ascending,
  Descending,
}

const mapTotal = (
  orders: Order[],
  sortOrder: SortOrder = SortOrder.Ascending
): OrderWithTotal[] => {
  const sorted = orders.sort(([priceA], [priceB]) =>
    sortOrder === SortOrder.Ascending ? priceA - priceB : priceB - priceA
  )

  const [res] = sorted.reduce(
    ([arr, sum], order) => {
      const [price, size]: Order = order
      if (size === 0) return [arr, sum]

      const newTotal = sum + size
      arr.push([price, size, newTotal] as OrderWithTotal)

      return [arr, newTotal]
    },
    [[] as OrderWithTotal[], 0]
  )
  return res
}

export default mapTotal
