export function accountDisplayName(user: { username?: string | null; email?: string | null }) {
  const candidate = (user.username ?? "").trim() || (user.email ?? "").trim();
  return candidate ? candidate.split("@")[0] : "";
}
