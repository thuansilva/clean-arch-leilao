import { afterEach, beforeEach, expect, test } from "@jest/globals";
import axios from "axios";
import WebSocket from "ws";

axios.defaults.validateStatus = () => true;

let ws: WebSocket;
let messages: any[] = [];

beforeEach(async () => {
  ws = new WebSocket("ws://localhost:8080");
  ws.on("message", (data: any) => {
    const message = JSON.parse(data.toString());
    messages.push(message);
  });
});

test("Deve criar um leilao e dar três lances", async () => {
  const inputCreateAuction = {
    startDate: "2025-03-01T10:00:00Z",
    endDate: "2025-03-01T12:00:00Z",
    minIncrement: 10,
    startAmount: 1000,
  };
  const responseCreateAuction = await axios.post(
    "http://localhost:3000/auctions",
    inputCreateAuction
  );
  const outputAuction = responseCreateAuction.data;
  expect(outputAuction.auctionId).toBeDefined();

  const inputBid1 = {
    auctionId: outputAuction.auctionId,
    customer: "a",
    amount: 1000,
    date: "2025-03-01T11:00:00Z",
  };

  const responseCreateBid1 = await axios.post(
    "http://localhost:3000/bids",
    inputBid1
  );

  const outputCreateBid1 = responseCreateBid1.data;
  expect(outputCreateBid1.bidId).toBeDefined();

  const inputBid2 = {
    auctionId: outputAuction.auctionId,
    customer: "b",
    amount: 1010,
    date: "2025-03-01T11:00:00Z",
  };

  const responseCreateBid2 = await axios.post(
    "http://localhost:3000/bids",
    inputBid2
  );

  const outputCreateBid2 = responseCreateBid2.data;
  expect(outputCreateBid2.bidId).toBeDefined();

  const inputBid3 = {
    auctionId: outputAuction.auctionId,
    customer: "c",
    amount: 1100,
    date: "2025-03-01T11:00:00Z",
  };

  const responseCreateBid3 = await axios.post(
    "http://localhost:3000/bids",
    inputBid3
  );

  const outputCreateBid3 = responseCreateBid3.data;
  expect(outputCreateBid3.bidId).toBeDefined();

  const responseGetAuction = await axios.get(
    `http://localhost:3000/auctions/${outputAuction.auctionId}`
  );

  const outputGetAuction = responseGetAuction.data;
  // console.log("outputGetAuction", outputGetAuction);
  expect(outputGetAuction.highestBid.customer).toBe("c");
  expect(outputGetAuction.highestBid.amount).toBe("1100");

  // expect(messages).toHaveLength(3);
  // expect(messages[0].customer).toBe("a");
  // expect(messages[1].customer).toBe("b");
  // expect(messages[2].customer).toBe("c");
});

test("Nao deve dar lance fora do horario do leilao", async () => {
  const inputCreateAuction = {
    startDate: "2025-03-01T10:00:00Z",
    endDate: "2025-03-01T12:00:00Z",
    minIncrement: 10,
    startAmount: 1000,
  };
  const responseCreateAuction = await axios.post(
    "http://localhost:3000/auctions",
    inputCreateAuction
  );
  const outputAuction = responseCreateAuction.data;

  expect(outputAuction.auctionId).toBeDefined();

  const inputBid1 = {
    auctionId: outputAuction.auctionId,
    customer: "a",
    amount: 1000,
    date: "2025-03-01T17:00:00Z",
  };

  const responseCreateBid1 = await axios.post(
    "http://localhost:3000/bids",
    inputBid1
  );

  expect(responseCreateBid1.status).toBe(422);
  const outputCreateBid1 = responseCreateBid1.data;
  expect(outputCreateBid1.error).toBe("Auction is not open");
});

test("Nao deve ter lance menor que o anterior", async () => {
  const inputCreateAuction = {
    startDate: "2025-03-01T10:00:00Z",
    endDate: "2025-03-01T12:00:00Z",
    minIncrement: 10,
    startAmount: 1000,
  };

  const responseCreateAuction = await axios.post(
    "http://localhost:3000/auctions",
    inputCreateAuction
  );
  const outputAuction = responseCreateAuction.data;

  const inputBid1 = {
    auctionId: outputAuction.auctionId,
    customer: "a",
    amount: 1100,
    date: "2025-03-01T11:00:00Z",
  };

  await axios.post("http://localhost:3000/bids", inputBid1);

  const inputBid2 = {
    auctionId: outputAuction.auctionId,
    customer: "b",
    amount: 1000,
    date: "2025-03-01T11:30:00Z",
  };

  const responseCreateBid2 = await axios.post(
    "http://localhost:3000/bids",
    inputBid2
  );

  expect(responseCreateBid2.status).toBe(422);
  const outputCreateBid2 = responseCreateBid2.data;
  expect(outputCreateBid2.error).toBe(
    "Bid amount must be greater than the last bid"
  );
});

test("Nao deveter lance seguido pelo mesmo cliente", async () => {
  const inputCreateAuction = {
    startDate: "2025-03-01T10:00:00Z",
    endDate: "2025-03-01T12:00:00Z",
    minIncrement: 10,
    startAmount: 1000,
  };

  const responseCreateAuction = await axios.post(
    "http://localhost:3000/auctions",
    inputCreateAuction
  );
  const outputAuction = responseCreateAuction.data;

  const inputBid1 = {
    auctionId: outputAuction.auctionId,
    customer: "a",
    amount: 1200,
    date: "2025-03-01T11:00:00Z",
  };

  await axios.post("http://localhost:3000/bids", inputBid1);

  const inputBid2 = {
    auctionId: outputAuction.auctionId,
    customer: "a",
    amount: 1300,
    date: "2025-03-01T11:30:00Z",
  };

  const responseCreateBid2 = await axios.post(
    "http://localhost:3000/bids",
    inputBid2
  );

  expect(responseCreateBid2.status).toBe(422);
  const outputCreateBid2 = responseCreateBid2.data;
  expect(outputCreateBid2.error).toBe(
    "Auction does not accept sequencial bids from the same customer"
  );
});

afterEach(async () => {
  ws.close();
});
