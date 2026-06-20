import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Clasificación con plan de cuentas 4 dígitos ──────────────────────────
const CLASIFICACION = {
  // ACTIVOS CORRIENTES
  "1010": "activoCorriente", "1020": "activoCorriente", "1030": "activoCorriente",
  "1040": "activoCorriente", "1050": "activoCorriente", "1060": "activoCorriente",
  "1070": "activoCorriente", "1080": "activoCorriente", "1090": "activoCorriente",
  "1100": "activoCorriente",
  // ACTIVOS NO CORRIENTES
  "1200": "activoNoCorriente", "1210": "activoNoCorriente", "1220": "activoNoCorriente",
  "1230": "activoNoCorriente", "1240": "activoNoCorriente", "1250": "activoNoCorriente",
  "1260": "activoNoCorriente",
  // PASIVOS CORRIENTES
  "2010": "pasivoCorriente", "2020": "pasivoCorriente", "2030": "pasivoCorriente",
  "2040": "pasivoCorriente", "2050": "pasivoCorriente", "2060": "pasivoCorriente",
  "2070": "pasivoCorriente",
  // PASIVOS NO CORRIENTES
  "2100": "pasivoNoCorriente", "2110": "pasivoNoCorriente",
  // PATRIMONIO
  "3010": "patrimonio", "3020": "patrimonio", "3030": "patrimonio", "3040": "patrimonio",
};

const clasificarCuenta = (codigo) => {
  if (CLASIFICACION[codigo]) return CLASIFICACION[codigo];
  // fallback por rango numérico
  const n = parseInt(codigo, 10);
  if (n >= 1000 && n <= 1199) return "activoCorriente";
  if (n >= 1200 && n <= 1999) return "activoNoCorriente";
  if (n >= 2000 && n <= 2099) return "pasivoCorriente";
  if (n >= 2100 && n <= 2999) return "pasivoNoCorriente";
  if (codigo.startsWith("3"))  return "patrimonio";
  return null;
};

