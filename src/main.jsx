import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login"; // 1. Importación del Login
import Inicio from "./pages/Inicio";
import DiarioGeneral from "./pages/DiarioGeneral";
import Mayorizar from "./pages/Mayorizar";
import BalanceGeneral from "./pages/BalanceGeneral";
import EstadoResultado from "./pages/EstadoResultado";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* LOGIN POR DEFECTO */}
        <Route path="/" element={<Login />} />

        {/* GESTIÓN DE ENTIDADES/EMPRESAS */}
        <Route path="/inicio" element={<Inicio />} />

        {/* DIARIO */}
        <Route path="/diario" element={<DiarioGeneral />} />

        {/* MAYORIZACION */}
        <Route path="/mayorizar" element={<Mayorizar />} />

        {/* BALANCE */}
        <Route path="/balance" element={<BalanceGeneral />} />

        {/* ESTADO RESULTADO */}
        <Route path="/resultados" element={<EstadoResultado />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);