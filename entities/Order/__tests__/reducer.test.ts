import reducer, {
  initialState,
  OrderReduceActionType,
  OrderReduceAction,
} from '../reducer'
import { Snapshot } from '../../../services/types'

describe('reducer', () => {
  it('reduces to initial state', () => {
    expect(reducer(initialState, {} as OrderReduceAction)).toEqual({
      bids: [],
      asks: [],
      highestTotal: 0,
    })
  })

  describe('snapshot', () => {
    it('saves orders with snapshot', () => {
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

    it('sorts orders with snapshot', () => {
      expect(
        reducer(initialState, {
          type: OrderReduceActionType.snapshot,
          payload: {
            bids: [
              [10, 10],
              [1, 20],
            ],
            asks: [
              [1, 1],
              [0.2, 3],
            ],
          } as Snapshot,
        })
      ).toEqual({
        bids: [
          [1, 20],
          [10, 10],
        ],
        asks: [
          [0.2, 3],
          [1, 1],
        ],
        highestTotal: 30,
      })
    })
  })

  describe('delta', () => {
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
              asks: [] as [number, number][],
            } as Snapshot,
          }
        )
      ).toEqual({
        bids: [[11, 11]],
        asks: [[1, 1]],
        highestTotal: 11,
      })
    })

    it('sorts orders with delta', () => {
      expect(
        reducer(
          { bids: [[10, 10]], asks: [[1, 1]], highestTotal: 10 },
          {
            type: OrderReduceActionType.update,
            payload: {
              bids: [
                [10, 0],
                [11, 11],
                [1, 2],
              ],
              asks: [] as [number, number][],
            } as Snapshot,
          }
        )
      ).toEqual({
        bids: [
          [1, 2],
          [11, 11],
        ],
        asks: [[1, 1]],
        highestTotal: 13,
      })
    })
  })
})
