import jwt from "jsonwebtoken";
import { JWT_SECRET, PLATFORM_COUNTRY } from "../lib/settings.js";

// Lightweight auth: accepts Bearer JWT, otherwise falls back to demo user for local dev.
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // ignore and fall through to demo user
    }
  }

  if (!req.user) {
    req.user = { id: "demo", email: "demo@xtox.app", country: PLATFORM_COUNTRY, role: "user" };
  }
  next();
}
