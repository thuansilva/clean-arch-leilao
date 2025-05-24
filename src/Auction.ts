import Bid from "./Bid";

export default class Auction {
  constructor(
    public auctionId: string,
    public startDate: Date,
    public endDate: Date,
    public minIncrement: number,
    public startAmount: number
  ) {}

  validateBid(bid: Bid, highestBid: Bid) {
    if (bid.date.getTime() > this.endDate.getTime())
      throw new Error("Auction is not open");

    if (highestBid && highestBid.amount > bid.amount)
      throw new Error("Bid amount must be greater than the last bid");

    if (highestBid && highestBid.customer === bid.customer)
      throw new Error(
        "Auction does not accept sequencial bids from the same customer"
      );

    return true;
  }
}
