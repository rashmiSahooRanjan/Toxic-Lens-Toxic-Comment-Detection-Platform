import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function signUser(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: "7d",
  });
}
