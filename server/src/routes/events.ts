import { Router } from "express";
import { eventSchema } from "../utils/validation.js";
import * as eventService from "../services/eventService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const events = await eventService.listEvents(req.user!.userId);
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const event = await eventService.getEventById(req.user!.userId, paramId(req.params.id));
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const body = eventSchema.parse(req.body);
    const event = await eventService.createEvent(req.user!.userId, body);
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: AuthRequest, res, next) => {
  try {
    const body = eventSchema.parse(req.body);
    const event = await eventService.updateEvent(req.user!.userId, paramId(req.params.id), body);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ event });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const deleted = await eventService.deleteEvent(req.user!.userId, paramId(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ message: "Event deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
