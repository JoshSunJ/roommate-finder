import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="navbar">
            <Link href="/" className="brand">Roommate Finder</Link>
            <span>Listings prototype</span>
        </nav>
    );
}
