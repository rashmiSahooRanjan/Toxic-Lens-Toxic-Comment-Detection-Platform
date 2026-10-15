import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createPrediction, history } from "../controllers/predictions.js";
const r = Router();
r.post("/", auth, createPrediction);
r.get("/history", auth, history);
export default r;
