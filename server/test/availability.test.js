import test from "node:test";
import assert from "node:assert/strict";
import { numberOfNights, overlapQuery, rangesOverlap, validateDateRange } from "../src/utils/availability.js";

test("overlapping ranges are detected using half-open boundaries", () => {
  assert.equal(rangesOverlap("2027-01-10", "2027-01-15", "2027-01-12", "2027-01-17"), true);
  assert.equal(rangesOverlap("2027-01-10", "2027-01-20", "2027-01-12", "2027-01-17"), true);
  assert.equal(rangesOverlap("2027-01-12", "2027-01-17", "2027-01-10", "2027-01-20"), true);
});

test("same-day checkout/check-in does not overlap", () => {
  assert.equal(rangesOverlap("2027-01-10", "2027-01-15", "2027-01-15", "2027-01-18"), false);
  assert.equal(rangesOverlap("2027-01-15", "2027-01-18", "2027-01-10", "2027-01-15"), false);
});

test("database overlap query excludes cancelled bookings", () => {
  const query = overlapQuery("room-id", new Date("2027-02-01"), new Date("2027-02-04"));
  assert.deepEqual(query.status, { $ne: "cancelled" });
  assert.deepEqual(query.checkIn, { $lt: new Date("2027-02-04") });
  assert.deepEqual(query.checkOut, { $gt: new Date("2027-02-01") });
});

test("date validation and nightly pricing use calendar-day intervals", () => {
  assert.equal(numberOfNights("2027-03-01", "2027-03-04"), 3);
  assert.throws(() => validateDateRange("2027-03-04", "2027-03-04"), /Check-out must be after/);
  assert.throws(() => validateDateRange("bad", "2027-03-04"), /Check-out must be after/);
});

