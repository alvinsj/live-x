import { OrderWithTotal } from '../entities/Order/types'

export const calculateDepth = (total: number, highestTotal: number) =>
  Math.round((total / highestTotal) * 100)

const mapOrder = (
  items: OrderWithTotal[],
  highestTotal: number,
  mapper: {
    (
      [price, size, total]: OrderWithTotal,
      i: number,
      depth: number
    ): JSX.Element
  }
) =>
  items.map((item, i) => {
    return mapper(item, i, calculateDepth(item[2], highestTotal))
  })

export default mapOrder
