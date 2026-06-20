const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sistema_contable",
});

db.connect((err) => {
  if (err) {
    console.log("Error de conexión a MySQL:", err);
  } else {
    console.log("MYSQL CONECTADO");
  }
});

/* ================= RUTAS DE EMPRESAS ================= */

app.get("/empresas", (req, res) => {
  db.query("SELECT * FROM empresas", (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/empresas", (req, res) => {
  const { nombre, periodo_inicio, periodo_fin } = req.body;
  db.query(
    "INSERT INTO empresas (nombre, periodo_inicio, periodo_fin) VALUES (?, ?, ?)",
    [nombre, periodo_inicio, periodo_fin],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.put("/empresas/:id", (req, res) => {
  const { nombre, periodo_inicio, periodo_fin } = req.body;
  db.query(
    "UPDATE empresas SET nombre=?, periodo_inicio=?, periodo_fin=? WHERE id=?",
    [nombre, periodo_inicio, periodo_fin, req.params.id],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/empresas/:id", (req, res) => {
  db.query("DELETE FROM empresas WHERE id=?", [req.params.id], (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

/* ================= RUTAS DE MOVIMIENTOS ================= */

app.get("/movimientos/:empresaId", (req, res) => {
  db.query(
    "SELECT * FROM movimientos WHERE empresa_id = ?",
    [req.params.empresaId],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/movimientos", (req, res) => {
  const { id, empresa_id, fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta } = req.body;

  if (id && !isNaN(id)) {
    db.query(
      `UPDATE movimientos 
       SET fecha=?, codigoCuenta=?, cuenta=?, descripcion=?, debito=?, credito=?, tipoCuenta=? 
       WHERE id=?`,
      [fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta, id],
      (err, result) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send({ message: "Movimiento actualizado", id });
        }
      }
    );
  } else {
    db.query(
      `INSERT INTO movimientos (empresa_id, fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, fecha, codigoCuenta, cuenta, descripcion, debito, credito, tipoCuenta],
      (err, result) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send({ id: result.insertId, message: "Movimiento guardado con éxito" });
        }
      }
    );
  }
});

app.delete("/movimientos/:id", (req, res) => {
  db.query("DELETE FROM movimientos WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(result);
    }
  });
});
/* ================= RUTAS DE AUTENTICACIÓN Y USUARIOS ================= */

// 1. Registro de usuarios
app.post("/register", (req, res) => {
  const { usuario, email, password } = req.body;
  if (!usuario || !email || !password) {
    return res.status(400).send({ message: "Todos los campos son obligatorios" });
  }

  db.query(
    "INSERT INTO usuarios (usuario, email, password) VALUES (?, ?, ?)",
    [usuario, email, password],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(400).send({ message: "El usuario o el correo ya están registrados" });
        } else {
          res.status(500).send(err);
        }
      } else {
        res.send({ message: "Usuario registrado con éxito" });
      }
    }
  );
});

// 2. Ingreso / Login
app.post("/login", (req, res) => {
  const { usuario, password } = req.body;
  db.query(
    "SELECT * FROM usuarios WHERE usuario = ? AND password = ?",
    [usuario, password],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length > 0) {
        res.send({ success: true, message: "Ingreso exitoso", user: result[0] });
      } else {
        res.status(401).send({ success: false, message: "Usuario o contraseña incorrectos" });
      }
    }
  );
});

// 3. Recuperar Usuario
app.post("/forgot-username", (req, res) => {
  const { email } = req.body;
  db.query("SELECT usuario FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else if (result.length > 0) {
      res.send({ message: `Tu nombre de usuario es: ${result[0].usuario}` });
    } else {
      res.status(404).send({ message: "El correo electrónico no está registrado" });
    }
  });
});

// 4. Recuperar Contraseña
app.post("/forgot-password", (req, res) => {
  const { usuario, email } = req.body;
  db.query(
    "SELECT password FROM usuarios WHERE usuario = ? AND email = ?",
    [usuario, email],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length > 0) {
        res.send({ message: `Tu contraseña es: ${result[0].password}` });
      } else {
        res.status(404).send({ message: "Datos incorrectos. No se encontró el usuario con ese correo." });
      }
    }
  );
});
app.listen(3001, () => {
  console.log("Servidor corriendo en puerto 3001");
});