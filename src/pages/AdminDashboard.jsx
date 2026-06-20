import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://sistema-contable-backend-f67j.onrender.com";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ usuarios: 0, empresas: 0, movimientos: 0 });
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ usuario: "", email: "", password: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("usuarios");

  useEffect(() => {
    const sesion = localStorage.getItem("usuarioLogueado");
    if (!sesion) { navigate("/"); return; }
    const u = JSON.parse(sesion);
    if (u.usuario !== "admin") { navigate("/inicio"); return; }
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [statsRes, usuariosRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/usuarios`),
      ]);
      setStats(statsRes.data);
      setUsuarios(usuariosRes.data.filter(u => u.usuario !== "admin"));
    } catch (e) { console.error(e); }
    setCargando(false);
  };

  const crearUsuario = async () => {
    if (!form.usuario || !form.email || !form.password) {
      setMensaje({ texto: "Todos los campos son obligatorios", tipo: "error" }); return;
    }
    try {
      await axios.post(`${API}/admin/usuarios`, form);
      setMensaje({ texto: "✅ Usuario creado exitosamente", tipo: "ok" });
      setForm({ usuario: "", email: "", password: "" });
      cargarDatos();
    } catch (e) {
      setMensaje({ texto: e.response?.data?.message || "Error al crear usuario", tipo: "error" });
    }
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const eliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a "${nombre}" y todas sus empresas y datos?`)) return;
    try {
      await axios.delete(`${API}/admin/usuarios/${id}`);
      setMensaje({ texto: "✅ Usuario eliminado", tipo: "ok" });
      cargarDatos();
    } catch (e) { setMensaje({ texto: "Error al eliminar", tipo: "error" }); }
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioLogueado");
    navigate("/");
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div>
            <h1 style={s.navTitle}>⚙️ Panel de Administración</h1>
            <p style={s.navSub}>Financial Solutions — Control total del sistema</p>
          </div>
          <button style={s.btnLogout} onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      </nav>

      <div style={s.container}>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: "Usuarios", valor: cargando ? "..." : Math.max(0, stats.usuarios - 1), icon: "👥", color: "#2563eb", bg: "#eff6ff" },
            { label: "Empresas", valor: cargando ? "..." : stats.empresas, icon: "🏢", color: "#16a34a", bg: "#f0fdf4" },
            { label: "Movimientos", valor: cargando ? "..." : stats.movimientos, icon: "📊", color: "#9333ea", bg: "#faf5ff" },
          ].map((stat) => (
            <div key={stat.label} style={{ ...s.statCard, borderTop: `4px solid ${stat.color}` }}>
              <div style={{ ...s.statIconBox, background: stat.bg }}>
                <span style={s.statIcon}>{stat.icon}</span>
              </div>
              <div>
                <p style={s.statLabel}>{stat.label}</p>
                <p style={{ ...s.statValor, color: stat.color }}>{stat.valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === "usuarios" ? s.tabActive : {}) }} onClick={() => setTab("usuarios")}>
            👥 Gestionar Usuarios
          </button>
          <button style={{ ...s.tab, ...(tab === "crear" ? s.tabActive : {}) }} onClick={() => setTab("crear")}>
            ➕ Crear Usuario
          </button>
        </div>

        {/* Mensaje */}
        {mensaje.texto && (
          <div style={{ ...s.alert, background: mensaje.tipo === "ok" ? "#dcfce7" : "#fee2e2", color: mensaje.tipo === "ok" ? "#15803d" : "#b91c1c" }}>
            {mensaje.texto}
          </div>
        )}

        {/* Tab: Crear usuario */}
        {tab === "crear" && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Crear Nuevo Usuario</h2>
            <div style={s.formGrid}>
              <div style={s.inputGroup}>
                <label style={s.label}>Nombre de usuario</label>
                <input placeholder="Ej: juan123" value={form.usuario}
                  onChange={(e) => setForm({ ...form, usuario: e.target.value })} style={s.input} />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Correo electrónico</label>
                <input type="email" placeholder="correo@ejemplo.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} style={s.input} />
              </div>
              <div style={s.inputGroup}>
                <label style={s.label}>Contraseña</label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} style={s.input} />
              </div>
            </div>
            <button style={s.btnPrimary} onClick={crearUsuario}>Crear Usuario</button>
          </div>
        )}

        {/* Tab: Lista usuarios */}
        {tab === "usuarios" && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Usuarios del Sistema ({usuarios.length})</h2>
            {cargando ? (
              <p style={s.emptyText}>Cargando...</p>
            ) : usuarios.length === 0 ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: "36px", margin: "0 0 8px" }}>👥</p>
                <p style={s.emptyText}>No hay usuarios registrados</p>
              </div>
            ) : (
              <div style={s.userList}>
                {usuarios.map((u) => (
                  <div key={u.id} style={s.userCard}>
                    <div style={s.userAvatar}>{u.usuario[0].toUpperCase()}</div>
                    <div style={s.userInfo}>
                      <p style={s.userName}>👤 {u.usuario}</p>
                      <p style={s.userEmail}>✉️ {u.email}</p>
                    </div>
                    <div style={s.userRight}>
                      <span style={s.empresasBadge}>🏢 {u.total_empresas}</span>
                      <button style={s.btnDelete} onClick={() => eliminarUsuario(u.id, u.usuario)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  nav: { background: "#0f172a", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" },
  navTitle: { color: "white", margin: 0, fontSize: "clamp(16px, 3vw, 20px)", fontWeight: "800" },
  navSub: { color: "#94a3b8", margin: "2px 0 0", fontSize: "12px" },
  btnLogout: { background: "#dc2626", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" },
  statIconBox: { width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statIcon: { fontSize: "24px" },
  statLabel: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" },
  statValor: { margin: "4px 0 0", fontSize: "28px", fontWeight: "800", fontFamily: "monospace" },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  tab: { padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#64748b" },
  tabActive: { background: "#1e293b", color: "white", borderColor: "#1e293b" },
  alert: { padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", marginBottom: "16px" },
  card: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" },
  cardTitle: { margin: "0 0 20px", fontSize: "17px", fontWeight: "700", color: "#0f172a" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: { padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  btnPrimary: { background: "#1e293b", color: "white", border: "none", padding: "12px 28px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  emptyState: { textAlign: "center", padding: "40px 20px" },
  emptyText: { color: "#94a3b8", textAlign: "center", fontSize: "15px" },
  userList: { display: "flex", flexDirection: "column", gap: "12px" },
  userCard: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "10px", border: "1px solid #f1f5f9", background: "#fafafa", flexWrap: "wrap" },
  userAvatar: { width: "42px", height: "42px", borderRadius: "50%", background: "#1e293b", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px", flexShrink: 0 },
  userInfo: { flex: 1, minWidth: "150px" },
  userName: { margin: 0, fontWeight: "700", color: "#0f172a", fontSize: "14px" },
  userEmail: { margin: "3px 0 0", color: "#64748b", fontSize: "13px" },
  userRight: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  empresasBadge: { background: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },
  btnDelete: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
};
