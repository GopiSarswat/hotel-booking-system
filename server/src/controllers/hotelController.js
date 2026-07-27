import mongoose from "mongoose";
import { Hotel } from "../models/Hotel.js";
import { Room } from "../models/Room.js";
import { Booking } from "../models/Booking.js";
import { ApiError } from "../utils/ApiError.js";
import { validateDateRange } from "../utils/availability.js";

const imagePaths = (req) => req.files?.map((file) => `/uploads/${file.filename}`);

export async function listHotels(req, res, next) {
  try {
    const { city, search, minPrice, maxPrice, amenities, rating, guests, checkIn, checkOut } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 9));
    const hotelMatch = {};
    if (city) hotelMatch.city = new RegExp(city, "i");
    if (search) hotelMatch.$text = { $search: search };
    if (rating) hotelMatch.avgRating = { $gte: Number(rating) };
    if (amenities) hotelMatch.amenities = { $all: amenities.split(",").filter(Boolean) };

    const roomMatch = {};
    if (minPrice || maxPrice) {
      roomMatch.pricePerNight = {};
      if (minPrice) roomMatch.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) roomMatch.pricePerNight.$lte = Number(maxPrice);
    }
    if (guests) roomMatch.capacity = { $gte: Number(guests) };

    let unavailableRoomIds = [];
    if (checkIn && checkOut) {
      const { start, end } = validateDateRange(checkIn, checkOut);
      const booked = await Booking.aggregate([
        { $match: { status: { $ne: "cancelled" }, checkIn: { $lt: end }, checkOut: { $gt: start } } },
        { $group: { _id: "$room", count: { $sum: 1 } } },
        { $lookup: { from: "rooms", localField: "_id", foreignField: "_id", as: "room" } },
        { $unwind: "$room" },
        { $match: { $expr: { $gte: ["$count", "$room.totalUnits"] } } },
      ]);
      unavailableRoomIds = booked.map((entry) => entry._id);
    }
    if (unavailableRoomIds.length) roomMatch._id = { $nin: unavailableRoomIds };

    const roomFilterRequired = Object.keys(roomMatch).length > 0;
    const pipeline = [
      { $match: hotelMatch },
      { $lookup: { from: "rooms", localField: "_id", foreignField: "hotel", as: "rooms" } },
      ...(roomFilterRequired ? [{ $match: { rooms: { $elemMatch: roomMatch } } }] : []),
      { $addFields: { startingPrice: { $min: "$rooms.pricePerNight" } } },
      { $project: { rooms: 0 } },
      { $sort: { avgRating: -1, createdAt: -1 } },
      { $facet: { data: [{ $skip: (page - 1) * limit }, { $limit: limit }], meta: [{ $count: "total" }] } },
    ];
    const [{ data, meta }] = await Hotel.aggregate(pipeline);
    const total = meta[0]?.total || 0;
    res.json({ hotels: data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
}

export async function getHotel(req, res, next) {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) throw new ApiError(404, "Hotel not found.");
    const rooms = await Room.find({ hotel: hotel._id }).sort("pricePerNight");
    res.json({ hotel, rooms });
  } catch (error) {
    next(error);
  }
}

export async function createHotel(req, res, next) {
  try {
    const images = imagePaths(req) || req.body.images || [];
    const hotel = await Hotel.create({ ...req.body, images, createdBy: req.user._id });
    res.status(201).json({ hotel });
  } catch (error) {
    next(error);
  }
}

export async function updateHotel(req, res, next) {
  try {
    const updates = { ...req.body };
    if (req.files?.length) updates.images = imagePaths(req);
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!hotel) throw new ApiError(404, "Hotel not found.");
    res.json({ hotel });
  } catch (error) {
    next(error);
  }
}

export async function deleteHotel(req, res, next) {
  try {
    const hotelId = new mongoose.Types.ObjectId(req.params.id);
    if (await Booking.exists({ hotel: hotelId, status: { $ne: "cancelled" } })) {
      throw new ApiError(409, "Cannot delete a hotel with active bookings.");
    }
    const hotel = await Hotel.findByIdAndDelete(hotelId);
    if (!hotel) throw new ApiError(404, "Hotel not found.");
    await Room.deleteMany({ hotel: hotelId });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

