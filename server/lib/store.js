import crypto from "crypto";
import { PLATFORM_COUNTRY } from "./settings.js";

const uuid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

export const db = {
  users: [
    { id: uuid(), email: "demo@xtox.app", full_name: "Demo Seller", password: null, country: PLATFORM_COUNTRY, role: "user" },
    { id: uuid(), email: "admin@xtox.app", full_name: "Super Admin", password: null, country: PLATFORM_COUNTRY, role: "admin" },
  ],
  ads: [],
  favorites: [],
  messages: [],
  notifications: [],
  seller_reviews: [],
  admin_chats: [],
};

export function seedDemoAds() {
  if (db.ads.length) return;
  db.ads.push(
    {
      id: uuid(),
      title: "iPhone 15 Pro Max 256GB",
      description: "Lightly used, great condition.",
      price: 1199,
      currency: "USD",
      category: "electronics",
      images: ["https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800"],
      location: "Cairo",
      country: PLATFORM_COUNTRY,
      seller_id: db.users[0].id,
      created_by: db.users[0].email,
      status: "active",
      created_at: new Date().toISOString(),
    }
  );
}

seedDemoAds();

export const makeId = uuid;
