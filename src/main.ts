import express, { Request, Response } from "express";
import WebSocket from "ws";
import { AuctionRepositoryDatabase } from "./AuctionRepository";
import { BidRepositoryDatabase } from "./BidRepository";
import { PgPromiseAdapter } from "./DatabaseConnection";
import CreateAuction from "./CreateAuction";
import CreateBid from "./CreateBid";
import GetAuctions from "./GetAuctions";

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

app.post("/auctions", async (req: Request, res: Response) => {
  const input = req.body;

  input.startDate = new Date(input.startDate);
  input.endDate = new Date(input.endDate);
  const output = await createAuction.execute(input);
  res.json(output);
});

app.post("/bids", async (req: Request, res: Response) => {
  const input = req.body;
  input.date = new Date(input.date);

  try {
    const output = await createBid.execute(input);
    res.json(output);
    return;
  } catch (e: any) {
    res.status(422).json({ error: e.message });
    return;
  }
});

app.get("/auctions/:auctionId", async (req: Request, res: Response) => {
  const auctionId = req.params.auctionId;

  const output = await getAuctions.execute(auctionId);
  res.json(output);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
