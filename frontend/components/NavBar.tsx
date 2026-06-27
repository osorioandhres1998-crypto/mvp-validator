import Link from "next/link";
import { useRouter } from "next/router";

const LINKS = [
  { href: "/", label: "🧪 Validador" },
  { href: "/audience-research", label: "🧭 Audience Research" },
];

export default function NavBar() {
  const { pathname } = useRouter();
  return (
    <nav className="navbar">
      <span className="brand">MVP Validator</span>
      <div className="nav-links">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "nav-link active" : "nav-link"}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
