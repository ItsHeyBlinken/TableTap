import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resetChecklistDismissed } from "../lib/onboardingStorage";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const showChecklistAgain = () => {
    resetChecklistDismissed();
    navigate("/dashboard");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="mt-6 max-w-md space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="mt-1 font-medium text-slate-900">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Log out
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">Help</h2>
          <p className="mt-1 text-sm text-slate-600">Features, show-day workflow, and getting started.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/guide" className="text-sm font-medium text-brand-600 hover:underline">
              How to use TableTap (full guide)
            </Link>
            <Link to="/welcome" className="text-sm font-medium text-brand-600 hover:underline">
              Quick start (4 steps)
            </Link>
            <button
              type="button"
              onClick={showChecklistAgain}
              className="text-left text-sm font-medium text-brand-600 hover:underline"
            >
              Show getting started checklist on dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
