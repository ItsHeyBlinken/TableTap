import { Router } from "express";
import { checkoutSchema, quickSaleSchema, todayDateString } from "../utils/validation.js";
import * as cardService from "../services/cardService.js";
import * as checkoutService from "../services/checkoutService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

/** Walk-up sale: create + mark sold in one step (busy show floor). */
router.post("/quick", async (req: AuthRequest, res, next) => {
  try {
    const body = quickSaleSchema.parse(req.body);
    const card = await cardService.quickSale(req.user!.userId, {
      ...body,
      sold_date: body.sold_date ?? todayDateString(),
    });
    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", async (req: AuthRequest, res, next) => {
  try {
    const body = checkoutSchema.parse(req.body);
    const result = await checkoutService.checkout(req.user!.userId, {
      ...body,
      sold_date: body.sold_date ?? todayDateString(),
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
