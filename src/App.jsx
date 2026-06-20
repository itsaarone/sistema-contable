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
      {/* 📱 INYECCIÓN CSS RESPONSIVA AVANZADA MULTIDISPOSITIVO */}
      <style>{`
        /* --- SOLO SE APLICA EN DISPOSITIVOS MÓVILES (MÁXIMO 768PX) --- */
        @media (max-width: 768px) {
          
          /* 1. CORRECCIÓN DE FORMULARIOS INTERNOS Y CONTENEDORES DE CONTENIDO (Evita romper el header) */
          /* Selecciona grillas de formularios de registro y cajas de estados contables */
          div[style*="display: grid"][style*="grid-template-columns"]:not([style*="1fr 1fr"]),
          div[style*="display: flex"][style*="gap: 12px"]:not([style*="background: #0f172a"]):not([style*="background:#0f172a"]) {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }

          /* 2. PROTECCIÓN EXCLUSIVA PARA EL MENÚ SUPERIOR (Evita lo que pasó en la imagen) */
          /* Mantiene el header azul con los botones pequeños en su fila correspondiente */
          div[style*="background: #0f172a"], 
          div[style*="background:#0f172a"],
          nav, 
          header {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 12px 16px !important;
            text-align: left !important;
          }

          /* Reducción sutil del tamaño de botones del menú para que quepan todos juntos */
          div[style*="background: #0f172a"] button,
          div[style*="background:#0f172a"] button {
            width: auto !important;
            height: auto !important;
            padding: 6px 12px !important;
            font-size: 12px !important;
            display: inline-flex !important;
          }

          /* 3. ARREGLO DE ENLACES DEL LOGIN */
          /* Colapsa verticalmente los links inferiores del login de tu captura anterior */
          div[style*="max-width: 420px"] div[style*="display: flex"] {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
          }

          /* 4. ENTRADAS DE TEXTO Y BOTONES OPERATIVOS GRANDES */
          input, select, div:not([style*="background"]) > button:not([style*="padding: 6px"]) {
            width: 100% !important;
            box-sizing: border-box !important;
            height: 44px !important;
          }

          /* 5. SISTEMA DE DESLIZAMIENTO MÁGICO PARA LAS TABLAS Y REPORTES FINANCIEROS */
          /* Hace que DiarioGeneral, Mayorizar, Balance y Resultados permitan scroll con el dedo sin romperse */
          div[style*="border: 1px solid"], 
          div[style*="border-radius: 8px"],
          div[style*="border-radius:12px"] {
            width: 100% !important;
            overflow-x: auto !important;
            display: block !important;
            -webkit-overflow-scrolling: touch;
          }

          /* Fuerza que el bloque de columnas de la tabla mantenga un ancho mínimo legible al deslizar */
          div[style*="border: 1px solid"] div[style*="display: grid"],
          div[style*="border-radius: 8px"] div[style*="display: grid"] {
            min-width: 720px !important; 
          }

          /* 6. RESPONSIVIDAD PARA LAS TARJETAS DE EMPRESAS (Inicio.jsx) */
          /* Ajusta la lista de empresas creadas para que los botones queden abajo ordenadamente */
          div[style*="padding: 16px 24px"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px !important;
          }
          div[style*="padding: 16px 24px"] div[style*="text-align: right"] {
            width: 100% !important;
            text-align: left !important;
            margin-top: 10px !important;
          }

          /* Reducción de textos gigantes */
          h1 { font-size: 20px !important; }
          h2 { font-size: 18px !important; }
        }

        /* --- CONFIGURACIÓN LIMPIA PARA CUANDO EXPORTES A PDF/IMPRESION --- */
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