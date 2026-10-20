import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import cardsRoutes from "./routes/cards.js";
import dashboardRoutes from "./routes/dashboard.js";
import eventsRoutes from "./routes/events.js";
import salesRoutes from "./routes/sales.js";
import tradesRoutes from "./routes/trades.js";
import uploadRoutes from "./routes/upload.js";
import reportRoutes from "./routes/reports.js";

const app = express();

// Coolify/Traefik: one reverse-proxy hop. Without this, req.ip is the proxy and
// X-Forwarded-For is ignored — or worse, keys become unstable across hops.
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    // So browsers/devtools can read remaining/retry after failed login attempts.
    exposedHeaders: ["RateLimit", "RateLimit-Policy", "Retry-After"],
  })
);
app.use(express.json());
app.use(cookieParser());

const uploadsPath = path.resolve(config.localUploadDir);
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/trades", tradesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports/sales", reportRoutes);

if (config.isProduction) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
