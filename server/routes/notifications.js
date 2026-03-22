import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { countryLock } from "../middleware/countryLock.js";
import { db, makeId } from "../lib/store.js";

const router = Router();

router.get("/", requireAuth, countryLock, (req, res) => {
  const limit = Number(req.query.limit || 20);
  const list = db.notifications
    .filter((n) => n.user_email === req.user.email)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
  res.json(list);
});

router.post("/", requireAuth, countryLock, (req, res) => {
  const { title, message, type } = req.body;
  const notification = {
    id: makeId(),
    title: title || "Update",
    message: message || "",
    type: type || "info",
    user_email: req.user.email,
    created_at: new Date().toISOString(),
    read: false,
  };
  db.notifications.push(notification);
  res.status(201).json(notification);
});

export default router;
