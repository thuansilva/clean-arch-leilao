import Auction from "./Auction";
import AuctionRepository from "./AuctionRepository";

export default class CreateAuction {
  constructor(readonly auctionRepository: AuctionRepository) {}

  async execute(input: Input): Promise<Output> {
    const auctionId = crypto.randomUUID();

    const auction = new Auction(
      auctionId,
      input.startDate,
      input.endDate,
      input.minIncrement,
      input.startAmount
    );

    await this.auctionRepository.save(auction);
    return {
      auctionId,
    };
  }
}

type Input = {
  startDate: Date;
  endDate: Date;
  minIncrement: number;
  startAmount: number;
};

type Output = {
  auctionId: string;
};
