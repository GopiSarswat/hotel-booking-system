import { Room } from "../models/Room.js";
import { Booking } from "../models/Booking.js";
import { Hotel } from "../models/Hotel.js";
import { ApiError } from "../utils/ApiError.js";
import { unitsAvailable } from "../utils/availability.js";

export async function listRooms(req, res, next) {
  try {
    const rooms = await Room.find({ hotel: req.params.id }).sort("pricePerNight");
    if (req.query.checkIn && req.query.checkOut) {
      const enriched = await Promise.all(
        rooms.map(async (room) => ({ ...room.toObject(), ...(await unitsAvailable(room, req.query.checkIn, req.query.checkOut)) })),
      );
      return res.json({ rooms: enriched.map(({ start, end, ...room }) => room) });
    }
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req, res, next) {
  try {
    if (!(await Hotel.exists({ _id: req.body.hotel }))) throw new ApiError(404, "Hotel not found.");
    const room = await Room.create(req.body);
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(req, res, next) {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) throw new ApiError(404, "Room not found.");
    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    if (await Booking.exists({ room: req.params.id, status: { $ne: "cancelled" } })) {
      throw new ApiError(409, "Cannot delete a room type with active bookings.");
    }
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) throw new ApiError(404, "Room not found.");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

