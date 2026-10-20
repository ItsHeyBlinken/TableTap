import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../utils/validation.js";
import * as authService from "../services/authService.js";
import { setAuthCookie, clearAuthCookie } from "../middleware/auth.js";
import { config } from "../config.js";
import type { JwtPayload } from "../types/index.js";

const router = Router();

const rateLimitMessage = { error: "Too many attempts. Try again in a few minutes." };

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitMessage,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitMessage,
});

router.post("/register", registerLimiter, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await authService.registerUser(body.email, body.password);
    setAuthCookie(res, { userId: user.id, email: user.email });
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await authService.loginUser(body.email, body.password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    setAuthCookie(res, { userId: user.id, email: user.email });
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies[config.cookieName];
    if (!token) {
      res.json({ user: null });
      return;
    }
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      res.json({ user: null });
      return;
    }
    const user = await authService.getUserById(payload.userId);
    if (!user) {
      res.json({ user: null });
      return;
    }
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

export default router;
