import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

export default async function Navbar() {
  const currentUser = await getCurrentUser();

  return (
    <nav className="navbar">
      <Link href="/" className="brand" aria-label="Roommate Finder home">
        <span className="brand-mark">RF</span>
        <span>Roommate Finder</span>
      </Link>
      <div className="nav-links">
        {currentUser ? <Link href="/dashboard">My listings</Link> : <Link href="/sign-in">Sign in</Link>}
        {currentUser && <Link href="/inquiries">Inbox</Link>}
        {currentUser && currentUser.verificationStatus !== "verified" && <Link href="/verify">Verify account</Link>}
        {isAdmin(currentUser) && <Link href="/admin/verifications">Reviews</Link>}
        <Link href="/requests">Housing requests</Link>
        <Link href="/map">Area guide</Link>
        {currentUser ? (
          <>
            <SignOutButton />
            <Link className="nav-cta" href="/listings/new">Post a listing <span aria-hidden="true">↗</span></Link>
          </>
        ) : (
          <Link className="nav-cta" href="/sign-up">Create account <span aria-hidden="true">↗</span></Link>
        )}
      </div>
    </nav>
  );
}
