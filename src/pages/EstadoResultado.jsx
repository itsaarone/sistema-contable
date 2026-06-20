import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatoMoneda = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function EstadoResultado() {
  const navigate = useNavigate();
  const [empresa, setEmpresa]   = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [costos, setCostos]     = useState([]);
  const [gastos, setGastos]     = useState([]);

  useEffect(() => {
    const empresaActiva = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!empresaActiva) { navigate("/"); return; }
    setEmpresa(empresaActiva);
    axios.get(`http://localhost:3001/movimientos/${empresaActiva.id}`)
      .then((res) => procesarResultados(res.data))
      .catch((err) => console.error("Error al cargar Estado de Resultados:", err));
  }, [navigate]);

  const procesarResultados = (movs) => {
    const mapaIngresos = {};
    const mapaCostos   = {};
    const mapaGastos   = {};

    movs.forEach((m) => {
      const cod = String(m.codigoCuenta);
      const deb = Number(m.debito  || 0);
      const cre = Number(m.credito || 0);

      if (cod.startsWith("4")) {
        // Ingresos — naturaleza acreedora
        if (!mapaIngresos[cod]) mapaIngresos[cod] = { codigo: cod, cuenta: m.cuenta, saldo: 0 };
        mapaIngresos[cod].saldo += cre - deb;
      } else if (cod.startsWith("6") || cod.startsWith("7")) {
        // Costos de ventas / producción
        if (!mapaCostos[cod]) mapaCostos[cod] = { codigo: cod, cuenta: m.cuenta, saldo: 0 };
        mapaCostos[cod].saldo += deb - cre;
      } else if (cod.startsWith("5")) {
        // Gastos operativos
        if (!mapaGastos[cod]) mapaGastos[cod] = { codigo: cod, cuenta: m.cuenta, saldo: 0 };
        mapaGastos[cod].saldo += deb - cre;
      }
    });

    setIngresos(Object.values(mapaIngresos).filter((i) => Math.abs(i.saldo) > 0.01).sort((a,b) => a.codigo.localeCompare(b.codigo)));
    setCostos(Object.values(mapaCostos).filter((c) => Math.abs(c.saldo) > 0.01).sort((a,b) => a.codigo.localeCompare(b.codigo)));
    setGastos(Object.values(mapaGastos).filter((g) => Math.abs(g.saldo) > 0.01).sort((a,b) => a.codigo.localeCompare(b.codigo)));
  };

  const totalIngresos     = ingresos.reduce((a, i) => a + i.saldo, 0);
  const totalCostos       = costos.reduce((a, c) => a + c.saldo, 0);
  const utilidadBruta     = totalIngresos - totalCostos;
  const totalGastos       = gastos.reduce((a, g) => a + g.saldo, 0);
  const utilidadOperativa = utilidadBruta - totalGastos;

  const FilaCuenta = ({ item }) => (
    <div style={s.fila}>
      <span style={s.filaLabel}>{item.codigo} — {item.cuenta}</span>
      <span style={s.filaMonto}>B/. {formatoMoneda(item.saldo)}</span>
    </div>
  );

  const SeccionHeader = ({ titulo }) => <div style={s.seccionHeader}>{titulo}</div>;

  const FilaSubtotal = ({ label, monto, positivo }) => (
    <div style={s.filaSubtotal}>
      <span style={s.filaSubtotalLabel}>{label}</span>
      <span style={{ ...s.filaSubtotalMonto, color: positivo === undefined ? "#0f172a" : positivo ? "#15803d" : "#dc2626" }}>
        B/. {formatoMoneda(monto)}
      </span>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{s.cssImpresion}</style>

      {empresa && (
        <div style={s.empresaHeader} className="print-header-block">
          <h2 style={s.empresaNombre}>{empresa.nombre}</h2>
          <p style={s.empresaPeriodo}>
            Estado de Resultados
            <span style={{ color: "#cbd5e1", margin: "0 8px" }}>|</span>
            Periodo contable: {empresa.periodo_inicio?.split("T")[0]} al {empresa.periodo_fin?.split("T")[0]}
          </p>
          <div style={s.actionRow} className="no-print">
            <div style={s.btnGroup}>
              <button style={s.btnNav} onClick={() => navigate("/diario")}>Libro Diario</button>
              <button style={s.btnNav} onClick={() => navigate("/mayorizar")}>Mayorización</button>
              <button style={{ ...s.btnNav, ...s.btnNavActive }} onClick={() => navigate("/resultados")}>Estado Resultado</button>
              <button style={s.btnNav} onClick={() => navigate("/balance")}>Balance General</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={s.moneda}>Balboas (B/.)</span>
              <button style={s.btnPrint} onClick={() => window.print()}>Imprimir / PDF</button>
              <button style={s.btnDanger} onClick={() => navigate("/inicio")}>Cambiar Empresa</button>
              <button style={s.btnDanger} onClick={() => navigate("/")}>Cerrar sesión</button>
            </div>
          </div>
          <h3 className="only-print" style={s.tituloReportePdf}>ESTADO DE RESULTADOS — REPORTE OFICIAL</h3>
        </div>
      )}

      <div style={s.card} className="print-container">

        {/* INGRESOS */}
        <SeccionHeader titulo="INGRESOS OPERACIONALES" />
        {ingresos.map((i) => <FilaCuenta key={i.codigo} item={i} />)}
        <FilaSubtotal label="TOTAL INGRESOS" monto={totalIngresos} />

        {/* COSTOS */}
        {costos.length > 0 && (
          <>
            <SeccionHeader titulo="COSTO DE VENTAS Y PRODUCCIÓN" />
            {costos.map((c) => <FilaCuenta key={c.codigo} item={c} />)}
            <FilaSubtotal label="TOTAL COSTOS" monto={totalCostos} />
          </>
        )}

        {/* UTILIDAD BRUTA */}
        <div style={s.filaUtilidad}>
          <span>UTILIDAD BRUTA</span>
          <span style={{ color: utilidadBruta >= 0 ? "#15803d" : "#dc2626" }}>
            B/. {formatoMoneda(utilidadBruta)}
          </span>
        </div>

        {/* GASTOS */}
        {gastos.length > 0 && (
          <>
            <SeccionHeader titulo="GASTOS OPERATIVOS" />
            {gastos.map((g) => <FilaCuenta key={g.codigo} item={g} />)}
            <FilaSubtotal label="TOTAL GASTOS OPERATIVOS" monto={totalGastos} />
          </>
        )}

        {/* UTILIDAD NETA */}
        <div style={{
          ...s.filaUtilidadNeta,
          background: utilidadOperativa >= 0 ? "#0f172a" : "#7f1d1d",
        }}>
          <span>{utilidadOperativa >= 0 ? "UTILIDAD NETA DEL EJERCICIO" : "PÉRDIDA NETA DEL EJERCICIO"}</span>
          <span>B/. {formatoMoneda(Math.abs(utilidadOperativa))}</span>
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

  card: { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" },

  seccionHeader: {
    padding: "13px 28px 10px", fontSize: "12px", fontWeight: "800", color: "#0369a1",
    textTransform: "uppercase", letterSpacing: "0.07em",
    borderBottom: "1px solid #e2e8f0", background: "#f0f9ff",
  },

  fila: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 28px", borderBottom: "1px solid #f8fafc" },
  filaLabel: { fontSize: "14px", color: "#334155", fontWeight: "400" },
  filaMonto: { fontSize: "14px", fontFamily: "monospace", fontWeight: "600", color: "#0f172a" },

  filaSubtotal: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "11px 28px", borderTop: "1px solid #cbd5e1", borderBottom: "2px solid #cbd5e1",
    background: "#f8fafc",
  },
  filaSubtotalLabel: { fontSize: "13px", fontWeight: "700", color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" },
  filaSubtotalMonto: { fontSize: "14px", fontFamily: "monospace", fontWeight: "800" },

  filaUtilidad: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "13px 28px", background: "#1e293b", color: "white",
    fontWeight: "800", fontSize: "14px", fontFamily: "monospace",
    margin: "8px 0",
  },

  filaUtilidadNeta: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 28px", color: "white",
    fontWeight: "800", fontSize: "16px", fontFamily: "monospace",
    marginTop: "8px", letterSpacing: "0.02em",
  },

  cssImpresion: `
    .only-print { display: none; }
    @media print {
      @page { size: A4 portrait; margin: 15mm 12mm; }
      body { background: #fff !important; color: #000 !important; font-size: 10pt; }
      .no-print { display: none !important; }
      .only-print { display: block !important; }
      .print-header-block { border: none !important; padding: 0 0 12px 0 !important; margin-bottom: 20px !important; border-bottom: 2px solid #000 !important; border-radius: 0 !important; box-shadow: none !important; }
      .print-header-block h2 { font-size: 22px !important; }
      .print-container { border: 1px solid #000 !important; border-radius: 0 !important; }
    }
  `,
};
