import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    type: { type: String, enum: ["standard", "deluxe", "suite"], required: true },
    name: { type: String, trim: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    totalUnits: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

roomSchema.index({ hotel: 1, type: 1 }, { unique: true });

export const Room = mongoose.model("Room", roomSchema);

