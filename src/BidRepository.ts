import pgp from "pg-promise";
export default interface BidRepository {
  save(bid: any): Promise<void>;
  getHighestBidByAuctionId(auctionId: string): Promise<any>;
}

export class BidRepositoryDatabase implements BidRepository {
  constructor() {}

  async save(bid: any): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

    await connection.query(
      "insert into branas.bid(bid_id, auction_id, customer, amount, date) values ($1, $2, $3, $4, $5)",
      [bid.bidId, bid.auctionId, bid.customer, bid.amount, bid.date]
    );

    await connection.$pool.end();
  }

  async getHighestBidByAuctionId(auctionId: string): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

    const [highestBid] = await connection.query(
      "select * from branas.bid where auction_id = $1 order by amount desc limit 1",
      [auctionId]
    );
    await connection.$pool.end();

    return highestBid;
  }
}
