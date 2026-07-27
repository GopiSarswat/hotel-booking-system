import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";
import { ApiError } from "../utils/ApiError.js";
import { numberOfNights, unitsAvailable, validateDateRange } from "../utils/availability.js";
import { withRoomLock } from "../utils/roomLock.js";

export async function createBooking(req, res, next) {
  try {
    const { room: roomId, checkIn, checkOut, guests } = req.body;
    const booking = await withRoomLock(roomId, async () => {
      const room = await Room.findById(roomId);
      if (!room) throw new ApiError(404, "Room type not found.");
      const { start, end } = validateDateRange(checkIn, checkOut);
      if (start < new Date(new Date().setHours(0, 0, 0, 0))) throw new ApiError(422, "Check-in cannot be in the past.");
      if (Number(guests) > room.capacity) throw new ApiError(422, `This room supports up to ${room.capacity} guests.`);
      const inventory = await unitsAvailable(room, start, end);
      if (inventory.available < 1) throw new ApiError(409, "No availability for the selected dates.");
      return Booking.create({
        user: req.user._id,
        hotel: room.hotel,
        room: room._id,
        checkIn: start,
        checkOut: end,
        guests: Number(guests),
        totalPrice: numberOfNights(start, end) * room.pricePerNight,
        status: "confirmed",
        paymentStatus: "paid",
      });
    });
    const populated = await booking.populate(["hotel", "room"]);
    res.status(201).json({ booking: populated });
  } catch (error) {
    next(error);
  }
}

export async function myBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("hotel", "name city images")
      .populate("room", "type pricePerNight")
      .sort("-createdAt");
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

export async function allBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("hotel", "name city")
      .populate("room", "type")
      .sort("-createdAt");
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "admin") query.user = req.user._id;
    const booking = await Booking.findOne(query);
    if (!booking) throw new ApiError(404, "Booking not found.");
    if (booking.status === "cancelled") throw new ApiError(409, "Booking is already cancelled.");
    if (booking.checkIn <= new Date()) throw new ApiError(409, "Started or completed stays cannot be cancelled.");
    booking.status = "cancelled";
    booking.paymentStatus = "unpaid";
    await booking.save();
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

