import { Router } from "express";
import {
  cardsQuerySchema,
  createCardSchema,
  updateCardSchema,
  sellCardSchema,
  todayDateString,
} from "../utils/validation.js";
import * as cardService from "../services/cardService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const query = cardsQuerySchema.parse(req.query);
    const result = await cardService.listCards(req.user!.userId, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const card = await cardService.getCardById(req.user!.userId, paramId(req.params.id));
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const body = createCardSchema.parse(req.body);
    const card = await cardService.createCard(req.user!.userId, body);
    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: AuthRequest, res, next) => {
  try {
    const body = updateCardSchema.parse(req.body);
    const card = await cardService.updateCard(req.user!.userId, paramId(req.params.id), body);
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const deleted = await cardService.deleteCard(req.user!.userId, paramId(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json({ message: "Card deleted" });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/sell", async (req: AuthRequest, res, next) => {
  try {
    const body = sellCardSchema.parse(req.body);
    const card = await cardService.sellCard(
      req.user!.userId,
      paramId(req.params.id),
      body.sold_price,
      body.sold_date ?? todayDateString(),
      body.event_id ?? null
    );
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json({ card });
  } catch (err) {
    next(err);
  }
});

export default router;
