import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ToastProvider } from "@/context/ToastContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AddExpense from "@/pages/AddExpense";
import TransactionList from "@/pages/TransactionList";
import Settings from "@/pages/Settings";
import NetWorth from "@/pages/NetWorth";
import Assets from "@/pages/Assets";
import Liability from "./pages/Liability";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/expense" element={<ProtectedLayout><AddExpense /></ProtectedLayout>} />
            <Route path="/list" element={<ProtectedLayout><TransactionList /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="/net-worth" element={<ProtectedLayout><NetWorth /></ProtectedLayout>} />
            {/* <Route path="/assets" element={<Assets />} /> */}
                        <Route path="/assets" element={<ProtectedLayout><Assets /></ProtectedLayout>} />

                        <Route path="/liabilities" element={<ProtectedLayout><Liability /></ProtectedLayout>} />


            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}