import Link from "next/link";
import AccountSidebar from "@/components/AccountSidebar";
import { getUnreadConversationCount } from "@/features/conversations/service";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

export default async function Navbar() {
  const currentUser = await getCurrentUser();
  const unreadConversationCount = currentUser
    ? await getUnreadConversationCount(currentUser.id)
    : 0;

  return (
    <nav className="navbar">
      <Link href="/" className="brand" aria-label="unitern home">
        <span className="brand-mark" aria-hidden="true">u</span>
        <span>unitern</span>
      </Link>
      <div className="nav-links">
        <div className="nav-primary">
          <Link href="/#listings">Explore homes</Link>
          <Link href="/requests">Housing requests</Link>
          <Link href="/map">Area guide</Link>
        </div>
        <div className="nav-account">
        <AccountSidebar signedIn={Boolean(currentUser)} isAdmin={isAdmin(currentUser)} verificationStatus={currentUser?.verificationStatus} unreadConversationCount={unreadConversationCount} />
        {currentUser ? (
          <>
            <Link className="nav-cta" href="/listings/new">Post a listing <span aria-hidden="true">↗</span></Link>
          </>
        ) : (
          <Link className="nav-cta" href="/sign-up">Create account <span aria-hidden="true">↗</span></Link>
        )}
        </div>
      </div>
    </nav>
  );
}
