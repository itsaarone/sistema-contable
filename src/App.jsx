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
      {/* 📱 INYECCIÓN CSS MÚLTIPLES DISPOSITIVOS (MÓVIL, TABLET, PC) */}
      <style>{`
        /* --- ESTILOS ADAPTATIVOS PARA PANTALLAS MÓVILES (MÁXIMO 768PX) --- */
        @media (max-width: 768px) {
          
          /* 1. CORRECCIÓN DEL LOGIN (Enlaces inferiores en fila que se cortaban en tu pantalla) */
          div[style*="display: flex"][style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
            text-align: center !important;
          }

          /* 2. FORMULARIOS RESPONSIVOS (Pasan de columnas horizontales a apilarse verticalmente) */
          div[style*="display: grid"], 
          div[style*="display: flex"][style*="gap: 12px"] {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }

          /* 3. BOTONES E INPUTS TÁCTILES */
          button, input, select {
            width: 100% !important;
            box-sizing: border-box !important;
            height: 44px !important; /* Altura perfecta recomendada para presionar con el dedo */
          }

          /* Excepción para botones pequeños dentro de filas o tablas (Para que no midan 100%) */
          td button, table button, div[style*="text-align: right"] button, span[style*="cursor"] {
            width: auto !important;
            height: auto !important;
            display: inline-block !important;
          }

          /* 4. PROTECCIÓN MÁGICA DE TABLAS Y REPORTES FINANCIEROS (Scroll lateral con el dedo) */
          /* Esto repara automáticamente Diario General, Mayorización, Balance y Estado de Resultados */
          div[style*="border: 1px solid"], 
          div[style*="border-radius: 8px"], 
          div[style*="overflow: hidden"] {
            width: 100% !important;
            overflow-x: auto !important;
            display: block !important;
            -webkit-overflow-scrolling: touch; /* Suaviza el scroll en iPhones */
          }

          /* Mantiene la grilla interna de las tablas legible sin amontonar las columnas */
          div[style*="display: grid"][style*="grid-template-columns"] {
            min-width: 720px !important; 
          }

          /* 5. SECCIONES DE ENCABEZADOS DE EMPRESAS */
          div[style*="justify-content: space-between"][style*="padding"] {
            flex-direction: column !important;
            text-align: center !important;
            gap: 14px !important;
          }

          /* Ajuste de márgenes internos de tarjetas para celulares */
          div[style*="padding: 40px"], div[style*="padding: 24px"] {
            padding: 20px 16px !important;
          }

          /* Evita títulos gigantes desproporcionados */
          h1 { font-size: 22px !important; }
          h2 { font-size: 19px !important; }
        }

        /* --- MANTENER ESTILOS LÍNEALES EN ELEMENTOS INTERNOS EXCLUSIVOS --- */
        @media (max-width: 768px) {
          .no-colapsar {
            flex-direction: row !important;
          }
        }

        /* --- OPTIMIZACIÓN LIMPIA PARA CUANDO IMPRIMAS EN PDF --- */
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

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