import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import predictionRoutes from "./routes/predictions.js";
import adminRoutes from "./routes/admin.js";
import researchRoutes from "./routes/research.js";
import modelRoutes from "./routes/model.js";
import { errorHandler } from "./middleware/error.js";
const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  env.clientUrl ? env.clientUrl.replace(/\/+$/, "") : null,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Automatically allow all Render deployment subdomains (e.g. https://toxic-frontend.onrender.com)
      if (/^https:\/\/.*\.onrender\.com$/.test(origin)) {
        return callback(null, true);
      }

      // Allow explicitly configured origins or localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Permissive fallback
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "node-api" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/model", modelRoutes);
app.use(errorHandler);
connectDB()
  .then(() =>
    app.listen(env.port, "0.0.0.0", () =>
      console.log(`API running on http://0.0.0.0:${env.port}`),
    ),
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
