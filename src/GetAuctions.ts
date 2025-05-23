import AuctionRepository from "./AuctionRepository";
import BidRepository from "./BidRepository";

export default class GetAuctions {
  constructor(
    readonly auctionRepository: AuctionRepository,
    readonly bidRepository: BidRepository
  ) {}
  async execute(auctionId: string): Promise<Output> {
    const auction = await this.auctionRepository.get(auctionId);
    const highestBid = await this.bidRepository.getHighestBidByAuctionId(
      auctionId
    );

    return {
      auctionId: auction.auctionId,
      highestBid,
    };
  }
}

type Output = {
  auctionId: string;
  highestBid: { customer: string; amount: number };
};
