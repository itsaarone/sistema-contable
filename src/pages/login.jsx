import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [vista, setVista] = useState("login"); // vistas posibles: login, registro, forgotUser, forgotPass
  const [form, setForm] = useState({ usuario: "", email: "", password: "" });
  const [mensaje, setMensaje] = useState("");

  const limpiarFormyCambiarVista = (nuevaVista) => {
    setForm({ usuario: "", email: "", password: "" });
    setMensaje("");
    setVista(nuevaVista);
  };

  const handleAccion = async () => {
    setMensaje("");
    try {
      if (vista === "login") {
        const res = await axios.post("http://localhost:3001/login", { usuario: form.usuario, password: form.password });
        if (res.data.success) {
          localStorage.setItem("usuarioLogueado", JSON.stringify(res.data.user));
          navigate("/inicio"); // Redirige a la gestión de empresas
        }
      } else if (vista === "registro") {
        const res = await axios.post("http://localhost:3001/register", form);
        alert(res.data.message);
        limpiarFormyCambiarVista("login");
      } else if (vista === "forgotUser") {
        const res = await axios.post("http://localhost:3001/forgot-username", { email: form.email });
        setMensaje(res.data.message);
      } else if (vista === "forgotPass") {
        const res = await axios.post("http://localhost:3001/forgot-password", { usuario: form.usuario, email: form.email });
        setMensaje(res.data.message);
      }
    } catch (error) {
      setMensaje(error.response?.data?.message || "Ocurrió un error inesperado.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>FINANCIAL SOLUTIONS</h1>
        <p style={styles.sub}>
          {vista === "login" && "Inicia sesión en la plataforma"}
          {vista === "registro" && "Crea una nueva cuenta"}
          {vista === "forgotUser" && "Recupera tu nombre de usuario"}
          {vista === "forgotPass" && "Recupera tu contraseña"}
        </p>

        {mensaje && <div style={styles.alert}>{mensaje}</div>}

        <div style={styles.form}>
          {(vista === "login" || vista === "registro" || vista === "forgotPass") && (
            <input
              placeholder="Nombre de Usuario"
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              style={styles.input}
            />
          )}

          {(vista === "registro" || vista === "forgotUser" || vista === "forgotPass") && (
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input}
            />
          )}

          {(vista === "login" || vista === "registro") && (
            <input
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
            />
          )}

          <button onClick={handleAccion} style={styles.btnPrimary}>
            {vista === "login" && "Ingresar"}
            {vista === "registro" && "Registrarse"}
            {vista === "forgotUser" && "Buscar Usuario"}
            {vista === "forgotPass" && "Buscar Contraseña"}
          </button>
        </div>

        <div style={styles.footerLinks}>
          {vista === "login" ? (
            <>
              <span onClick={() => limpiarFormyCambiarVista("registro")} style={styles.link}>Crear Usuario</span>
              <span onClick={() => limpiarFormyCambiarVista("forgotUser")} style={styles.link}>¿Olvidaste tu usuario?</span>
              <span onClick={() => limpiarFormyCambiarVista("forgotPass")} style={styles.link}>¿Olvidaste tu contraseña?</span>
            </>
          ) : (
            <span onClick={() => limpiarFormyCambiarVista("login")} style={styles.link}>Volver al Login</span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, sans-serif", padding: "20px" },
  card: { background: "#ffffff", padding: "40px", borderRadius: "12px", border: "1px solid #e2e8f0", maxWidth: "420px", width: "100%", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
  title: { fontSize: "24px", fontWeight: "700", color: "#0f172a", textAlign: "center", margin: 0 },
  sub: { color: "#64748b", fontSize: "14px", textAlign: "center", marginTop: "6px", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  input: { padding: "12px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" },
  btnPrimary: { background: "#1e293b", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "14px", marginTop: "8px" },
  footerLinks: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px", textAlign: "center", fontSize: "13px" },
  link: { color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: "500" },
  alert: { backgroundColor: "#f1f5f9", color: "#334155", padding: "12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px", textAlign: "center", border: "1px solid #e2e8f0", fontWeight: "500" }
};