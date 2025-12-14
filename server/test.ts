
import assert from "node:assert";
import test from "node:test";
import { POST } from "./routes";

const port = process.env.PORT || 9003;
const url = `http://localhost:${port}`;

test("End-to-End Test", async (t) => {
  await t.test("should return a 404 for an unknown route", async () => {
    const response = await fetch(`${url}/unknown`);
    assert.strictEqual(response.status, 404);
  });

  await t.test("should create a new receipt", async () => {
    const response = await fetch(`${url}/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test", total: 100 }),
    });
    assert.strictEqual(response.status, 200);
    const receipt = await response.json();
    assert.strictEqual(receipt.name, "test");
    assert.strictEqual(receipt.total, 100);
  });

  await t.test("should get all receipts", async () => {
    const response = await fetch(`${url}/receipts`);
    assert.strictEqual(response.status, 200);
    const receipts = await response.json();
    assert.ok(receipts.length > 0);
  });
});
