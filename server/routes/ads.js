import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { countryLock } from "../middleware/countryLock.js";
import { validate } from "../middleware/validate.js";
import { db, makeId } from "../lib/store.js";
import { PLATFORM_COUNTRY } from "../lib/settings.js";

const router = Router();

const createSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    currency: z.string().optional(),
    category: z.string(),
    images: z.array(z.string()).optional(),
    location: z.string().optional(),
    country: z.string().optional(),
    status: z.string().optional(),
  }),
  query: z.any(),
  params: z.any(),
});

router.get("/", (req, res) => {
  const { status, category } = req.query;
  const list = db.ads.filter(
    (ad) =>
      ad.country === PLATFORM_COUNTRY &&
      (!status || ad.status === status) &&
      (!category || ad.category === category)
  );
  res.json(list);
});

router.post("/", requireAuth, countryLock, validate(createSchema), (req, res) => {
  const { body } = req;
  const ad = {
    id: makeId(),
    ...body,
    price: body.price ?? 0,
    currency: body.currency || "USD",
    country: PLATFORM_COUNTRY,
    status: body.status || "active",
    created_by: req.user.email,
    seller_id: req.user.id,
    created_at: new Date().toISOString(),
  };
  db.ads.push(ad);
  res.status(201).json(ad);
});

router.get("/:id", (req, res) => {
  const ad = db.ads.find((a) => a.id === req.params.id && a.country === PLATFORM_COUNTRY);
  if (!ad) return res.status(404).json({ error: "Not found" });
  res.json(ad);
});

router.patch("/:id", requireAuth, countryLock, (req, res) => {
  const ad = db.ads.find((a) => a.id === req.params.id);
  if (!ad) return res.status(404).json({ error: "Not found" });
  if (ad.created_by !== req.user.email && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  Object.assign(ad, req.body || {});
  res.json(ad);
});

router.delete("/:id", requireAuth, countryLock, (req, res) => {
  const ad = db.ads.find((a) => a.id === req.params.id);
  if (!ad) return res.status(404).json({ error: "Not found" });
  if (ad.created_by !== req.user.email && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  ad.status = "deleted";
  res.json({ ok: true });
});

export default router;
