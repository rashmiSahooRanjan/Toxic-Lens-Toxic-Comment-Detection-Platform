import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";
await connectDB();
const email = process.env.ADMIN_EMAIL || "admin@example.com";
const password = process.env.ADMIN_PASSWORD || "ChangeMe_123!";
const exists = await User.exists({ email });
if (exists) {
  console.log("Admin already exists");
  process.exit(0);
}
await User.create({
  name: "System Admin",
  email,
  passwordHash: await bcrypt.hash(password, 12),
  role: "admin",
});
console.log(`Admin created: ${email}`);
process.exit(0);
