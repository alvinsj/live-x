import OrderFeed from '../OrderFeed'
import addEventListenerOnce, {
  addErrorListenerOnce,
} from '../../utils/addEventListenerOnce'
import { ProductType } from '../types'
import {
  mockConnected,
  mockErrored,
  mockFeed,
  mockSnapshot,
  mockSubscribed,
  mockUnsubscribed,
} from '../mocks'

jest.mock('../../utils/addEventListenerOnce', () => ({
  __esModule: true,
  default: jest.fn(),
  addEventListenerOnce: jest.fn(),
  addErrorListenerOnce: jest.fn(),
}))

describe('OrderFeed', () => {
  it('constructs', () => {
    expect(new OrderFeed('wss://mock-url')).toBeTruthy()
  })

  describe('connect()', () => {
    let socketSpyFactory: jest.SpyInstance

    beforeAll(() => {
      socketSpyFactory = jest.spyOn(global, 'WebSocket')
      Object.defineProperty(socketSpyFactory, 'OPEN', { value: 1 })
      Object.defineProperty(socketSpyFactory, 'CLOSED', { value: 2 })
      socketSpyFactory.mockImplementation(function () {
        return {
          readyState: 2,
        } as WebSocket
      })
    })

    afterAll(() => {
      socketSpyFactory.mockRestore()
    })

    it('connects to websocket server', async () => {
      ;(addEventListenerOnce as jest.Mock).mockImplementation(mockConnected)

      const feed = new OrderFeed('wss://mock-url')
      expect(feed.isConnected()).toBeFalsy()
      await feed.connect()
      expect(feed.isConnected()).toBeTruthy()
    })

    it('throws error when websocket error', async () => {
      ;(addErrorListenerOnce as jest.Mock).mockImplementation(mockErrored)

      const feed = new OrderFeed('wss://mock-url')
      expect(feed.isConnected()).toBeFalsy()

      try {
        await feed.connect()
      } catch (e: unknown) {
        expect(e).toBe('error connecting')
      }
    })
  })

  describe('subscribe()', () => {
    let socketSpyFactory: jest.SpyInstance
    let feed: OrderFeed
    const mockSend = jest.fn()

    beforeEach(() => {
      socketSpyFactory = jest.spyOn(global, 'WebSocket')
      Object.defineProperty(socketSpyFactory, 'OPEN', { value: 1 })
      socketSpyFactory.mockImplementation(function () {
        return {
          readyState: 1,
          send: mockSend,
        } as unknown
      })
      ;(addEventListenerOnce as jest.Mock).mockImplementation(mockConnected)
      feed = new OrderFeed('wss://mock-url')
      feed.connect()
    })

    it('subscribes to feed', async () => {
      // 1. mocks
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockSubscribed(ProductType.PI_XBTUSD)
      )
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockFeed(ProductType.PI_XBTUSD)
      )

      // 2. actions
      const handleLiveData = jest.fn()
      await feed.subscribe(ProductType.PI_XBTUSD, handleLiveData)

      // 3. results
      // websocket.send
      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'subscribe',
          feed: 'book_ui_1',
          product_ids: ['PI_XBTUSD'],
        })
      )
      // subscribed to product
      expect(feed.productId).toBe(ProductType.PI_XBTUSD)

      // start receiving feed
      expect(handleLiveData).toBeCalledWith(mockSnapshot(ProductType.PI_XBTUSD))
    })

    it('unsubscribes feed before subscribing new feed', async () => {
      // 1. mocks
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockSubscribed(ProductType.PI_XBTUSD)
      )
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockFeed(ProductType.PI_XBTUSD)
      )
      const handleLiveData = jest.fn()
      await feed.subscribe(ProductType.PI_XBTUSD, handleLiveData)

      mockSend.mockReset()
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockUnsubscribed(ProductType.PI_XBTUSD)
      )
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockSubscribed(ProductType.PI_ETHUSD)
      )
      ;(addEventListenerOnce as jest.Mock).mockImplementationOnce(
        mockFeed(ProductType.PI_ETHUSD)
      )

      // 2. actions
      // subscribed to feed
      expect(feed.productId).toBe(ProductType.PI_XBTUSD)

      // subscribe to another new feed
      await feed.subscribe(ProductType.PI_ETHUSD, handleLiveData)
      expect(mockSend).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          event: 'unsubscribe',
          feed: 'book_ui_1',
          product_ids: ['PI_XBTUSD'],
        })
      )
      expect(mockSend).toHaveBeenNthCalledWith(
        2,
        JSON.stringify({
          event: 'subscribe',
          feed: 'book_ui_1',
          product_ids: ['PI_ETHUSD'],
        })
      )
      // subscribed to product
      expect(feed.productId).toBe(ProductType.PI_ETHUSD)

      // start receiving feed
      expect(handleLiveData).toBeCalledWith(mockSnapshot(ProductType.PI_ETHUSD))
    })

    it('throws error', async () => {
      ;(addErrorListenerOnce as jest.Mock).mockImplementation(mockErrored)

      try {
        const handleLiveData = jest.fn()
        await feed.subscribe(ProductType.PI_XBTUSD, handleLiveData)
      } catch (e: unknown) {
        expect(e).toBe('error connecting')
      }
    })
  })
})
