import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <div className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="mt-1 font-medium text-slate-900">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
