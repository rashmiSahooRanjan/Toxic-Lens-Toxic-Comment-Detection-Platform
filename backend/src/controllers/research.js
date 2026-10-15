import { predictBatch } from "../utils/ml.js";
import Prediction from "../models/Prediction.js";
export async function batch(req, res) {
  const { texts, threshold = 0.5 } = req.body;
  if (!Array.isArray(texts) || !texts.length || texts.length > 500)
    return res.status(400).json({ message: "Provide 1–500 comments" });
  const data = await predictBatch(texts, Number(threshold));
  const docs = data.results.map((r) => ({
    ...r,
    user: req.user._id,
    threshold: Number(threshold),
    probabilities: r.probabilities,
    source: "batch",
  }));
  await Prediction.insertMany(docs);
  res.json(data);
}
export async function stats(req, res) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 6);

  const [labels, totals, classification, activeUsers, dailyRows, comments] =
    await Promise.all([
      Prediction.aggregate([
        { $unwind: "$labels" },
        { $group: { _id: "$labels", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Prediction.countDocuments(),
      Prediction.aggregate([
        {
          $group: {
            _id: "$isToxic",
            count: { $sum: 1 },
          },
        },
      ]),
      Prediction.distinct("user", { user: { $exists: true, $ne: null } }),
      Prediction.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" },
            },
            users: { $addToSet: "$user" },
            toxic: { $sum: { $cond: ["$isToxic", 1, 0] } },
            nonToxic: { $sum: { $cond: ["$isToxic", 0, 1] } },
          },
        },
      ]),
      Prediction.find({}, { text: 1 })
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean(),
    ]);

  const toxic = classification.find((row) => row._id === true)?.count || 0;
  const nonToxic = classification.find((row) => row._id !== true)?.count || 0;
  const dailyByDate = new Map(dailyRows.map((row) => [row._id, row]));
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    const row = dailyByDate.get(key);
    return {
      date: key,
      users: row?.users.filter(Boolean).length || 0,
      toxic: row?.toxic || 0,
      nonToxic: row?.nonToxic || 0,
    };
  });
  const stopWords = new Set([
    "about", "after", "again", "against", "also", "because", "been", "before",
    "being", "between", "could", "does", "doing", "during", "each", "from",
    "have", "having", "here", "into", "just", "more", "most", "other", "over",
    "same", "should", "some", "such", "than", "that", "their", "them", "then",
    "there", "these", "they", "this", "those", "through", "under", "very",
    "were", "what", "when", "where", "which", "while", "with", "would", "your",
    "and", "are", "but", "for", "not", "the", "you",
  ]);
  const wordCounts = new Map();
  for (const { text } of comments) {
    for (const word of text.toLowerCase().match(/[a-z][a-z']{2,}/g) || []) {
      if (!stopWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
  }
  const words = [...wordCounts]
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value || a.text.localeCompare(b.text))
    .slice(0, 40);

  res.json({
    totals,
    labels,
    dataset: {
      total: totals,
      toxic,
      nonToxic,
      uniqueUsers: activeUsers.length,
      toxicPercent: totals ? Math.round((toxic / totals) * 100) : 0,
    },
    daily,
    words,
    wordSampleSize: comments.length,
  });
}
