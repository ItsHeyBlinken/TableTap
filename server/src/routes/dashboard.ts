import { Router } from "express";
import { getDashboard } from "../services/dashboardService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { dashboardQuerySchema, dateInTimeZone } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const query = dashboardQuerySchema.parse(req.query);
    const today = query.date ?? dateInTimeZone(query.time_zone!);
    const stats = await getDashboard(req.user!.userId, today);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
