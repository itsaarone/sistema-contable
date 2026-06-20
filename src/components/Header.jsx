import { useNavigate } from "react-router-dom";

export default function Header({
  titulo,
}) {
  const navigate = useNavigate();

  const fechaActual =
    new Date().toLocaleDateString(
      "es-PA"
    );

  return (
    <div style={styles.top}>
      <div>
        <p style={styles.fecha}>
          Fecha Actual:
          {fechaActual}
        </p>

        <h1 style={styles.titulo}>
          {titulo}
        </h1>

      </div>

      <div style={styles.buttons}>


      </div>
    </div>
  );
}

const styles = {
  top: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "start",
    marginBottom: "30px",
  },

  fecha: {
    color: "#374151",
    fontWeight: "bold",
  },

  titulo: {
    fontSize: "52px",
    color: "#1d4ed8",
    marginTop: "10px",
  },

  company: {
    color: "#6b7280",
    marginTop: "10px",
  },

  periodo: {
    marginTop: "10px",
    fontWeight: "bold",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  button: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
  },

  buttonBlue: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
  },

  buttonGreen: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
  },
};