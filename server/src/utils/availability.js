import { Booking } from "../models/Booking.js";
import { ApiError } from "./ApiError.js";

export function validateDateRange(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || start >= end) {
    throw new ApiError(422, "Check-out must be after check-in.");
  }
  return { start, end };
}

export function overlapQuery(roomId, checkIn, checkOut) {
  return {
    room: roomId,
    status: { $ne: "cancelled" },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
}

export const rangesOverlap = (existingStart, existingEnd, requestedStart, requestedEnd) =>
  new Date(existingStart) < new Date(requestedEnd) && new Date(existingEnd) > new Date(requestedStart);

export async function unitsAvailable(room, checkIn, checkOut, session) {
  const { start, end } = validateDateRange(checkIn, checkOut);
  const unitsBooked = await Booking.countDocuments(overlapQuery(room._id, start, end)).session(session || null);
  return { available: Math.max(0, room.totalUnits - unitsBooked), unitsBooked, start, end };
}

export const numberOfNights = (checkIn, checkOut) =>
  Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000);

