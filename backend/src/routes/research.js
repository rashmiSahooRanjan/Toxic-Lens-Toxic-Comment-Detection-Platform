import { Router } from "express";
import { auth, roles } from "../middleware/auth.js";
import { batch, stats } from "../controllers/research.js";
const r = Router();
r.use(auth, roles("researcher", "admin"));
r.post("/batch", batch);
r.get("/stats", stats);
export default r;
