import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient as createRedisClient } from "ioredis";
import rateLimit from "express-rate-limit";
import { connectMongo } from "./lib/mongo.js";
import { attachRoutes } from "./routes/index.js";
import { PLATFORM_COUNTRY } from "./lib/settings.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
const server = http.createServer(app);

// Redis + Socket.IO (optional, degrades gracefully if Redis missing)
let io;
try {
  const redisUrl = process.env.REDIS_URL || "";
  const pubClient = redisUrl ? new createRedisClient(redisUrl) : null;
  const subClient = pubClient ? pubClient.duplicate() : null;
  io = new SocketIOServer(server, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
  });
  if (pubClient && subClient) {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("[server] Socket.IO using Redis adapter");
  } else {
    console.log("[server] Socket.IO running without Redis adapter");
  }
} catch (err) {
  console.warn("[server] Failed to init Redis adapter, continuing without it", err.message);
}

// Global middleware
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, country: PLATFORM_COUNTRY, ts: Date.now() });
});

// Attach API routes
attachRoutes(app, io);

// Start server and DB
async function start() {
  await connectMongo();
  server.listen(PORT, () => {
    console.log(`[server] API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] Fatal startup error", err);
  process.exit(1);
});
