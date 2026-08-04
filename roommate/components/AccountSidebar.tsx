"use client";

import Link from "next/link";
import { useState } from "react";

import SignOutButton from "@/components/SignOutButton";

type Props = {
  signedIn: boolean;
  isAdmin: boolean;
  verificationStatus?: "unverified" | "submitted" | "verified" | "rejected";
};

export default function AccountSidebar({ signedIn, isAdmin, verificationStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  if (!signedIn) return <Link href="/sign-in" className="account-trigger">Sign in</Link>;

  return <>
    <button className="account-trigger" type="button" onClick={() => setIsOpen(true)} aria-expanded={isOpen} aria-controls="account-sidebar">Account <span aria-hidden="true">☰</span></button>
    {isOpen && <button className="sidebar-scrim" type="button" aria-label="Close account menu" onClick={close} />}
    <aside id="account-sidebar" className={`account-sidebar ${isOpen ? "account-sidebar--open" : ""}`} aria-label="Account menu">
      <div className="account-sidebar__header"><div><p className="eyebrow">Your workspace</p><h2>Account</h2></div><button type="button" onClick={close} aria-label="Close account menu">×</button></div>
      <nav>
        <Link href="/dashboard" onClick={close}>My listings & requests</Link>
        <Link href="/inquiries" onClick={close}>Inbox</Link>
        {verificationStatus !== "verified" && <Link href="/verify" onClick={close}>Verification</Link>}
        {isAdmin && <Link href="/admin/verifications" onClick={close}>Verification reviews</Link>}
      </nav>
      <div className="account-sidebar__footer"><SignOutButton /></div>
    </aside>
  </>;
}
