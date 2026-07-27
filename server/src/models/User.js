import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatarUrl: String,
    refreshTokens: { type: [String], select: false, default: [] },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return { id: this._id, name: this.name, email: this.email, role: this.role, avatarUrl: this.avatarUrl };
};

export const User = mongoose.model("User", userSchema);

