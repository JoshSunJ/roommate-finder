import Link from "next/link";

import SignOutButton from "@/components/SignOutButton";

type Props = {
  signedIn: boolean;
  isAdmin: boolean;
  verificationStatus?: "unverified" | "submitted" | "verified" | "rejected";
};

export default function AccountSidebar({ signedIn, isAdmin, verificationStatus }: Props) {
  if (!signedIn) return <Link href="/sign-in" className="account-trigger">Sign in</Link>;

  return <div className="account-sidebar-wrap">
    <button className="account-trigger" type="button" aria-haspopup="true">Workspace <span className="workspace-bars" aria-hidden="true">☰</span></button>
    <aside className="account-sidebar" aria-label="Workspace menu">
      <div className="account-sidebar__header"><div><p className="eyebrow">Your workspace</p><h2>Account</h2></div></div>
      <nav>
        <Link href="/dashboard">My listings & requests</Link>
        <Link href="/inquiries">Inbox</Link>
        {verificationStatus !== "verified" && <Link href="/verify">Verification</Link>}
        {isAdmin && <Link href="/admin/verifications">Verification reviews</Link>}
        {isAdmin && <Link href="/admin/reports">Moderation reports</Link>}
      </nav>
      <div className="account-sidebar__footer"><SignOutButton /></div>
    </aside>
  </div>;
}
