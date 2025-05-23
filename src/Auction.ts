export default class Auction {
  constructor(
    public auctionId: string,
    public startDate: Date,
    public endDate: Date,
    public minIncrement: number,
    public startAmount: number
  ) {}
}
