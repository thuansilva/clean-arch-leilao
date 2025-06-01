import express, { Request, Response } from "express";
import WebSocket from "ws";
import { AuctionRepositoryDatabase } from "./AuctionRepository";
import { BidRepositoryDatabase } from "./BidRepository";
import { PgPromiseAdapter } from "./DatabaseConnection";
import CreateAuction from "./CreateAuction";
import CreateBid from "./CreateBid";
import GetAuctions from "./GetAuctions";
import { ExpressAdapter } from "./HttpServer";
import MainController from "./MainController";

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
new MainController(
  httpServer,
  createAuction,
  getAuctions,
  createBid,
  getAuctions
);

httpServer.listen(3000);
z;

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
