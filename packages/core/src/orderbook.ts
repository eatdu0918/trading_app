export interface OrderBookLevel {
  price: number;
  quantity: number;
}

export interface OrderBook {
  bids: OrderBookLevel[]; // descending by price
  asks: OrderBookLevel[]; // ascending by price
  lastUpdateId: number;
}
