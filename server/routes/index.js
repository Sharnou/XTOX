import adsRouter from "./ads.js";
import usersRouter from "./users.js";
import chatRouter from "./chat.js";
import reviewsRouter from "./reviews.js";
import notificationsRouter from "./notifications.js";
import favoritesRouter from "./favorites.js";
import aiRouter from "./ai.js";

export function attachRoutes(app, io) {
  app.use((req, _res, next) => {
    req.io = io;
    next();
  });
  app.use("/api/ads", adsRouter);
  app.use("/api/auth", usersRouter);
  app.use("/api/Chat", chatRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/favorites", favoritesRouter);
  app.use("/api/ai", aiRouter);
}
