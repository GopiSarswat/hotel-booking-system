import { Booking } from "../models/Booking.js";
import { Hotel } from "../models/Hotel.js";
import { Review } from "../models/Review.js";
import { ApiError } from "../utils/ApiError.js";

export async function listReviews(req, res, next) {
  try {
    const reviews = await Review.find({ hotel: req.params.id }).populate("user", "name avatarUrl").sort("-createdAt");
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const booking = await Booking.findOne({
      _id: req.body.booking,
      user: req.user._id,
      hotel: req.params.id,
      status: "confirmed",
      checkOut: { $lte: new Date() },
    });
    if (!booking) throw new ApiError(403, "Only guests with a completed stay can review this hotel.");
    const review = await Review.create({
      user: req.user._id,
      hotel: req.params.id,
      booking: booking._id,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    const [stats] = await Review.aggregate([
      { $match: { hotel: booking.hotel } },
      { $group: { _id: "$hotel", avgRating: { $avg: "$rating" }, numReviews: { $sum: 1 } } },
    ]);
    await Hotel.findByIdAndUpdate(booking.hotel, {
      avgRating: Math.round(stats.avgRating * 10) / 10,
      numReviews: stats.numReviews,
    });
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
}

