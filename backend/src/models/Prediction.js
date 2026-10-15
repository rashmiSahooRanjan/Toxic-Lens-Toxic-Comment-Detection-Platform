import mongoose from "mongoose";
const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true, maxlength: 10000 },
    threshold: Number,
    probabilities: { type: Map, of: Number },
    labels: [String],
    isToxic: Boolean,
    riskLevel: String,
    maxScore: Number,
    source: { type: String, enum: ["single", "batch"], default: "single" },
  },
  { timestamps: true },
);
export default mongoose.model("Prediction", predictionSchema);
