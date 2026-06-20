import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";

const API = "https://sistema-contable-backend-f67j.onrender.com";
const fmt = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

export default function Mayorizar() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const e = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!e) { navigate("/"); return; }
    setEmpresa(e);
    axios.get(`${API}/movimientos/${e.id}`)
      .then(r => setMovimientos(r.data))
      .catch(err => console.log("Error:", err));
  }, [navigate]);

  const cuentas = movimientos.reduce((acc, mov) => {
    if (!acc[mov.codigoCuenta]) acc[mov.codigoCuenta] = { cuenta: mov.cuenta, movimientos: [] };
    acc[mov.codigoCuenta].movimientos.push(mov);
    return acc;
  }, {});

  return (
    <div style={s.page}>
      <style>{cssprint}</style>
      <div className="no-print"><NavBar empresa={empresa} paginaActiva="/mayorizar"/></div>
      <div style={s.printHeader} className="only-print">
        <h2>{empresa?.nombre}</h2>
        <p>Libro Mayor — Periodo: {empresa?.periodo_inicio?.split("T")[0]} al {empresa?.periodo_fin?.split("T")[0]}</p>
      </div>

      <div style={s.container}>
        <div style={s.titulo} className="no-print">
          <h2 style={s.tituloH}>Mayorización de Cuentas</h2>
          <span style={s.moneda}>Balboas (B/.)</span>
        </div>

        <div style={s.grid} className="print-main-container">
          {Object.keys(cuentas).sort().map((codigo) => {
            const esAcreedora = codigo.startsWith("2")||codigo.startsWith("3")||codigo.startsWith("4");
            let saldo=0, tDebe=0, tHaber=0;
            const filas = cuentas[codigo].movimientos.map((m, i) => {
              const deb=Number(m.debito)||0, cre=Number(m.credito)||0;
              tDebe+=deb; tHaber+=cre;
              saldo += esAcreedora ? (cre-deb) : (deb-cre);
              return {...m, deb, cre, saldo, i};
            });

            return (
              <div key={codigo} style={s.card} className="mayor-card-block">
                <div style={s.cuentaHeader}>
                  <div style={{display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap"}}>
                    <span style={s.codigo}>{codigo}</span>
                    <span style={s.cuentaNombre}>{cuentas[codigo].cuenta}</span>
                  </div>
                  <span style={s.tipoBadge}>{esAcreedora?"Saldo Acreedor":"Saldo Deudor"}</span>
                </div>

                <div style={s.tableWrapper}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={{...s.th, textAlign:"center", minWidth:"90px"}}>Fecha</th>
                        <th style={s.th}>Concepto</th>
                        <th style={{...s.th, textAlign:"right", minWidth:"100px"}}>Debe</th>
                        <th style={{...s.th, textAlign:"right", minWidth:"100px"}}>Haber</th>
                        <th style={{...s.th, textAlign:"right", minWidth:"100px"}}>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filas.map(({i, deb, cre, saldo:s_, ...m}) => (
                        <tr key={i} style={s.tr}>
                          <td style={{...s.td, textAlign:"center", whiteSpace:"nowrap", color:"#64748b"}}>{m.fecha?String(m.fecha).split("T")[0]:""}</td>
                          <td style={{...s.td, color:"#334155"}}>{m.descripcion||"—"}</td>
                          <td style={{...s.td, textAlign:"right", fontFamily:"monospace", fontWeight:"600"}}>{deb>0?`B/. ${fmt(deb)}`:""}</td>
                          <td style={{...s.td, textAlign:"right", fontFamily:"monospace", fontWeight:"600"}}>{cre>0?`B/. ${fmt(cre)}`:""}</td>
                          <td style={{...s.td, textAlign:"right", fontFamily:"monospace", fontWeight:"700", color:"#0369a1", borderLeft:"1px solid #e2e8f0"}}>B/. {fmt(s_)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{borderTop:"2px solid #0f172a", background:"#f8fafc"}}>
                        <td colSpan={2} style={{...s.td, fontWeight:"700", textTransform:"uppercase", fontSize:"12px"}}>SUMAS IGUALES</td>
                        <td style={{...s.td, textAlign:"right", fontFamily:"monospace", fontWeight:"800"}}>B/. {fmt(tDebe)}</td>
                        <td style={{...s.td, textAlign:"right", fontFamily:"monospace", fontWeight:"800"}}>B/. {fmt(tHaber)}</td>
                        <td style={{...s.td, textAlign:"right", fontFamily:"monospace", fontWeight:"800", borderLeft:"1px solid #e2e8f0"}}>B/. {fmt(Math.abs(filas[filas.length-1]?.saldo??0))}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const cssprint = `
  .only-print { display: none; }
  @media print {
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { background: #fff !important; font-size: 10pt; }
    .no-print { display: none !important; }
    .only-print { display: block !important; }
    .print-main-container { display: block !important; }
    .mayor-card-block { border: 1px solid #94a3b8 !important; margin-bottom: 24px !important; page-break-inside: avoid !important; }
    th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

const s = {
  page: { minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter','Segoe UI',sans-serif" },
  printHeader: { display:"none", padding:"0 20px 12px", borderBottom:"2px solid #000" },
  container: { maxWidth:"1200px", margin:"0 auto", padding:"20px 16px" },
  titulo: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" },
  tituloH: { margin:0, fontSize:"clamp(18px,3vw,24px)", fontWeight:"700", color:"#0f172a" },
  moneda: { fontSize:"13px", fontWeight:"700", color:"#64748b" },
  grid: { display:"flex", flexDirection:"column", gap:"20px" },
  card: { background:"white", borderRadius:"10px", border:"1px solid #e2e8f0", overflow:"hidden" },
  cuentaHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"2px solid #0f172a", background:"#f8fafc", flexWrap:"wrap", gap:"8px" },
  codigo: { fontFamily:"monospace", fontWeight:"800", fontSize:"13px", background:"#0f172a", color:"white", padding:"3px 10px", borderRadius:"4px" },
  cuentaNombre: { fontWeight:"700", fontSize:"14px", color:"#0f172a" },
  tipoBadge: { fontSize:"11px", fontWeight:"600", color:"#64748b", border:"1px solid #cbd5e1", padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap" },
  tableWrapper: { overflowX:"auto" },
  table: { width:"100%", borderCollapse:"collapse", minWidth:"500px" },
  th: { padding:"10px 14px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", textAlign:"left", color:"#64748b", fontSize:"11px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" },
  tr: { borderBottom:"1px solid #f1f5f9" },
  td: { padding:"11px 14px", fontSize:"14px" },
};
