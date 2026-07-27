import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), await bcrypt.hash(refreshToken, 8)];
  await user.save();
  res.cookie("refreshToken", refreshToken, cookieOptions);
  return { accessToken, user: user.toSafeObject() };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, "Email is already registered.");
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
    const freshUser = await User.findById(user._id).select("+refreshTokens");
    res.status(201).json(await issueTokens(freshUser, res));
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+passwordHash +refreshTokens");
    if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, "Invalid email or password.");
    res.json(await issueTokens(user, res));
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new ApiError(401, "Refresh token missing.");
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub).select("+refreshTokens");
    const matches = user && (await Promise.all(user.refreshTokens.map((hash) => bcrypt.compare(token, hash)))).some(Boolean);
    if (!matches) throw new ApiError(401, "Refresh token is invalid.");
    res.json(await issueTokens(user, res));
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Refresh token is invalid or expired."));
  }
}

export async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await User.findById(payload.sub).select("+refreshTokens");
      if (user) {
        const comparisons = await Promise.all(user.refreshTokens.map((hash) => bcrypt.compare(token, hash)));
        user.refreshTokens = user.refreshTokens.filter((_hash, index) => !comparisons[index]);
        await user.save();
      }
    } catch {
      // Always clear an invalid cookie.
    }
  }
  res.clearCookie("refreshToken", cookieOptions);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

