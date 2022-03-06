import OrderFeed from '../services/OrderFeed'
import * as Comlink from 'comlink'

const ws = new OrderFeed('wss://www.cryptofacilities.com/ws/v1')
Comlink.expose(ws)
