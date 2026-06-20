import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function NavBar({ empresa, paginaActiva }) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const links = [
    { label: "Libro Diario", path: "/diario" },
    { label: "Mayorización", path: "/mayorizar" },
    { label: "Estado Resultado", path: "/resultados" },
    { label: "Balance General", path: "/balance" },
  ];

  return (
    <nav style={s.nav}>
      <div style={s.navInner}>
        {/* Empresa info */}
        <div style={s.empresaInfo}>
          <h2 style={s.empresaNombre}>{empresa?.nombre || "—"}</h2>
          <p style={s.empresaPeriodo}>
            {empresa?.periodo_inicio?.split("T")[0]} — {empresa?.periodo_fin?.split("T")[0]}
          </p>
        </div>

        {/* Desktop links */}
        <div style={s.desktopLinks}>
          {links.map((l) => (
            <button key={l.path} style={{ ...s.link, ...(paginaActiva === l.path ? s.linkActive : {}) }}
              onClick={() => navigate(l.path)}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Acciones */}
        <div style={s.acciones}>
          <button style={s.btnPrint} onClick={() => window.print()} title="Imprimir">🖨️</button>
          <button style={s.btnCambiar} onClick={() => navigate("/inicio")}>Cambiar</button>
          <button style={s.btnSalir} onClick={() => navigate("/")}>Salir</button>
          {/* Hamburger */}
          <button style={s.hamburger} onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuAbierto && (
        <div style={s.mobileMenu}>
          {links.map((l) => (
            <button key={l.path}
              style={{ ...s.mobileLink, ...(paginaActiva === l.path ? s.mobileLinkActive : {}) }}
              onClick={() => { navigate(l.path); setMenuAbierto(false); }}>
              {l.label}
            </button>
          ))}
          <div style={s.mobileDivider} />
          <button style={s.mobileLink} onClick={() => navigate("/inicio")}>🏢 Cambiar Empresa</button>
          <button style={s.mobileLink} onClick={() => navigate("/")}>🚪 Cerrar Sesión</button>
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: { background: "#0f172a", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  navInner: { maxWidth: "1200px", margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "nowrap" },
  empresaInfo: { flex: 1, minWidth: 0 },
  empresaNombre: { color: "white", margin: 0, fontSize: "clamp(13px, 2.5vw, 16px)", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  empresaPeriodo: { color: "#64748b", margin: "2px 0 0", fontSize: "11px" },
  desktopLinks: { display: "flex", gap: "4px", "@media(max-width:768px)": { display: "none" } },
  link: { background: "transparent", color: "#94a3b8", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" },
  linkActive: { background: "#1e293b", color: "white", fontWeight: "700" },
  acciones: { display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 },
  btnPrint: { background: "#334155", color: "white", border: "none", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  btnCambiar: { background: "#334155", color: "#cbd5e1", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  btnSalir: { background: "#7f1d1d", color: "#fca5a5", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  hamburger: { background: "#334155", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "16px", display: "block" },
  mobileMenu: { background: "#1e293b", padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: "4px" },
  mobileLink: { background: "transparent", color: "#cbd5e1", border: "none", padding: "12px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500", textAlign: "left" },
  mobileLinkActive: { background: "#0f172a", color: "white", fontWeight: "700" },
  mobileDivider: { height: "1px", background: "#334155", margin: "8px 0" },
};
