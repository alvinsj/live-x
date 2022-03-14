import reducer, { initialState, OrderReduceActionType } from '../reducer'

describe('reducer', () => {
  it('reduces to initial state', () => {
    expect(reducer(initialState, {})).toEqual({
      bids: [],
      asks: [],
      highestTotal: 0,
    })
  })

  it('saves order with snapshot', () => {
    expect(
      reducer(initialState, {
        type: OrderReduceActionType.snapshot,
        payload: { bids: [[10, 10]], asks: [[1, 1]] } as Snapshot,
      })
    ).toEqual({
      bids: [[10, 10]],
      asks: [[1, 1]],
      highestTotal: 10,
    })
  })

  it('updates orders with delta', () => {
    expect(
      reducer(
        { bids: [[10, 10]], asks: [[1, 1]], highestTotal: 10 },
        {
          type: OrderReduceActionType.update,
          payload: { bids: [[10, 100]], asks: [[1, 10]] } as Snapshot,
        }
      )
    ).toEqual({
      bids: [[10, 100]],
      asks: [[1, 10]],
      highestTotal: 100,
    })
  })

  it('removes orders when size=0', () => {
    expect(
      reducer(
        { bids: [[10, 10]], asks: [[1, 1]], highestTotal: 10 },
        {
          type: OrderReduceActionType.update,
          payload: {
            bids: [
              [10, 0],
              [11, 11],
            ],
            asks: [],
          } as Snapshot,
        }
      )
    ).toEqual({
      bids: [[11, 11]],
      asks: [[1, 1]],
      highestTotal: 11,
    })
  })
})
