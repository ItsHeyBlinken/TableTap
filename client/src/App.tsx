import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SellPage } from "./pages/SellPage";
import { SalesPage } from "./pages/SalesPage";
import { CardsListPage } from "./pages/CardsListPage";
import { CardDetailPage } from "./pages/CardDetailPage";
import { CardNewPage } from "./pages/CardNewPage";
import { CardEditPage } from "./pages/CardEditPage";
import { EventsPage } from "./pages/EventsPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/cards" element={<CardsListPage />} />
              <Route path="/cards/new" element={<CardNewPage />} />
              <Route path="/cards/:id" element={<CardDetailPage />} />
              <Route path="/cards/:id/edit" element={<CardEditPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
