import test from "node:test";
import assert from "node:assert/strict";
import { checkMessage, addReport } from "../src/moderation.js";

test("blocks unsafe message categories", () => {
  assert.equal(checkMessage("hello").ok, true);
  assert.equal(checkMessage("visit https://example.com").ok, false);
  assert.equal(checkMessage("send me nudes").ok, false);
  assert.equal(checkMessage("I am 16yo").ok, false);
});

test("counts distinct reporters rather than duplicate reports", () => {
  const target = "moderation-test-target";
  const first = addReport({
    reporterHash: "reporter-a",
    reportedHash: target,
    reason: "other",
    snapshot: [],
  });
  const duplicate = addReport({
    reporterHash: "reporter-a",
    reportedHash: target,
    reason: "other",
    snapshot: [],
  });

  assert.equal(first.reporters, 1);
  assert.equal(duplicate.reporters, 1);
});
