import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    target: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
export default mongoose.model("AuditLog", schema);
