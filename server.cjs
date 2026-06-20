const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "thomas.proxy.rlwy.net",
  port: 50315,
  user: "root",
  password: "tSzTqKPyyskpfdPBJCjioJMotusueEvw",
  database: "railway",
});

db.connect((err) => {
  if (err) console.log("Error de conexión a MySQL:", err);
  else console.log("MYSQL CONECTADO");
});

/* ================= EMPRESAS (filtradas por usuario) ================= */

app.get("/empresas/:usuarioId", (req, res) => {
  db.query("SELECT * FROM empresas WHERE usuario_id = ?", [req.params.usuarioId], (err, result) => {
    if (err) res.status(500).send(err); else res.send(result);
  });
});

app.post("/empresas", (req, res) => {
  const { nombre, periodo_inicio, periodo_fin, usuario_id } = req.body;
  db.query(
    "INSERT INTO empresas (nombre, periodo_inicio, periodo_fin, usuario_id) VALUES (?, ?, ?, ?)",
    [nombre, periodo_inicio, periodo_fin, usuario_id],
    (err, result) => { if (err) res.status(500).send(err); else res.send(result); }
  );
});

app.put("/empresas/:id", (req, res) => {
  const { nombre, periodo_inicio, periodo_fin } = req.body;
  db.query(
    "UPDATE empresas SET nombre=?, periodo_inicio=?, periodo_fin=? WHERE id=?",
    [nombre, periodo_inicio, periodo_fin, req.params.id],
    (err, result) => { if (err) res.status(500).send(err); else res.send(result); }
  );
});

app.delete("/empresas/:id", (req, res) => {
  db.query("DELETE FROM empresas WHERE id=?", [req.params.id], (err, result) => {
    if (err) res.status(500).send(err); else res.send(result);
  });
});

/* ================= MOVIMIENTOS ================= */

app.get("/movimientos/:empresaId", (req, res) => {
  db.query("SELECT * FROM movimientos WHERE empresa_id = ?", [req.params.empresaId], (err, result) => {
    if (err) res.status(500).send(err); else res.send(result);
  });
});

app.post("/movimientos", (req, res) => {
  const { id, empresa_id, fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta } = req.body;
  if (id && !isNaN(id)) {
    db.query(
      `UPDATE movimientos SET fecha=?, codigoCuenta=?, cuenta=?, descripcion=?, debito=?, credito=?, tipoCuenta=? WHERE id=?`,
      [fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta, id],
      (err) => { if (err) res.status(500).send(err); else res.send({ message: "Movimiento actualizado", id }); }
    );
  } else {
    db.query(
      `INSERT INTO movimientos (empresa_id, fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta],
      (err, result) => { if (err) res.status(500).send(err); else res.send({ id: result.insertId, message: "Movimiento guardado" }); }
    );
  }
});

app.delete("/movimientos/:id", (req, res) => {
  db.query("DELETE FROM movimientos WHERE id = ?", [req.params.id], (err, result) => {
    if (err) res.status(500).send(err); else res.send(result);
  });
});

/* ================= AUTENTICACIÓN ================= */

app.post("/register", (req, res) => {
  const { usuario, email, password } = req.body;
  if (!usuario || !email || !password)
    return res.status(400).send({ message: "Todos los campos son obligatorios" });
  db.query(
    "INSERT INTO usuarios (usuario, email, password) VALUES (?, ?, ?)",
    [usuario, email, password],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") res.status(400).send({ message: "El usuario o correo ya están registrados" });
        else res.status(500).send(err);
      } else res.send({ message: "Usuario registrado con éxito" });
    }
  );
});

app.post("/login", (req, res) => {
  const { usuario, password } = req.body;
  db.query(
    "SELECT * FROM usuarios WHERE usuario = ? AND password = ?",
    [usuario, password],
    (err, result) => {
      if (err) res.status(500).send(err);
      else if (result.length > 0) res.send({ success: true, message: "Ingreso exitoso", user: result[0] });
      else res.status(401).send({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  );
});

app.post("/forgot-username", (req, res) => {
  const { email } = req.body;
  db.query("SELECT usuario FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) res.status(500).send(err);
    else if (result.length > 0) res.send({ message: `Tu nombre de usuario es: ${result[0].usuario}` });
    else res.status(404).send({ message: "El correo electrónico no está registrado" });
  });
});

app.post("/forgot-password", (req, res) => {
  const { usuario, email } = req.body;
  db.query("SELECT password FROM usuarios WHERE usuario = ? AND email = ?", [usuario, email], (err, result) => {
    if (err) res.status(500).send(err);
    else if (result.length > 0) res.send({ message: `Tu contraseña es: ${result[0].password}` });
    else res.status(404).send({ message: "Datos incorrectos. No se encontró el usuario." });
  });
});

/* ================= ADMIN ================= */

// Obtener todos los usuarios con conteo de empresas
app.get("/admin/usuarios", (req, res) => {
  db.query(
    `SELECT u.id, u.usuario, u.email, COUNT(e.id) as total_empresas
     FROM usuarios u
     LEFT JOIN empresas e ON e.usuario_id = u.id
     GROUP BY u.id`,
    (err, result) => { if (err) res.status(500).send(err); else res.send(result); }
  );
});

// Eliminar usuario (y sus empresas/movimientos por CASCADE)
app.delete("/admin/usuarios/:id", (req, res) => {
  db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id], (err, result) => {
    if (err) res.status(500).send(err); else res.send(result);
  });
});

// Crear usuario desde admin
app.post("/admin/usuarios", (req, res) => {
  const { usuario, email, password } = req.body;
  db.query(
    "INSERT INTO usuarios (usuario, email, password) VALUES (?, ?, ?)",
    [usuario, email, password],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") res.status(400).send({ message: "El usuario o correo ya existen" });
        else res.status(500).send(err);
      } else res.send({ message: "Usuario creado", id: result.insertId });
    }
  );
});

// Estadísticas generales
app.get("/admin/stats", (req, res) => {
  db.query("SELECT COUNT(*) as total FROM usuarios", (err, usuarios) => {
    if (err) return res.status(500).send(err);
    db.query("SELECT COUNT(*) as total FROM empresas", (err2, empresas) => {
      if (err2) return res.status(500).send(err2);
      db.query("SELECT COUNT(*) as total FROM movimientos", (err3, movimientos) => {
        if (err3) return res.status(500).send(err3);
        res.send({
          usuarios: usuarios[0].total,
          empresas: empresas[0].total,
          movimientos: movimientos[0].total,
        });
      });
    });
  });
});

app.listen(3001, () => console.log("Servidor corriendo en puerto 3001"));
