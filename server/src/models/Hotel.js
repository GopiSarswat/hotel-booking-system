import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    city: { type: String, required: true, index: true, trim: true },
    address: { type: String, required: true },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

hotelSchema.index({ name: "text", city: "text", description: "text" });

export const Hotel = mongoose.model("Hotel", hotelSchema);

