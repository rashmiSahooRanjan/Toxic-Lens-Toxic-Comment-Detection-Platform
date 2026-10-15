import { env } from "../config/env.js";
async function call(path, body) {
  const r = await fetch(`${env.mlUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({ message: "Invalid ML response" }));
  if (!r.ok)
    throw new Error(data.detail?.message || data.message || "ML service error");
  return data;
}
export const predict = (text, threshold) =>
  call("/predict", { text, threshold });
export const predictBatch = (texts, threshold) =>
  call("/predict-batch", { texts, threshold });
export async function mlHealth() {
  const r = await fetch(`${env.mlUrl}/health`);
  return r.json();
}
export async function mlInfo() {
  const r = await fetch(`${env.mlUrl}/model-info`);
  return r.json();
}
