export type Price = number
export type Size = number
export type Total = number

export type Order = [Price, Size]
export type OrderWithTotal = [Price, Size, Total]
export type Bid = Order
export type Ask = Order
export type ProductID = string
