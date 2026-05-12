import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import PageTransition from "./components/PageTransition";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/CustomerList";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerForm from "./pages/CustomerForm";
import Opportunities from "./pages/Opportunities";
import Kanban from "./pages/Kanban";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PageTransition>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="customers"     element={<CustomerList />} />
                    <Route path="customers/new" element={<CustomerForm />} />
                    <Route path="customers/:id" element={<CustomerDetail />} />
                    <Route path="opportunities" element={<Opportunities />} />
                    <Route path="kanban"        element={<Kanban />} />
                    <Route path="*"             element={<Navigate to="/" replace />} />
                  </Routes>
                </PageTransition>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: "14px" },
          success: { iconTheme: { primary: "#4F46E5", secondary: "#fff" } },
        }}
      />
    </AuthGate>
  );
}
