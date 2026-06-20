import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Inicio() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", periodo_inicio: "", periodo_fin: "" });
  const [usuario, setUsuario] = useState(null);

  const cargarEmpresas = async () => {
    try {
      const res = await axios.get("http://localhost:3001/empresas");
      setEmpresas(res.data);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  useEffect(() => {
    // Verificar si el usuario ha iniciado sesión
    const sesionGuardada = localStorage.getItem("usuarioLogueado");
    if (!sesionGuardada) {
      // Si no hay sesión activa, redirige inmediatamente al Login
      navigate("/");
      return;
    }
    
    setUsuario(JSON.parse(sesionGuardada));
    cargarEmpresas();
  }, [navigate]);

  const handleCerrarSesion = () => {
    // Elimina los datos del usuario de la sesión local
    localStorage.removeItem("usuarioLogueado");
    localStorage.removeItem("empresaActiva");
    // Redirige a la pantalla de Login
    navigate("/");
  };

  const guardarEmpresa = async () => {
    try {
      if (!form.nombre) {
        alert("Ingrese el nombre de la empresa");
        return;
      }
      if (editando) {
        await axios.put(`http://localhost:3001/empresas/${editando}`, form);
        setEditando(null);
      } else {
        await axios.post("http://localhost:3001/empresas", form);
      }
      setForm({ nombre: "", periodo_inicio: "", periodo_fin: "" });
      cargarEmpresas();
    } catch (error) {
      console.error("Error al guardar empresa:", error);
    }
  };

  const eliminarEmpresa = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta empresa y todos sus registros?")) return;
    try {
      await axios.delete(`http://localhost:3001/empresas/${id}`);
      cargarEmpresas();
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
    }
  };

  const editarEmpresa = (e) => {
    setEditando(e.id);
    setForm({
      nombre: e.nombre || "",
      periodo_inicio: e.periodo_inicio ? e.periodo_inicio.split("T")[0] : "",
      periodo_fin: e.periodo_fin ? e.periodo_fin.split("T")[0] : "",
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>FINANCIAL SOLUTIONS</h1>
              <p style={styles.sub}>Plataforma de Gestión Contable y Financiera Empresarial</p>
            </div>
            <div style={styles.userInfoContainer}>
              {usuario && <span style={styles.userBadge}>👤 {usuario.usuario}</span>}
              <button style={styles.btnLogout} onClick={handleCerrarSesion}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>{editando ? "Editar Entidad" : "Registrar Nueva Entidad"}</h2>
          <div style={styles.grid}>
            <input
              placeholder="Nombre de la Empresa / Entidad"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              style={styles.input}
            />
            <input
              type="date"
              value={form.periodo_inicio}
              onChange={(e) => setForm({ ...form, periodo_inicio: e.target.value })}
              style={styles.input}
            />
            <input
              type="date"
              value={form.periodo_fin}
              onChange={(e) => setForm({ ...form, periodo_fin: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formActions}>
            <button style={styles.btnPrimary} onClick={guardarEmpresa}>
              {editando ? "Actualizar Entidad" : "Guardar Entidad"}
            </button>
            {editando && (
              <button style={styles.btnSecondary} onClick={() => { setEditando(null); setForm({ nombre: "", periodo_inicio: "", periodo_fin: "" }); }}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div style={styles.list}>
          {empresas.map((e) => (
            <div key={e.id} style={styles.companyCard}>
              <div>
                <h3 style={styles.companyName}>{e.nombre}</h3>
                <p style={styles.companyMeta}>
                  <b>Periodo:</b> {e.periodo_inicio?.split("T")[0]} al {e.periodo_fin?.split("T")[0]}
                </p>
              </div>
              <div style={styles.actions}>
                <button style={styles.btnOpen} onClick={() => { localStorage.setItem("empresaActiva", JSON.stringify(e)); navigate("/diario"); }}>
                  Abrir Libros
                </button>
                <button style={styles.btnEdit} onClick={() => editarEmpresa(e)}>Editar</button>
                <button style={styles.btnDelete} onClick={() => eliminarEmpresa(e.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px", fontFamily: "-apple-system, sans-serif" },
  container: { maxWidth: "1000px", margin: "0 auto" },
  header: { marginBottom: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 },
  sub: { color: "#64748b", fontSize: "14px", marginTop: "4px" },
  userInfoContainer: { display: "flex", alignItems: "center", gap: "14px" },
  userBadge: { fontSize: "14px", fontWeight: "600", color: "#334155", backgroundColor: "#e2e8f0", padding: "6px 12px", borderRadius: "20px" },
  btnLogout: { background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "background 0.2s" },
  card: { background: "#ffffff", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" },
  cardTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 16px 0", color: "#1e293b" },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" },
  input: { padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" },
  formActions: { display: "flex", gap: "12px", marginTop: "16px" },
  btnPrimary: { background: "#1e293b", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "500" },
  btnSecondary: { background: "transparent", color: "#64748b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  companyCard: { background: "#ffffff", padding: "16px 24px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  companyName: { fontSize: "16px", fontWeight: "600", margin: 0, color: "#0f172a" },
  companyMeta: { fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" },
  actions: { display: "flex", gap: "8px" },
  btnOpen: { background: "#2563eb", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  btnEdit: { background: "#f59e0b", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  btnDelete: { background: "#dc2626", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }
};