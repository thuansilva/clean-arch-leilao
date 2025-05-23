import express, { Request, Response } from "express";
import crypto from "crypto";
import WebSocket from "ws";
import { AuctionRepositoryDatabase } from "./AuctionRepository";
import { BidRepositoryDatabase } from "./BidRepository";
import { PgPromiseAdapter } from "./DatabaseConnection";
import CreateAuction from "./CreateAuction";

const app = express();
app.use(express.json());

const wss = new WebSocket.Server({ port: 8080 });

const connections: WebSocket[] = [];
wss.on("connection", (ws) => {
  connections.push(ws);
});

const connectionDatabase = new PgPromiseAdapter();
const auctionRepository = new AuctionRepositoryDatabase(connectionDatabase);
const bidRepository = new BidRepositoryDatabase(connectionDatabase);
const createAuction = new CreateAuction(auctionRepository);

app.post("/auctions", async (req: Request, res: Response) => {
  const input = req.body;
  const output = await createAuction.execute(input);

  res.json(output);
});

app.post("/bids", async (req: Request, res: Response) => {
  const bid = req.body;
  bid.bidId = crypto.randomUUID();

  const auction = await auctionRepository.get(bid.auctionId);

  if (!auction) throw new Error("Auction not found");

  const highestBid = await bidRepository.getHighestBidByAuctionId(
    bid.auctionId
  );

  const bidDate = new Date(bid.date);
  if (bidDate.getTime() > auction.end_date.getTime()) {
    res.status(422).json({ error: "Auction is not open" });
    return;
  }

  if (highestBid && highestBid.amount > bid.amount) {
    res
      .status(422)
      .json({ error: "Bid amount must be greater than the last bid" });
    return;
  }

  if (highestBid && highestBid.customer === bid.customer) {
    res.status(422).json({
      error: "Auction does not accept sequencial bids from the same customer",
    });
    return;
  }

  await bidRepository.save(bid);

  for (const connection of connections) {
    connection.send(Buffer.from(JSON.stringify(bid)));
  }
  res.json({ bidId: bid.bidId });
});

app.get("/auctions/:auctionId", async (req: Request, res: Response) => {
  const auctionId = req.params.auctionId;
  const auction = await auctionRepository.get(auctionId);
  if (!auction) throw new Error("Auction not found");

  const highestBid = await bidRepository.getHighestBidByAuctionId(auctionId);

  res.json({
    highestBid,
    auctionId,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
