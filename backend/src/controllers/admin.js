import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import Prediction from "../models/Prediction.js";
import { mlHealth, mlInfo } from "../utils/ml.js";
export async function users(req, res) {
  res.json(await User.find().select("-passwordHash").sort({ createdAt: -1 }));
}
export async function role(req, res) {
  const { role } = req.body;
  if (!["user", "researcher", "admin"].includes(role))
    return res.status(400).json({ message: "Invalid role" });
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
  ).select("-passwordHash");
  await AuditLog.create({
    actor: req.user._id,
    action: "ROLE_CHANGED",
    target: req.params.id,
    meta: { role },
  });
  res.json(u);
}
export async function status(req, res) {
  const u = await User.findByIdAndUpdate(
    req.params.id,
    { active: Boolean(req.body.active) },
    { new: true },
  ).select("-passwordHash");
  if (!u) return res.status(404).json({ message: "User not found" });
  await AuditLog.create({
    actor: req.user._id,
    action: "STATUS_CHANGED",
    target: req.params.id,
    meta: { active: u.active },
  });
  res.json(u);
}
export async function audit(req, res) {
  res.json(
    await AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(200),
  );
}
export async function dashboard(req, res) {
  const [usersCount, predictionsCount, health, info] = await Promise.all([
    User.countDocuments(),
    Prediction.countDocuments(),
    mlHealth().catch((e) => ({ status: "down", error: e.message })),
    mlInfo().catch((e) => ({ error: e.message })),
  ]);
  res.json({ usersCount, predictionsCount, ml: health, model: info });
}
export async function seedAdmin(req, res) {
  const email = process.env.ADMIN_EMAIL,
    password = process.env.ADMIN_PASSWORD;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Set ADMIN_EMAIL and ADMIN_PASSWORD" });
  if (await User.exists({ email }))
    return res.status(409).json({ message: "Admin exists" });
  const u = await User.create({
    name: "System Admin",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
  });
  res.status(201).json({ id: u._id, email: u.email, role: u.role });
}
