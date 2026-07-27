import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
    callback(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, callback) =>
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

