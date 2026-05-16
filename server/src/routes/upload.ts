import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { createStorageProvider } from "../storage/index.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const storage = createStorageProvider();

router.post("/", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }
    const result = await storage.upload(req.file);
    res.status(201).json({ url: result.url, key: result.key });
  } catch (err) {
    next(err);
  }
});

export default router;
