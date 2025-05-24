export default class Bid {
  constructor(
    public bidId: string,
    public auctionId: string,
    public customer: string,
    public amount: number,
    public date: Date
  ) {}
}
