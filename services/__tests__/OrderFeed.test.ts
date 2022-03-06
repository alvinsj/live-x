import OrderFeed from '../OrderFeed'

describe('OrderFeed', () => {
  it('constructs', () => {
    expect(new OrderFeed('wss://www.cryptofacilities.com/ws/v1')).toBeTruthy()
  })
})
