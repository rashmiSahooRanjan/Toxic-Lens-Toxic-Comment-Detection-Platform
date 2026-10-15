const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export function token() {
  return localStorage.getItem("tg_token");
}
export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const r = await fetch(`${API}${path}`, { ...options, headers });
  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data.message || data.detail?.message || "Request failed");
  return data;
}
export const saveAuth = (token, user) => {
  localStorage.setItem("tg_token", token);
  localStorage.setItem("tg_user", JSON.stringify(user));
};
export const currentUser = () =>
  JSON.parse(localStorage.getItem("tg_user") || "null");
export const logout = () => {
  localStorage.removeItem("tg_token");
  localStorage.removeItem("tg_user");
};
