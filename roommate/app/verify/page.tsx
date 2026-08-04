import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import VerificationForm from "@/components/VerificationForm";
import { getCurrentUser } from "@/lib/current-user";
export default async function VerifyPage() { const user = await getCurrentUser(); if (!user) redirect("/sign-in?next=/verify"); return <><Navbar /><main className="page-shell auth-page"><Link href="/" className="back-link">← Back home</Link><p className="eyebrow">Community access</p><h1>Verify your affiliation</h1>{user.verificationStatus === "verified" ? <p className="owner-notice">You are verified as a {user.affiliationType} at {user.affiliationName}.</p> : user.verificationStatus === "submitted" ? <p className="owner-notice">Your verification is awaiting review.</p> : <VerificationForm />}</main></>; }
