import express, { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import WebSocket from "ws";
import { AuctionRepositoryDatabase } from "./AuctionRepository";
import { BidRepositoryDatabase } from "./BidRepository";

const app = express();
app.use(express.json());

const wss = new WebSocket.Server({ port: 8080 });

const connections: WebSocket[] = [];
wss.on("connection", (ws) => {
  connections.push(ws);
});

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
const auctionRepository = new AuctionRepositoryDatabase();
const bidRepository = new BidRepositoryDatabase();

app.post("/auctions", async (req: Request, res: Response) => {
  const auction = req.body;
  auction.auctionId = crypto.randomUUID();

  await auctionRepository.save(auction);

  res.json({
    auctionId: auction.auctionId,
  });
});

app.post("/bids", async (req: Request, res: Response) => {
  const bid = req.body;
  bid.bidId = crypto.randomUUID();

  const [auction] = await connection.query(
    "select * from branas.auction where auction_id = $1",
    [bid.auctionId]
  );

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

  const [highestBid] = await connection.query(
    "select * from branas.bid where auction_id = $1 order by amount desc limit 1",
    [auctionId]
  );

  res.json({
    highestBid,
    auctionId,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
