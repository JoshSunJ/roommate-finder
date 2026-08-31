export function normalizeEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@").at(-1) ?? "";
}

export function maskEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");
  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"•".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}
