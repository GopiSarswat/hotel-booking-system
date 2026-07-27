import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/tokens.js";

export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new ApiError(401, "Authentication required.");
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, "User no longer exists.");
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, "Invalid or expired access token."));
  }
}

export const roleGuard = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new ApiError(403, "You do not have permission."));

