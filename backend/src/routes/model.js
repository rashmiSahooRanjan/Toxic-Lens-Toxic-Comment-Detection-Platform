import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { mlHealth, mlInfo } from "../utils/ml.js";
const r = Router();
r.get("/health", async (req, res) => res.json(await mlHealth()));
r.get("/info", auth, async (req, res) => res.json(await mlInfo()));
export default r;
