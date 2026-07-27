import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "confirmed" },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "paid" },
  },
  { timestamps: true },
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);

