import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { APP_DISPLAY_NAME } from "../lib/brand";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

const sellClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-semibold ${
    isActive ? "bg-green-700 text-white" : "bg-green-600 text-white hover:bg-green-700"
  }`;

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/dashboard" className="text-lg font-bold text-brand-700">
          {APP_DISPLAY_NAME}
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/sell" className={sellClass}>
            Record sale
          </NavLink>
          <NavLink to="/sales" className={linkClass}>
            Sales
          </NavLink>
          <NavLink to="/cards" className={linkClass}>
            Stock
          </NavLink>
          <NavLink to="/events" className={linkClass}>
            Events
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
        {user && (
          <span className="hidden text-sm text-slate-500 sm:block">{user.email}</span>
        )}
      </div>
    </nav>
  );
}
