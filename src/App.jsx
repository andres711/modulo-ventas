import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/ventas" replace />} />
        <Route path="/ventas" element={<Sales />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/ventas" replace />} />
      </Route>
    </Routes>
  );
}
