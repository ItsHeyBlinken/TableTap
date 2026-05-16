import { Router } from "express";
import { getDashboard } from "../services/dashboardService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const stats = await getDashboard(req.user!.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
