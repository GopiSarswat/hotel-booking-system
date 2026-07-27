import { Router } from "express";
import { stats } from "../controllers/adminController.js";
import { protect, roleGuard } from "../middleware/auth.js";

const router = Router();
router.use(protect, roleGuard("admin"));
router.get("/stats", stats);
export default router;

