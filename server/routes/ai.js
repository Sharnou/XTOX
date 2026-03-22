import { Router } from "express";
import { PLATFORM_COUNTRY } from "../lib/settings.js";

const router = Router();

// Simple translation stub (mirror text with language tag)
router.post("/translate", (req, res) => {
  const { title = "", description = "", target_lang = "ar" } = req.body || {};
  const prefix = target_lang === "ar" ? "ترجمة" : "Translated";
  res.json({
    translated_title: title ? `${prefix}: ${title}` : "",
    translated_description: description ? `${prefix}: ${description}` : "",
  });
});

// Basic moderation stub: approve unless contains banned words
router.post("/moderate", (req, res) => {
  const { title = "", description = "" } = req.body || {};
  const banned = ["scam", "fake"];
  const flagged = banned.some((w) => (title + description).toLowerCase().includes(w));
  res.json({
    approved: !flagged,
    reason: flagged ? "Contains banned phrasing" : "",
    country: PLATFORM_COUNTRY,
  });
});

export default router;
