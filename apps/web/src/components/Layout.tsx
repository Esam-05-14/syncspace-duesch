import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
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
          <NavLink to="/review">Review</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
