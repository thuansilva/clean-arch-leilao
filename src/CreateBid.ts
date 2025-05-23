import Auction from "./Auction";
import AuctionRepository from "./AuctionRepository";
import Bid from "./Bid";
import BidRepository from "./BidRepository";

export default class CreateBid {
  constructor(
    readonly auctionRepository: AuctionRepository,
    readonly bidRepository: BidRepository
  ) {}

  async execute(input: Input): Promise<Output> {
    const bidId = crypto.randomUUID();
    const bid = new Bid(
      bidId,
      input.auctionId,
      input.customer,
      input.amount,
      input.date
    );

    const auction = await this.auctionRepository.get(bid.auctionId);

    if (!auction) throw new Error("Auction not found");

    const highestBid = await this.bidRepository.getHighestBidByAuctionId(
      bid.auctionId
    );

    auction.validateBid(bid, highestBid);

    await this.bidRepository.save(bid);

    // for (const connection of connections) {
    //   connection.send(Buffer.from(JSON.stringify(bid)));
    // }
    return { bidId: bid.bidId };
  }
}

type Input = {
  auctionId: string;
  customer: string;
  amount: number;
  date: Date;
};

type Output = {
  bidId: string;
};
