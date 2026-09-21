import { NavLink, Outlet } from "react-router-dom";
import { DraftBanner } from "./DraftBanner.js";

const LINKS = [
  { to: "/learn", end: true, label: "Roadmap" },
  { to: "/learn/alphabet", label: "Alphabet" },
  { to: "/learn/sounds", label: "Sounds" },
  { to: "/learn/words", label: "Words" },
  { to: "/learn/phrases", label: "Phrases" },
  { to: "/learn/grammar", label: "Grammar" },
  { to: "/learn/mapper", label: "Mapper" },
  { to: "/learn/builder", label: "Builder" },
  { to: "/learn/sources", label: "Sources" },
] as const;

export function LearnChrome() {
  return (
    <main className="page">
      <h1>Lessons on this device</h1>
      <p className="lede">
        A from-scratch path with English explanations. Completing a station is a private tick in
        this profile. It is not a CEFR certificate and not a shared-board edit.
      </p>
      <DraftBanner />
      <nav className="row learn-nav" style={{ margin: "1rem 0" }}>
        {LINKS.map((link) => (
          <NavLink key={link.to} end={"end" in link ? link.end : undefined} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </main>
  );
}
