import { Router } from "express";
import { createHotel, deleteHotel, getHotel, listHotels, updateHotel } from "../controllers/hotelController.js";
import { listRooms } from "../controllers/roomController.js";
import { createReview, listReviews } from "../controllers/reviewController.js";
import { protect, roleGuard } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();
router.get("/", listHotels);
router.get("/:id", getHotel);
router.get("/:id/rooms", listRooms);
router.get("/:id/reviews", listReviews);
router.post("/:id/reviews", protect, createReview);
router.post("/", protect, roleGuard("admin"), upload.array("images", 6), createHotel);
router.put("/:id", protect, roleGuard("admin"), upload.array("images", 6), updateHotel);
router.delete("/:id", protect, roleGuard("admin"), deleteHotel);
export default router;

