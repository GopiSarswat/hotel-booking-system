import { Booking } from "../models/Booking.js";
import { Hotel } from "../models/Hotel.js";
import { Room } from "../models/Room.js";

export async function stats(_req, res, next) {
  try {
    const now = new Date();
    const [bookingStats, topHotels, totalUnits] = await Promise.all([
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalBookings: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0] } } } },
      ]),
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: "$hotel", bookings: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "hotels", localField: "_id", foreignField: "_id", as: "hotel" } },
        { $unwind: "$hotel" },
        { $project: { name: "$hotel.name", bookings: 1, revenue: 1 } },
      ]),
      Room.aggregate([{ $group: { _id: null, units: { $sum: "$totalUnits" } } }]),
    ]);
    const occupiedNow = await Booking.countDocuments({
      status: { $ne: "cancelled" },
      checkIn: { $lte: now },
      checkOut: { $gt: now },
    });
    const units = totalUnits[0]?.units || 0;
    res.json({
      totalBookings: bookingStats[0]?.totalBookings || 0,
      revenue: bookingStats[0]?.revenue || 0,
      occupancy: units ? Math.round((occupiedNow / units) * 1000) / 10 : 0,
      totalHotels: await Hotel.countDocuments(),
      topHotels,
    });
  } catch (error) {
    next(error);
  }
}

