import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import DiarioGeneral from "./pages/DiarioGeneral";
import Mayorizar from "./pages/Mayorizar";
import BalanceGeneral from "./pages/BalanceGeneral";
import EstadoResultado from "./pages/EstadoResultado";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/diario" element={<DiarioGeneral />} />
        <Route path="/mayorizar" element={<Mayorizar />} />
        <Route path="/balance" element={<BalanceGeneral />} />
        <Route path="/resultados" element={<EstadoResultado />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}