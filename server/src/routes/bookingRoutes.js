import { Router } from "express";
import { allBookings, cancelBooking, createBooking, myBookings } from "../controllers/bookingController.js";
import { protect, roleGuard } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();
router.use(protect);
router.post(
  "/",
  [
    body("room").isMongoId(),
    body("checkIn").isISO8601(),
    body("checkOut").isISO8601(),
    body("guests").isInt({ min: 1, max: 20 }).toInt(),
  ],
  validate,
  createBooking,
);
router.get("/me", myBookings);
router.get("/", roleGuard("admin"), allBookings);
router.patch("/:id/cancel", cancelBooking);
export default router;
