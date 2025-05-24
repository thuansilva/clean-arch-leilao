import { afterEach, beforeEach, expect, test } from "@jest/globals";
import axios from "axios";
import WebSocket from "ws";
import { PgPromiseAdapter } from "../src/DatabaseConnection";
import { AuctionRepositoryDatabase } from "../src/AuctionRepository";
import { BidRepositoryDatabase } from "../src/BidRepository";
import CreateAuction from "../src/CreateAuction";
import CreateBid from "../src/CreateBid";
import GetAuctions from "../src/GetAuctions";

axios.defaults.validateStatus = () => true;

// let ws: WebSocket;
// let messages: any[] = [];

// beforeEach(async () => {
//   ws = new WebSocket("ws://localhost:8080");
//   ws.on("message", (data: any) => {
//     const message = JSON.parse(data.toString());
//     messages.push(message);
//   });
// });

test("Deve criar um leilao e dar três lances", async () => {
  const connectionDatabase = new PgPromiseAdapter();
  const auctionRepository = new AuctionRepositoryDatabase(connectionDatabase);
  const bidRepository = new BidRepositoryDatabase(connectionDatabase);
  const createAuction = new CreateAuction(auctionRepository);
  const createBid = new CreateBid(auctionRepository, bidRepository);
  const getAuctions = new GetAuctions(auctionRepository, bidRepository);

  const inputCreateAuction = {
    startDate: new Date("2025-03-01T10:00:00Z"),
    endDate: new Date("2025-03-01T12:00:00Z"),
    minIncrement: 10,
    startAmount: 1000,
  };
  const outputAuction = await createAuction.execute(inputCreateAuction);
  expect(outputAuction.auctionId).toBeDefined();

  const inputBid1 = {
    auctionId: outputAuction.auctionId,
    customer: "a",
    amount: 1000,
    date: new Date("2025-03-01T11:00:00Z"),
  };

  const responseCreateBid1 = await createBid.execute(inputBid1);

  expect(responseCreateBid1.bidId).toBeDefined();

  const inputBid2 = {
    auctionId: outputAuction.auctionId,
    customer: "b",
    amount: 1010,
    date: new Date("2025-03-01T11:00:00Z"),
  };

  const responseCreateBid2 = await createBid.execute(inputBid2);
  expect(responseCreateBid2.bidId).toBeDefined();

  const inputBid3 = {
    auctionId: outputAuction.auctionId,
    customer: "c",
    amount: 1100,
    date: new Date("2025-03-01T11:00:00Z"),
  };

  const responseCreateBid3 = await createBid.execute(inputBid3);
  expect(responseCreateBid2.bidId).toBeDefined();

  expect(responseCreateBid3.bidId).toBeDefined();

  connectionDatabase.close();
});
