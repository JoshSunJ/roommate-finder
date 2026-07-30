import Link from "next/link";

export default function Navbar() {
    return (
    <nav className="navbar">
      <Link href="/" className="brand">Roommate Finder</Link>
      <div className="nav-links"><Link href="/listings/new">Post a listing</Link><Link href="/map">Area map</Link></div>
        </nav>
    );
}
