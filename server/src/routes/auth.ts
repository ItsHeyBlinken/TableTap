import { Router } from "express";
import { registerSchema, loginSchema } from "../utils/validation.js";
import * as authService from "../services/authService.js";
import { requireAuth, setAuthCookie, clearAuthCookie, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await authService.registerUser(body.email, body.password);
    setAuthCookie(res, { userId: user.id, email: user.email });
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
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

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
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
