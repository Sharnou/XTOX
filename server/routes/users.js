import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, makeId } from "../lib/store.js";
import { PLATFORM_COUNTRY, JWT_SECRET } from "../lib/settings.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().optional(),
  }),
  query: z.any(),
  params: z.any(),
});

router.post("/register", (req, res) => {
  const parsed = authSchema.safeParse(req);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, full_name } = req.body;
  if (db.users.some((u) => u.email === email)) return res.status(409).json({ error: "Email exists" });
  const hash = bcrypt.hashSync(password, 10);
  const user = {
    id: makeId(),
    email,
    full_name: full_name || email.split("@")[0],
    password: hash,
    country: PLATFORM_COUNTRY,
    role: "user",
  };
  db.users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email, country: user.country, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, country: user.country } });
});

router.post("/login", (req, res) => {
  const parsed = authSchema.safeParse(req);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email);
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, country: user.country, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, country: user.country } });
});

// Simple list endpoint for front-end bootstrap
router.get("/users", (_req, res) => {
  res.json(db.users.map(({ password, ...rest }) => rest));
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.users.find((u) => u.email === req.user.email);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

export default router;
