import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://sistema-contable-backend-f67j.onrender.com";

export default function Inicio() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", periodo_inicio: "", periodo_fin: "" });
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cargarEmpresas = async (usuarioId) => {
    try {
      const res = await axios.get(`${API}/empresas/${usuarioId}`);
      setEmpresas(res.data);
    } catch (error) { console.error("Error al cargar empresas:", error); }
  };

  useEffect(() => {
    const sesionGuardada = localStorage.getItem("usuarioLogueado");
    if (!sesionGuardada) { navigate("/"); return; }
    const u = JSON.parse(sesionGuardada);
    if (u.usuario === "admin") { navigate("/admin"); return; }
    setUsuario(u);
    cargarEmpresas(u.id);
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuarioLogueado");
    localStorage.removeItem("empresaActiva");
    navigate("/");
  };

  const guardarEmpresa = async () => {
    if (!form.nombre) { alert("Ingrese el nombre de la empresa"); return; }
    try {
      if (editando) {
        await axios.put(`${API}/empresas/${editando}`, form);
        setEditando(null);
      } else {
        await axios.post(`${API}/empresas`, { ...form, usuario_id: usuario.id });
      }
      setForm({ nombre: "", periodo_inicio: "", periodo_fin: "" });
      cargarEmpresas(usuario.id);
    } catch (error) { console.error("Error al guardar empresa:", error); }
  };

  const eliminarEmpresa = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta empresa y todos sus registros?")) return;
    try {
      await axios.delete(`${API}/empresas/${id}`);
      cargarEmpresas(usuario.id);
    } catch (error) { console.error("Error al eliminar empresa:", error); }
  };

  const editarEmpresa = (e) => {
    setEditando(e.id);
    setForm({
      nombre: e.nombre || "",
      periodo_inicio: e.periodo_inicio ? e.periodo_inicio.split("T")[0] : "",
      periodo_fin: e.periodo_fin ? e.periodo_fin.split("T")[0] : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div>
            <h1 style={s.navTitle}>📊 FINANCIAL SOLUTIONS</h1>
            <p style={s.navSub}>Gestión Contable Empresarial</p>
          </div>
          <div style={s.navRight}>
            <span style={s.userBadge}>👤 {usuario?.usuario}</span>
            <button style={s.btnLogout} onClick={handleCerrarSesion}>Cerrar Sesión</button>
          </div>
        </div>
      </nav>

      <div style={s.container}>
        {/* Formulario */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>{editando ? "✏️ Editar Entidad" : "➕ Registrar Nueva Entidad"}</h2>
          <div style={s.formGrid}>
            <div style={s.inputGroup}>
              <label style={s.label}>Nombre de la Empresa</label>
              <input placeholder="Ej: Grupo Melo S.A." value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Inicio del Periodo</label>
              <input type="date" value={form.periodo_inicio}
                onChange={(e) => setForm({ ...form, periodo_inicio: e.target.value })} style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <label style={s.label}>Fin del Periodo</label>
              <input type="date" value={form.periodo_fin}
                onChange={(e) => setForm({ ...form, periodo_fin: e.target.value })} style={s.input} />
            </div>
          </div>
          <div style={s.formActions}>
            <button style={s.btnPrimary} onClick={guardarEmpresa}>
              {editando ? "Actualizar Entidad" : "Guardar Entidad"}
            </button>
            {editando && (
              <button style={s.btnSecondary} onClick={() => { setEditando(null); setForm({ nombre: "", periodo_inicio: "", periodo_fin: "" }); }}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <h3 style={s.seccionTitle}>Mis Empresas {empresas.length > 0 && <span style={s.badge}>{empresas.length}</span>}</h3>

        {empresas.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🏢</div>
            <p style={s.emptyText}>No tienes empresas registradas aún</p>
            <p style={s.emptySub}>Crea tu primera entidad usando el formulario de arriba</p>
          </div>
        ) : (
          <div style={s.grid}>
            {empresas.map((e) => (
              <div key={e.id} style={s.companyCard}>
                <div style={s.companyTop}>
                  <div style={s.companyIcon}>🏢</div>
                  <h3 style={s.companyName}>{e.nombre}</h3>
                </div>
                <p style={s.companyPeriodo}>
                  📅 {e.periodo_inicio?.split("T")[0]} — {e.periodo_fin?.split("T")[0]}
                </p>
                <div style={s.companyActions}>
                  <button style={s.btnOpen} onClick={() => { localStorage.setItem("empresaActiva", JSON.stringify(e)); navigate("/diario"); }}>
                    Abrir Libros
                  </button>
                  <button style={s.btnEdit} onClick={() => editarEmpresa(e)}>Editar</button>
                  <button style={s.btnDelete} onClick={() => eliminarEmpresa(e.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  nav: { background: "#0f172a", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  navInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" },
  navTitle: { color: "white", margin: 0, fontSize: "clamp(16px, 3vw, 20px)", fontWeight: "800" },
  navSub: { color: "#94a3b8", margin: "2px 0 0", fontSize: "12px" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  userBadge: { background: "#1e293b", color: "#94a3b8", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  btnLogout: { background: "#dc2626", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" },
  card: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardTitle: { margin: "0 0 20px", fontSize: "17px", fontWeight: "700", color: "#0f172a" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: { padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", width: "100%", boxSizing: "border-box", outline: "none" },
  formActions: { display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" },
  btnPrimary: { background: "#1e293b", color: "white", border: "none", padding: "11px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  btnSecondary: { background: "white", color: "#64748b", border: "1.5px solid #e2e8f0", padding: "11px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" },
  seccionTitle: { fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "10px" },
  badge: { background: "#2563eb", color: "white", fontSize: "12px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" },
  emptyState: { background: "white", borderRadius: "12px", border: "2px dashed #e2e8f0", padding: "60px 20px", textAlign: "center" },
  emptyIcon: { fontSize: "52px", marginBottom: "12px" },
  emptyText: { fontSize: "18px", fontWeight: "600", color: "#334155", margin: "0 0 8px" },
  emptySub: { fontSize: "14px", color: "#94a3b8", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  companyCard: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px" },
  companyTop: { display: "flex", alignItems: "center", gap: "12px" },
  companyIcon: { fontSize: "28px" },
  companyName: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  companyPeriodo: { margin: 0, fontSize: "13px", color: "#64748b" },
  companyActions: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" },
  btnOpen: { flex: 1, background: "#2563eb", color: "white", border: "none", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  btnEdit: { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "9px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  btnDelete: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "9px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
};