export default function BalanceGeneral() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [empresa, setEmpresa]         = useState(null);

  useEffect(() => {
    const empresaActiva = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!empresaActiva) { navigate("/"); return; }
    setEmpresa(empresaActiva);
    axios.get(`https://sistema-contable-backend-f67j.onrender.com/movimientos/${empresaActiva.id}`)
      .then((res) => setMovimientos(res.data))
      .catch((err) => console.error("Error al cargar balance:", err));
  }, [navigate]);

  const calcularSaldos = (movs, naturaleza) => {
    const cuentas = {};
    movs.forEach((m) => {
      const cod = String(m.codigoCuenta);
      if (!cuentas[cod]) cuentas[cod] = { codigoCuenta: cod, cuenta: m.cuenta, saldo: 0 };
      const deb = Number(m.debito || 0);
      const cre = Number(m.credito || 0);
      cuentas[cod].saldo += naturaleza === "D" ? deb - cre : cre - deb;
    });
    return Object.values(cuentas).filter((c) => Math.abs(c.saldo) > 0.001);
  };

  const todosActivos    = calcularSaldos(movimientos.filter((m) => String(m.codigoCuenta).startsWith("1")), "D");
  const todosPasivos    = calcularSaldos(movimientos.filter((m) => String(m.codigoCuenta).startsWith("2")), "H");
  const todosPatrimonio = calcularSaldos(movimientos.filter((m) => String(m.codigoCuenta).startsWith("3")), "H");

  const activosCorrientes   = todosActivos.filter((c) => clasificarCuenta(c.codigoCuenta) === "activoCorriente");
  const activosNoCorrientes = todosActivos.filter((c) => clasificarCuenta(c.codigoCuenta) === "activoNoCorriente");
  const pasivosCorrientes   = todosPasivos.filter((c) => clasificarCuenta(c.codigoCuenta) === "pasivoCorriente");
  const pasivosNoCorrientes = todosPasivos.filter((c) => clasificarCuenta(c.codigoCuenta) === "pasivoNoCorriente");

  const totalActivoCorriente   = activosCorrientes.reduce((a, c) => a + c.saldo, 0);
  const totalActivoNoCorriente = activosNoCorrientes.reduce((a, c) => a + c.saldo, 0);
  const totalActivos           = totalActivoCorriente + totalActivoNoCorriente;

  const totalPasivoCorriente   = pasivosCorrientes.reduce((a, c) => a + c.saldo, 0);
  const totalPasivoNoCorriente = pasivosNoCorrientes.reduce((a, c) => a + c.saldo, 0);
  const totalPasivos           = totalPasivoCorriente + totalPasivoNoCorriente;

  const patrimonioBase = todosPatrimonio.reduce((a, c) => a + c.saldo, 0);

  const totalIngresos = movimientos
    .filter((m) => String(m.codigoCuenta).startsWith("4"))
    .reduce((a, m) => a + (Number(m.credito || 0) - Number(m.debito || 0)), 0);
  const totalGastos = movimientos
    .filter((m) => ["5","6","7"].some((p) => String(m.codigoCuenta).startsWith(p)))
    .reduce((a, m) => a + (Number(m.debito || 0) - Number(m.credito || 0)), 0);

  const utilidad          = totalIngresos - totalGastos;
  const totalPatrimonio   = patrimonioBase + utilidad;
  const totalPasivoPatrim = totalPasivos + totalPatrimonio;
  const balanceCuadrado   = Math.abs(totalActivos - totalPasivoPatrim) < 0.01;

  const FilaCuenta = ({ cuenta }) => (
    <div style={s.fila}>
      <span style={s.filaLabel}>{cuenta.codigoCuenta} — {cuenta.cuenta}</span>
      <span style={s.filaMonto}>B/. {formatoMoneda(cuenta.saldo)}</span>
    </div>
  );

  const SubSeccion = ({ titulo }) => <div style={s.subSeccion}>{titulo}</div>;

  const FilaSubtotal = ({ label, monto }) => (
    <div style={s.filaSubtotal}>
      <span style={s.filaSubtotalLabel}>{label}</span>
      <span style={s.filaSubtotalMonto}>B/. {formatoMoneda(monto)}</span>
    </div>
  );

  const FilaTotal = ({ label, monto }) => (
    <div style={s.filaTotal}>
      <span>{label}</span>
      <span>B/. {formatoMoneda(monto)}</span>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{s.cssImpresion}</style>

      {empresa && (
        <div style={s.empresaHeader} className="print-header-block">
          <h2 style={s.empresaNombre}>{empresa.nombre}</h2>
          <p style={s.empresaPeriodo}>
            Balance General
            <span style={{ color: "#cbd5e1", margin: "0 8px" }}>|</span>
            Periodo Contable: {empresa.periodo_inicio?.split("T")[0]} al {empresa.periodo_fin?.split("T")[0]}
          </p>
          <div style={s.actionRow} className="no-print">
            <div style={s.btnGroup}>
              <button style={s.btnNav} onClick={() => navigate("/diario")}>Libro Diario</button>
              <button style={s.btnNav} onClick={() => navigate("/mayorizar")}>Mayorización</button>
              <button style={s.btnNav} onClick={() => navigate("/resultados")}>Estado Resultado</button>
              <button style={{ ...s.btnNav, ...s.btnNavActive }} onClick={() => navigate("/balance")}>Balance General</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={s.moneda}>Balboas (B/.)</span>
              <button style={s.btnPrint} onClick={() => window.print()}>Imprimir / PDF</button>
              <button style={s.btnDanger} onClick={() => navigate("/inicio")}>Cambiar Empresa</button>
              <button style={s.btnDanger} onClick={() => navigate("/")}>Cerrar sesión</button>
            </div>
          </div>
          <h3 className="only-print" style={s.tituloReportePdf}>BALANCE GENERAL — REPORTE OFICIAL</h3>
        </div>
      )}

      <div style={s.dosColumnas} className="print-balance">

        {/* ── ACTIVOS ── */}
        <div style={s.columna}>
          <div style={s.columnaHeader}>ACTIVO</div>

          {activosCorrientes.length > 0 && (
            <>
              <SubSeccion titulo="ACTIVO CORRIENTE" />
              {activosCorrientes.map((c) => <FilaCuenta key={c.codigoCuenta} cuenta={c} />)}
              <FilaSubtotal label="TOTAL ACTIVO CORRIENTE" monto={totalActivoCorriente} />
            </>
          )}

          {activosNoCorrientes.length > 0 && (
            <>
              <SubSeccion titulo="ACTIVO NO CORRIENTE" />
              {activosNoCorrientes.map((c) => <FilaCuenta key={c.codigoCuenta} cuenta={c} />)}
              <FilaSubtotal label="TOTAL ACTIVO NO CORRIENTE" monto={totalActivoNoCorriente} />
            </>
          )}

          <FilaTotal label="TOTAL ACTIVO" monto={totalActivos} />
        </div>

        {/* ── PASIVO + PATRIMONIO ── */}
        <div style={{ ...s.columna, borderLeft: "1px solid #e2e8f0" }}>
          <div style={s.columnaHeader}>PASIVO Y PATRIMONIO</div>

          {pasivosCorrientes.length > 0 && (
            <>
              <SubSeccion titulo="PASIVO CORRIENTE" />
              {pasivosCorrientes.map((c) => <FilaCuenta key={c.codigoCuenta} cuenta={c} />)}
              <FilaSubtotal label="TOTAL PASIVO CORRIENTE" monto={totalPasivoCorriente} />
            </>
          )}

          {pasivosNoCorrientes.length > 0 && (
            <>
              <SubSeccion titulo="PASIVO NO CORRIENTE" />
              {pasivosNoCorrientes.map((c) => <FilaCuenta key={c.codigoCuenta} cuenta={c} />)}
              <FilaSubtotal label="TOTAL PASIVO NO CORRIENTE" monto={totalPasivoNoCorriente} />
            </>
          )}

          {totalPasivos > 0 && <FilaTotal label="TOTAL PASIVO" monto={totalPasivos} />}

          <SubSeccion titulo="PATRIMONIO" />
          {todosPatrimonio.map((c) => <FilaCuenta key={c.codigoCuenta} cuenta={c} />)}
          <div style={s.fila}>
            <span style={s.filaLabel}>Utilidad del Período</span>
            <span style={{ ...s.filaMonto, color: utilidad >= 0 ? "#15803d" : "#dc2626" }}>
              B/. {formatoMoneda(utilidad)}
            </span>
          </div>
          <FilaSubtotal label="TOTAL PATRIMONIO" monto={totalPatrimonio} />
          <FilaTotal label="TOTAL PASIVO Y PATRIMONIO" monto={totalPasivoPatrim} />
        </div>
      </div>

      {/* Verificación */}
      <div style={s.verificacion}>
        <div style={s.verCol}>
          <span style={s.verLabel}>TOTAL ACTIVOS</span>
          <span style={s.verMonto}>B/. {formatoMoneda(totalActivos)}</span>
        </div>
        <div style={s.verSeparador} />
        <div style={s.verCol}>
          <span style={s.verLabel}>TOTAL PASIVO Y PATRIMONIO</span>
          <span style={s.verMonto}>B/. {formatoMoneda(totalPasivoPatrim)}</span>
        </div>
        <div style={s.verSeparador} />
        <div style={balanceCuadrado ? s.verOk : s.verError}>
          {balanceCuadrado ? "✅ Balance Cuadrado" : "❌ Balance Descuadrado"}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },
  empresaHeader: { background: "white", padding: "30px 32px", borderRadius: "16px", marginBottom: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.05)" },
  empresaNombre: { margin: 0, color: "#000", fontSize: "32px", fontWeight: "700", letterSpacing: "-0.025em" },
  empresaPeriodo: { margin: "6px 0 24px", color: "#64748b", fontSize: "15px" },
  tituloReportePdf: { margin: "15px 0 0", color: "#1f2937", borderTop: "2px dashed #e2e8f0", paddingTop: "10px", fontSize: "16px", fontWeight: "bold" },
  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  btnGroup: { display: "flex", gap: "10px", flexWrap: "wrap" },
  btnNav: { background: "#f1f5f9", color: "#334155", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" },
  btnNavActive: { background: "#1e293b", color: "white", fontWeight: "600" },
  btnDanger: { background: "white", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" },
  btnPrint: { background: "#64748b", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  moneda: { fontWeight: "700", color: "#475569", fontSize: "14px" },
  dosColumnas: { display: "grid", gridTemplateColumns: "1fr 1fr", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "20px" },
  columna: { padding: "0 0 24px 0" },
  columnaHeader: { background: "#0f172a", color: "white", fontWeight: "800", fontSize: "14px", letterSpacing: "0.1em", textAlign: "center", padding: "14px 20px" },
  subSeccion: { padding: "12px 24px 8px", fontSize: "12px", fontWeight: "800", color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #e2e8f0", marginTop: "4px", background: "#f0f9ff" },
  fila: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", borderBottom: "1px solid #f8fafc" },
  filaLabel: { fontSize: "14px", color: "#334155", fontWeight: "400" },
  filaMonto: { fontSize: "14px", fontFamily: "monospace", fontWeight: "600", color: "#0f172a" },
  filaSubtotal: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", borderTop: "1px solid #cbd5e1", borderBottom: "2px solid #cbd5e1", background: "#f8fafc", margin: "0 0 4px 0" },
  filaSubtotalLabel: { fontSize: "13px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" },
  filaSubtotalMonto: { fontSize: "14px", fontFamily: "monospace", fontWeight: "800", color: "#0f172a" },
  filaTotal: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", background: "#0f172a", color: "white", fontWeight: "800", fontSize: "14px", fontFamily: "monospace", marginTop: "8px", letterSpacing: "0.03em" },
  verificacion: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" },
  verCol: { display: "flex", flexDirection: "column", gap: "4px" },
  verLabel: { fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" },
  verMonto: { fontSize: "20px", fontWeight: "800", fontFamily: "monospace", color: "#0f172a" },
  verSeparador: { width: "1px", height: "40px", background: "#e2e8f0" },
  verOk:    { background: "#dcfce7", color: "#15803d", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px" },
  verError: { background: "#fee2e2", color: "#b91c1c", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px" },
  cssImpresion: `
    .only-print { display: none; }
    @media print {
      @page { size: A4 landscape; margin: 12mm 10mm; }
      body { background: #fff !important; color: #000 !important; font-size: 10pt; }
      .no-print { display: none !important; }
      .only-print { display: block !important; }
      .print-header-block { border: none !important; padding: 0 0 12px 0 !important; margin-bottom: 20px !important; border-bottom: 2px solid #000 !important; border-radius: 0 !important; box-shadow: none !important; }
      .print-header-block h2 { font-size: 22px !important; }
      .print-balance { border: 1px solid #000 !important; border-radius: 0 !important; }
    }
  `,
};
