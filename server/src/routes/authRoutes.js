import { Router } from "express";
import { body } from "express-validator";
import { login, logout, me, refresh, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const credentials = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must contain at least 8 characters."),
];

router.post("/register", [body("name").trim().isLength({ min: 2, max: 80 }), ...credentials], validate, register);
router.post("/login", credentials, validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;

