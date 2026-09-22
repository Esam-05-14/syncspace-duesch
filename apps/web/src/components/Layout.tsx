import { listDue } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { describeDeviceNetwork } from "../lib/network-status.js";

export function Layout() {
  const [due, setDue] = useState(0);
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    void listDue(new Date()).then((rows) => setDue(rows.length));
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const network = describeDeviceNetwork(online);

  return (
    <div className="shell">
      {!network.online ? (
        <p className="banner offline-banner">
          {network.label}. Lessons and private review on this device still work. Shared-board
          connected stays no unless a sync process is reachable.
        </p>
      ) : null}
      <header className="topbar">
        <NavLink to="/" className="brand">
          SyncSpace Deutsch
          <small>Shared lessons · private progress</small>
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Boards
          </NavLink>
          <NavLink to="/guide">Guide</NavLink>
          <NavLink to="/learn">Lessons</NavLink>
          <NavLink to="/learn/inquire">Inquire</NavLink>
          <NavLink to="/learn/drill">Drill</NavLink>
          <NavLink to="/learn/write">Write</NavLink>
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
