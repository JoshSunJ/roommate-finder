import type { CurrentUser } from "@/lib/current-user";

export function isAdmin(user: CurrentUser | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  return Boolean(adminEmail && user?.email.toLowerCase() === adminEmail);
}
