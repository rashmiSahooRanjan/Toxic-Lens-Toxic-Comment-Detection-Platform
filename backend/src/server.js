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
app.use(cors({ origin: env.clientUrl }));
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
    app.listen(env.port, () =>
      console.log(`API running on http://localhost:${env.port}`),
    ),
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
