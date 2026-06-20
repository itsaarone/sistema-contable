import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

export default function Mayorizar() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [empresa, setEmpresa]         = useState(null);

  useEffect(() => {
    const empresaActiva = JSON.parse(localStorage.getItem("empresaActiva"));
    if (empresaActiva) {
      setEmpresa(empresaActiva);
      axios.get(`https://sistema-contable-backend-f67j.onrender.com/movimientos/${empresaActiva.id}`)
        .then((res) => setMovimientos(res.data))
        .catch((err) => console.log("Error:", err));
    } else { navigate("/"); }
  }, []);

  const cuentas = movimientos.reduce((acc, mov) => {
    if (!acc[mov.codigoCuenta]) acc[mov.codigoCuenta] = { cuenta: mov.cuenta, movimientos: [] };
    acc[mov.codigoCuenta].movimientos.push(mov);
    return acc;
  }, {});

  return (
    <div style={s.page}>
      <style>{s.cssImpresion}</style>

      {empresa && (
        <div style={s.empresaHeader} className="print-header-block">
          <h2 style={s.empresaNombre}>{empresa.nombre}</h2>
          <p style={s.empresaPeriodo}>
            Libro Mayor — Mayorización de Cuentas
            <span style={{ color: "#cbd5e1", margin: "0 8px" }}>|</span>
            Periodo Contable: {empresa.periodo_inicio?.split("T")[0]} al {empresa.periodo_fin?.split("T")[0]}
          </p>
          <div style={s.actionRow} className="no-print">
            <div style={s.btnGroup}>
              <button style={s.btnNav} onClick={() => navigate("/diario")}>Libro Diario</button>
              <button style={{ ...s.btnNav, ...s.btnNavActive }} onClick={() => navigate("/mayorizar")}>Mayorización</button>
              <button style={s.btnNav} onClick={() => navigate("/resultados")}>Estado Resultado</button>
              <button style={s.btnNav} onClick={() => navigate("/balance")}>Balance General</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={s.moneda}>Balboas (B/.)</span>
              <button style={s.btnPrint} onClick={() => window.print()}>Imprimir / PDF</button>
              <button style={s.btnDanger} onClick={() => navigate("/inicio")}>Cambiar Empresa</button>
              <button style={s.btnDanger} onClick={() => navigate("/")}>Cerrar sesión</button>
            </div>
          </div>
          <h3 className="only-print" style={s.tituloReportePdf}>LIBRO MAYOR — REPORTE OFICIAL</h3>
        </div>
      )}

      <div style={s.grid} className="print-main-container">
        {Object.keys(cuentas).sort().map((codigo) => {
          const esAcreedora = codigo.startsWith("2") || codigo.startsWith("3") || codigo.startsWith("4");
          let saldo = 0, totalDebe = 0, totalHaber = 0;

          const filas = cuentas[codigo].movimientos.map((m, i) => {
            const deb = Number(m.debito)  || 0;
            const cre = Number(m.credito) || 0;
            totalDebe  += deb;
            totalHaber += cre;
            saldo += esAcreedora ? (cre - deb) : (deb - cre);
            return { ...m, deb, cre, saldo, i };
          });

          const saldoNombre = esAcreedora ? "Saldo Acreedor" : "Saldo Deudor";

          return (
            <div key={codigo} style={s.card} className="mayor-card-block">
              <div style={s.cuentaHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={s.cuentaCodigo}>{codigo}</span>
                  <span style={s.cuentaNombre}>{cuentas[codigo].cuenta}</span>
                </div>
                <span style={s.cuentaTipo}>{saldoNombre}</span>
              </div>

              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: "13%", textAlign: "center" }}>Fecha</th>
                    <th style={s.th}>Concepto</th>
                    <th style={{ ...s.th, ...s.thR, width: "17%" }}>Debe</th>
                    <th style={{ ...s.th, ...s.thR, width: "17%" }}>Haber</th>
                    <th style={{ ...s.th, ...s.thR, width: "17%" }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map(({ i, deb, cre, saldo: s_, ...m }) => (
                    <tr key={i} style={s.tr}>
                      <td style={s.tdFecha}>{m.fecha ? String(m.fecha).split("T")[0] : ""}</td>
                      <td style={s.tdConcepto}>{m.descripcion || "—"}</td>
                      <td style={s.tdMonto}>{deb > 0 ? `B/. ${formatoMoneda(deb)}` : ""}</td>
                      <td style={s.tdMonto}>{cre > 0 ? `B/. ${formatoMoneda(cre)}` : ""}</td>
                      <td style={s.tdSaldo}>B/. {formatoMoneda(s_)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={s.trTotal}>
                    <td colSpan={2} style={s.tdTotalLabel}>SUMAS IGUALES</td>
                    <td style={s.tdTotal}>B/. {formatoMoneda(totalDebe)}</td>
                    <td style={s.tdTotal}>B/. {formatoMoneda(totalHaber)}</td>
                    <td style={{ ...s.tdTotal, color: "#0f172a" }}>
                      B/. {formatoMoneda(Math.abs(filas[filas.length - 1]?.saldo ?? 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
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
  grid: { display: "flex", flexDirection: "column", gap: "20px" },
  card: { background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" },
  cuentaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "2px solid #0f172a", background: "#f8fafc" },
  cuentaCodigo: { fontFamily: "monospace", fontWeight: "800", fontSize: "14px", background: "#0f172a", color: "white", padding: "3px 10px", borderRadius: "4px" },
  cuentaNombre: { fontWeight: "700", fontSize: "15px", color: "#0f172a" },
  cuentaTipo: { fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", border: "1px solid #cbd5e1", padding: "3px 10px", borderRadius: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "11px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" },
  thR: { textAlign: "right" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  trTotal: { borderTop: "2px solid #0f172a", background: "#f8fafc" },
  tdFecha:   { padding: "13px 16px", color: "#64748b", fontSize: "14.5px", textAlign: "center", whiteSpace: "nowrap" },
  tdConcepto:{ padding: "13px 16px", color: "#334155", fontSize: "15px", fontWeight: "500" },
  tdMonto:   { padding: "13px 16px", fontSize: "15px", textAlign: "right", fontFamily: "monospace", fontWeight: "600", color: "#0f172a" },
  tdSaldo:   { padding: "13px 16px", fontSize: "15px", textAlign: "right", fontFamily: "monospace", fontWeight: "700", color: "#0369a1", borderLeft: "1px solid #e2e8f0" },
  tdTotalLabel: { padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" },
  tdTotal:   { padding: "12px 16px", fontSize: "15px", textAlign: "right", fontFamily: "monospace", fontWeight: "800", color: "#0f172a" },
  cssImpresion: `
    .only-print { display: none; }
    @media print {
      @page { size: A4 portrait; margin: 15mm 12mm; }
      body { background: #fff !important; color: #000 !important; font-size: 10pt; }
      .no-print { display: none !important; }
      .only-print { display: block !important; }
      .print-header-block { border: none !important; padding: 0 0 15px 0 !important; margin-bottom: 20px !important; border-bottom: 2px solid #000 !important; border-radius: 0 !important; box-shadow: none !important; }
      .print-header-block h2 { font-size: 22px !important; }
      .print-main-container { display: block !important; width: 100% !important; }
      .mayor-card-block { border: 1px solid #94a3b8 !important; margin-bottom: 24px !important; page-break-inside: avoid !important; border-radius: 0 !important; box-shadow: none !important; }
      th { background-color: #f8fafc !important; color: #000 !important; border-bottom: 1px solid #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      td { color: #000 !important; }
      tfoot tr { border-top: 2px solid #000 !important; }
    }
  `,
};
