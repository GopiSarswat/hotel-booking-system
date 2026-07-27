import { Router } from "express";
import { createRoom, deleteRoom, updateRoom } from "../controllers/roomController.js";
import { protect, roleGuard } from "../middleware/auth.js";

const router = Router();
router.use(protect, roleGuard("admin"));
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);
export default router;

