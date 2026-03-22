import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { countryLock } from "../middleware/countryLock.js";
import { db, makeId } from "../lib/store.js";

const router = Router();

// POST /Chat : send message
router.post("/", requireAuth, countryLock, (req, res) => {
  const { conversation, to, body, image } = req.body;
  if (!conversation || (!body && !image)) return res.status(400).json({ error: "conversation and body required" });
  const message = {
    id: makeId(),
    conversation,
    from: req.user.email,
    to,
    body,
    image,
    status: "delivered",
    created_at: new Date().toISOString(),
  };
  db.messages.push(message);
  // Notify recipient via Socket.IO if connected
  req.io?.to?.(to)?.emit("message", message);
  res.status(201).json(message);
});

// GET /Chat/:conversation : history
router.get("/:conversation", requireAuth, countryLock, (req, res) => {
  const items = db.messages.filter((m) => m.conversation === req.params.conversation);
  res.json(items);
});

export default router;
