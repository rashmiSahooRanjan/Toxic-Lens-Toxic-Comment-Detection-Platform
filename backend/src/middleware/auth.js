import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
export async function auth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer "))
      return res.status(401).json({ message: "Authentication required" });
    const p = jwt.verify(h.slice(7), env.jwtSecret);
    const u = await User.findById(p.id).select("-passwordHash");
    if (!u || !u.active)
      return res.status(401).json({ message: "Account unavailable" });
    req.user = u;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
export const roles =
  (...allowed) =>
  (req, res, next) =>
    allowed.includes(req.user.role)
      ? next()
      : res.status(403).json({ message: "Insufficient permissions" });
