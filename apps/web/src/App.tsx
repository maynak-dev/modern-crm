import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuthStore } from "@/store/auth";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ContactsPage from "@/pages/ContactsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import DealsPage from "@/pages/DealsPage";
import TasksPage from "@/pages/TasksPage";
import ActivityPage from "@/pages/ActivityPage";
import SettingsPage from "@/pages/SettingsPage";

function Protected({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
