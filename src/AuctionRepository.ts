import DatabaseConnection from "./DatabaseConnection";
export default interface AuctionRepository {
  save(auction: any): Promise<void>;
  get(auctionId: string): Promise<any>;
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

  async get(auctionId: string): Promise<any> {
    const [auction] = await this.connection.query(
      "select * from branas.auction where auction_id = $1",
      [auctionId]
    );

    return auction;
  }
}
