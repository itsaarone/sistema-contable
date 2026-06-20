import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Inicio from "./pages/Inicio";
import DiarioGeneral from "./pages/DiarioGeneral";
import Mayorizar from "./pages/Mayorizar";
import BalanceGeneral from "./pages/BalanceGeneral";
import EstadoResultado from "./pages/EstadoResultado";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Inicio />} />
        <Route path="/diario" element={<DiarioGeneral />} />
        <Route path="/mayorizar" element={<Mayorizar />} />
        <Route path="/balance" element={<BalanceGeneral />} />
        <Route path="/resultados" element={<EstadoResultado />} />

      </Routes>
    </BrowserRouter>
  );
}