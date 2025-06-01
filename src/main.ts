import express, { Request, Response } from "express";
import WebSocket from "ws";
import { AuctionRepositoryDatabase } from "./AuctionRepository";
import { BidRepositoryDatabase } from "./BidRepository";
import { PgPromiseAdapter } from "./DatabaseConnection";
import CreateAuction from "./CreateAuction";
import CreateBid from "./CreateBid";
import GetAuctions from "./GetAuctions";
import { ExpressAdapter } from "./HttpServer";

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
const createBid = new CreateBid(auctionRepository, bidRepository);
const getAuctions = new GetAuctions(auctionRepository, bidRepository);
const httpServer = new ExpressAdapter();

httpServer.register("post", "/auctions", async (params: any, body: any) => {
  const input = body;

  input.startDate = new Date(input.startDate);
  input.endDate = new Date(input.endDate);
  const output = await createAuction.execute(input);
  return output;
});

httpServer.register("post", "/bids", async (params: any, body: any) => {
  const input = body;
  input.date = new Date(input.date);

  const output = await createBid.execute(input);
  return output;
});

httpServer.register(
  "get",
  "/auctions/:auctionId",
  async (params: any, body: any) => {
    const auctionId = params.auctionId;

    const output = await getAuctions.execute(auctionId);
    return output;
  }
);

httpServer.listen(3000);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
