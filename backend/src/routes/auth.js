import { Router } from "express";
import { register, login, me } from "../controllers/auth.js";
import { auth } from "../middleware/auth.js";
const r = Router();
r.post("/register", register);
r.post("/login", login);
r.get("/me", auth, me);
export default r;
