import { listDue } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  const [due, setDue] = useState(0);

  useEffect(() => {
    void listDue(new Date()).then((rows) => setDue(rows.length));
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          SyncSpace Deutsch
          <small>Shared lessons · private progress</small>
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Boards
          </NavLink>
          <NavLink to="/learn">Lessons</NavLink>
          <NavLink to="/learn/inquire">Inquire</NavLink>
          <NavLink to="/learn/drill">Drill</NavLink>
          <NavLink to="/learn/lectures">Lectures</NavLink>
          <NavLink to="/review">
            Review
            {due > 0 ? <span className="nav-count">{due}</span> : null}
          </NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
