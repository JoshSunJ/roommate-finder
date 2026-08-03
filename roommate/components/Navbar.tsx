import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="brand" aria-label="Roommate Finder home">
        <span className="brand-mark">RF</span>
        <span>Roommate Finder</span>
      </Link>
      <div className="nav-links">
        <Link href="/dashboard">My listings</Link>
        <Link href="/map">Area guide</Link>
        <Link className="nav-cta" href="/listings/new">Post a listing <span aria-hidden="true">↗</span></Link>
      </div>
    </nav>
  );
}
