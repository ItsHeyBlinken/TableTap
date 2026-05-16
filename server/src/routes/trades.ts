import { Router } from "express";
import { recordTradeSchema, todayDateString } from "../utils/validation.js";
import { recordTrade } from "../services/tradeService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const body = recordTradeSchema.parse(req.body);
    const result = await recordTrade(req.user!.userId, {
      ...body,
      trade_date: body.trade_date ?? todayDateString(),
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
