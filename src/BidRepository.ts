import DatabaseConnection from "./DatabaseConnection";
export default interface BidRepository {
  save(bid: any): Promise<void>;
  getHighestBidByAuctionId(auctionId: string): Promise<any>;
}

export class BidRepositoryDatabase implements BidRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async save(bid: any): Promise<void> {
    await this.connection.query(
      "insert into branas.bid(bid_id, auction_id, customer, amount, date) values ($1, $2, $3, $4, $5)",
      [bid.bidId, bid.auctionId, bid.customer, bid.amount, bid.date]
    );
  }

  async getHighestBidByAuctionId(auctionId: string): Promise<any> {
    const [highestBid] = await this.connection.query(
      "select * from branas.bid where auction_id = $1 order by amount desc limit 1",
      [auctionId]
    );

    return highestBid;
  }
}
