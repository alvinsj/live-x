import OrderFeed from '../OrderFeed'

describe('OrderFeed', () => {
  it('constructs', () => {
    expect(new OrderFeed(`${process.env.NEXT_PUBLIC_BOOK_WS_URL}`)).toBeTruthy()
  })
})
