import Auction from "./Auction";
import DatabaseConnection from "./DatabaseConnection";
export default interface AuctionRepository {
  save(auction: any): Promise<void>;
  get(auctionId: string): Promise<Auction>;
}

export class AuctionRepositoryDatabase implements AuctionRepository {
  constructor(readonly connection: DatabaseConnection) {}

  async save(auction: any): Promise<void> {
    await this.connection.query(
      "insert into branas.auction(auction_id, start_date,end_date, min_increment, start_amount) values ($1, $2, $3, $4, $5)",
      [
        auction.auctionId,
        auction.startDate,
        auction.endDate,
        auction.minIncrement,
        auction.startAmount,
      ]
    );
  }

  async get(auctionId: string): Promise<Auction> {
    const [auction] = await this.connection.query(
      "select * from branas.auction where auction_id = $1",
      [auctionId]
    );

    if (!auction) throw new Error("Auction not found");

    return new Auction(
      auction.auction_id,
      auction.start_date,
      auction.end_date,
      auction.min_increment,
      auction.start_amount
    );
  }
}
