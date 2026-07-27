import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.accessSecret, { expiresIn: "15m" });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString(), type: "refresh" }, env.refreshSecret, { expiresIn: "7d" });

export const verifyAccessToken = (token) => jwt.verify(token, env.accessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshSecret);

