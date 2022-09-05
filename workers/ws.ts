import OrderFeed from '../services/OrderFeed'
import * as Comlink from 'comlink'

const ws = new OrderFeed(`${process.env.NEXT_PUBLIC_BOOK_WS_URL}`)
Comlink.expose(ws)
