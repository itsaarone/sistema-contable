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
      setMensaje({ texto: "Usuario creado exitosamente", tipo: "ok" });
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
      setMensaje({ texto: "Usuario eliminado", tipo: "ok" });
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
      <div style={s.header}>
        <div style={s.headerInner}>
          <div>
            <h1 style={s.titulo}>⚙️ Panel de Administración</h1>
            <p style={s.subtitulo}>Financial Solutions — Control total del sistema</p>
          </div>
          <button style={s.btnLogout} onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      </div>

      <div style={s.content}>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: "Usuarios Registrados", valor: stats.usuarios - 1, icon: "👥", color: "#2563eb" },
            { label: "Empresas Creadas", valor: stats.empresas, icon: "🏢", color: "#16a34a" },
            { label: "Movimientos Contables", valor: stats.movimientos, icon: "📊", color: "#9333ea" },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <span style={s.statIcon}>{stat.icon}</span>
              <div>
                <p style={s.statLabel}>{stat.label}</p>
                <p style={{ ...s.statValor, color: stat.color }}>{cargando ? "..." : stat.valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Crear usuario */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>➕ Crear Nuevo Usuario</h2>
          {mensaje.texto && (
            <div style={{ ...s.alert, background: mensaje.tipo === "ok" ? "#dcfce7" : "#fee2e2", color: mensaje.tipo === "ok" ? "#15803d" : "#b91c1c" }}>
              {mensaje.texto}
            </div>
          )}
          <div style={s.formGrid}>
            <input placeholder="Nombre de usuario" value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })} style={s.input} />
            <input type="email" placeholder="Correo electrónico" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} style={s.input} />
            <input type="password" placeholder="Contraseña" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} style={s.input} />
            <button style={s.btnPrimary} onClick={crearUsuario}>Crear Usuario</button>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>👥 Usuarios del Sistema</h2>
          {cargando ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px" }}>No hay usuarios registrados aún.</p>
          ) : (
            <div style={s.tabla}>
              {/* Encabezado */}
              <div style={s.tablaHeader}>
                <span>Usuario</span>
                <span>Email</span>
                <span style={{ textAlign: "center" }}>Empresas</span>
                <span style={{ textAlign: "right" }}>Acciones</span>
              </div>
              {/* Filas */}
              {usuarios.map((u) => (
                <div key={u.id} style={s.tablaFila}>
                  <span style={s.usuarioNombre}>👤 {u.usuario}</span>
                  <span style={s.usuarioEmail}>{u.email}</span>
                  <span style={s.empresasBadge}>{u.total_empresas} empresa{u.total_empresas !== 1 ? "s" : ""}</span>
                  <div style={{ textAlign: "right" }}>
                    <button style={s.btnDelete} onClick={() => eliminarUsuario(u.id, u.usuario)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, sans-serif" },
  header: { background: "#0f172a", padding: "20px" },
  headerInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" },
  titulo: { color: "white", margin: 0, fontSize: "clamp(18px, 3vw, 24px)", fontWeight: "700" },
  subtitulo: { color: "#94a3b8", margin: "4px 0 0", fontSize: "14px" },
  btnLogout: { background: "#dc2626", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" },
  statIcon: { fontSize: "36px" },
  statLabel: { margin: 0, fontSize: "13px", color: "#64748b", fontWeight: "500" },
  statValor: { margin: "4px 0 0", fontSize: "32px", fontWeight: "800", fontFamily: "monospace" },
  card: { background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px" },
  cardTitle: { margin: "0 0 20px", fontSize: "17px", fontWeight: "700", color: "#0f172a" },
  alert: { padding: "10px 16px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", marginBottom: "14px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", alignItems: "end" },
  input: { padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  btnPrimary: { background: "#1e293b", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px", height: "42px" },
  tabla: { border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" },
  tablaHeader: { display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", padding: "12px 16px", background: "#f8fafc", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  tablaFila: { display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px", padding: "14px 16px", borderTop: "1px solid #f1f5f9", alignItems: "center" },
  usuarioNombre: { fontWeight: "600", color: "#0f172a", fontSize: "14px" },
  usuarioEmail: { color: "#64748b", fontSize: "14px" },
  empresasBadge: { textAlign: "center", background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  btnDelete: { background: "#dc2626", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
};
