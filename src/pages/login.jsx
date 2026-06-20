import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://sistema-contable-backend-f67j.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const [vista, setVista] = useState("login");
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
        const res = await axios.post(`${API}/login`, { usuario: form.usuario, password: form.password });
        if (res.data.success) {
          localStorage.setItem("usuarioLogueado", JSON.stringify(res.data.user));
          if (res.data.user.usuario === "admin") navigate("/admin");
          else navigate("/inicio");
        }
      } else if (vista === "registro") {
        const res = await axios.post(`${API}/register`, form);
        alert(res.data.message);
        limpiarFormyCambiarVista("login");
      } else if (vista === "forgotUser") {
        const res = await axios.post(`${API}/forgot-username`, { email: form.email });
        setMensaje(res.data.message);
      } else if (vista === "forgotPass") {
        const res = await axios.post(`${API}/forgot-password`, { usuario: form.usuario, email: form.email });
        setMensaje(res.data.message);
      }
    } catch (error) {
      setMensaje(error.response?.data?.message || "Ocurrió un error inesperado.");
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleAccion(); };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>📊</div>
          <h1 style={styles.title}>FINANCIAL SOLUTIONS</h1>
          <p style={styles.sub}>
            {vista === "login" && "Inicia sesión en la plataforma"}
            {vista === "registro" && "Crea una nueva cuenta"}
            {vista === "forgotUser" && "Recupera tu nombre de usuario"}
            {vista === "forgotPass" && "Recupera tu contraseña"}
          </p>
        </div>

        {mensaje && <div style={styles.alert}>{mensaje}</div>}

        <div style={styles.form} onKeyDown={handleKeyDown}>
          {(vista === "login" || vista === "registro" || vista === "forgotPass") && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario</label>
              <input placeholder="Nombre de usuario" value={form.usuario}
                onChange={(e) => setForm({ ...form, usuario: e.target.value })} style={styles.input} />
            </div>
          )}
          {(vista === "registro" || vista === "forgotUser" || vista === "forgotPass") && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Correo Electrónico</label>
              <input type="email" placeholder="correo@ejemplo.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
            </div>
          )}
          {(vista === "login" || vista === "registro") && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} />
            </div>
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
              <span onClick={() => limpiarFormyCambiarVista("registro")} style={styles.link}>Crear cuenta</span>
              <span style={styles.dot}>·</span>
              <span onClick={() => limpiarFormyCambiarVista("forgotUser")} style={styles.link}>¿Olvidaste tu usuario?</span>
              <span style={styles.dot}>·</span>
              <span onClick={() => limpiarFormyCambiarVista("forgotPass")} style={styles.link}>¿Olvidaste tu contraseña?</span>
            </>
          ) : (
            <span onClick={() => limpiarFormyCambiarVista("login")} style={styles.link}>← Volver al Login</span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  card: { background: "white", padding: "clamp(24px, 5vw, 48px)", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" },
  logoArea: { textAlign: "center", marginBottom: "28px" },
  logoIcon: { fontSize: "40px", marginBottom: "8px" },
  title: { fontSize: "clamp(18px, 4vw, 22px)", fontWeight: "800", color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" },
  sub: { color: "#64748b", fontSize: "14px", margin: 0 },
  alert: { backgroundColor: "#f0f9ff", color: "#0369a1", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", textAlign: "center", border: "1px solid #bae6fd", fontWeight: "500" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: { padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box" },
  btnPrimary: { background: "#1e293b", color: "#fff", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px", marginTop: "4px", letterSpacing: "0.01em" },
  footerLinks: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", marginTop: "24px", fontSize: "13px" },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: "500" },
  dot: { color: "#cbd5e1" },
};
