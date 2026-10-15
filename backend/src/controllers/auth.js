import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signUser } from "../utils/jwt.js";
export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8)
    return res
      .status(400)
      .json({ message: "Name, email and password (8+ chars) are required" });
  if (await User.exists({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "Email already registered" });
  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "user",
  });
  res
    .status(201)
    .json({
      token: signUser(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
}
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (
    !user ||
    !user.active ||
    !(await bcrypt.compare(password || "", user.passwordHash))
  )
    return res.status(401).json({ message: "Invalid credentials" });
  user.lastLogin = new Date();
  await user.save();
  res.json({
    token: signUser(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
export async function me(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      active: req.user.active,
    },
  });
}
