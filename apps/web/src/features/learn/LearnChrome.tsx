import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { DraftBanner } from "./DraftBanner.js";

const LINKS = [
  { to: "/learn", end: true, label: "Roadmap" },
  { to: "/learn/inquire", label: "Inquire" },
  { to: "/learn/skills", label: "Four skills" },
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
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      event.preventDefault();
      inputRef.current?.focus();
      if (!window.location.pathname.startsWith("/learn/inquire")) {
        navigate(q.trim() ? `/learn/inquire?q=${encodeURIComponent(q.trim())}` : "/learn/inquire");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, q]);

  return (
    <main className="page">
      <h1>Lessons on this device</h1>
      <p className="lede">
        A from-scratch path with English explanations. Completing a station is a private tick in
        this profile. It is not a CEFR certificate and not a shared-board edit.
      </p>
      <form
        className="inquire-bar"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(q.trim() ? `/learn/inquire?q=${encodeURIComponent(q.trim())}` : "/learn/inquire");
        }}
      >
        <label>
          Fast lookup
          <input
            ref={inputRef}
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Strasse, table, #food, pos:verb — press /"
            autoComplete="off"
            name="learn-q"
          />
        </label>
        <button type="submit">Inquire</button>
      </form>
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
