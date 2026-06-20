import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";

const API = "https://sistema-contable-backend-f67j.onrender.com";
const fmt = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CLASIFICACION = {
  "1010":"activoCorriente","1020":"activoCorriente","1030":"activoCorriente","1040":"activoCorriente",
  "1050":"activoCorriente","1060":"activoCorriente","1070":"activoCorriente","1080":"activoCorriente",
  "1090":"activoCorriente","1100":"activoCorriente",
  "1200":"activoNoCorriente","1210":"activoNoCorriente","1220":"activoNoCorriente","1230":"activoNoCorriente",
  "1240":"activoNoCorriente","1250":"activoNoCorriente","1260":"activoNoCorriente",
  "2010":"pasivoCorriente","2020":"pasivoCorriente","2030":"pasivoCorriente","2040":"pasivoCorriente",
  "2050":"pasivoCorriente","2060":"pasivoCorriente","2070":"pasivoCorriente",
  "2100":"pasivoNoCorriente","2110":"pasivoNoCorriente",
  "3010":"patrimonio","3020":"patrimonio","3030":"patrimonio","3040":"patrimonio",
};

const clasificar = (cod) => {
  if (CLASIFICACION[cod]) return CLASIFICACION[cod];
  const n = parseInt(cod, 10);
  if (n >= 1000 && n <= 1199) return "activoCorriente";
  if (n >= 1200 && n <= 1999) return "activoNoCorriente";
  if (n >= 2000 && n <= 2099) return "pasivoCorriente";
  if (n >= 2100 && n <= 2999) return "pasivoNoCorriente";
  if (cod.startsWith("3")) return "patrimonio";
  return null;
};

export default function BalanceGeneral() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const e = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!e) { navigate("/"); return; }
    setEmpresa(e);
    axios.get(`${API}/movimientos/${e.id}`)
      .then(r => setMovimientos(r.data))
      .catch(err => console.error(err));
  }, [navigate]);

  const saldos = (movs, nat) => {
    const c = {};
    movs.forEach(m => {
      const cod = String(m.codigoCuenta);
      if (!c[cod]) c[cod] = { codigoCuenta: cod, cuenta: m.cuenta, saldo: 0 };
      c[cod].saldo += nat === "D" ? Number(m.debito||0) - Number(m.credito||0) : Number(m.credito||0) - Number(m.debito||0);
    });
    return Object.values(c).filter(x => Math.abs(x.saldo) > 0.001);
  };

  const activos    = saldos(movimientos.filter(m => String(m.codigoCuenta).startsWith("1")), "D");
  const pasivos    = saldos(movimientos.filter(m => String(m.codigoCuenta).startsWith("2")), "H");
  const patrimonio = saldos(movimientos.filter(m => String(m.codigoCuenta).startsWith("3")), "H");

  const ac = activos.filter(c => clasificar(c.codigoCuenta) === "activoCorriente");
  const anc = activos.filter(c => clasificar(c.codigoCuenta) === "activoNoCorriente");
  const pc = pasivos.filter(c => clasificar(c.codigoCuenta) === "pasivoCorriente");
  const pnc = pasivos.filter(c => clasificar(c.codigoCuenta) === "pasivoNoCorriente");

  const tac = ac.reduce((a,c) => a+c.saldo, 0);
  const tanc = anc.reduce((a,c) => a+c.saldo, 0);
  const totalActivos = tac + tanc;
  const tpc = pc.reduce((a,c) => a+c.saldo, 0);
  const tpnc = pnc.reduce((a,c) => a+c.saldo, 0);
  const totalPasivos = tpc + tpnc;
  const patrimonioBase = patrimonio.reduce((a,c) => a+c.saldo, 0);

  const ingresos = movimientos.filter(m => String(m.codigoCuenta).startsWith("4")).reduce((a,m) => a + Number(m.credito||0) - Number(m.debito||0), 0);
  const gastos = movimientos.filter(m => ["5","6","7"].some(p => String(m.codigoCuenta).startsWith(p))).reduce((a,m) => a + Number(m.debito||0) - Number(m.credito||0), 0);
  const utilidad = ingresos - gastos;
  const totalPatrimonio = patrimonioBase + utilidad;
  const totalPP = totalPasivos + totalPatrimonio;
  const cuadrado = Math.abs(totalActivos - totalPP) < 0.01;

  const Fila = ({c}) => (
    <div style={s.fila}><span style={s.filaL}>{c.codigoCuenta} — {c.cuenta}</span><span style={s.filaM}>B/. {fmt(c.saldo)}</span></div>
  );
  const Sub = ({t}) => <div style={s.sub}>{t}</div>;
  const Subtotal = ({label, monto}) => (
    <div style={s.subtotal}><span style={s.subtotalL}>{label}</span><span style={s.subtotalM}>B/. {fmt(monto)}</span></div>
  );
  const Total = ({label, monto}) => (
    <div style={s.total}><span>{label}</span><span>B/. {fmt(monto)}</span></div>
  );

  return (
    <div style={s.page}>
      <style>{cssprint}</style>
      <div className="no-print">
        <NavBar empresa={empresa} paginaActiva="/balance" />
      </div>
      <div style={s.printHeader} className="only-print">
        <h2>{empresa?.nombre}</h2>
        <p>Balance General — Periodo: {empresa?.periodo_inicio?.split("T")[0]} al {empresa?.periodo_fin?.split("T")[0]}</p>
      </div>

      <div style={s.container}>
        <div style={s.titulo} className="no-print">
          <h2 style={s.tituloH}>Balance General</h2>
          <span style={s.moneda}>Balboas (B/.)</span>
        </div>

        <div style={s.dosCol} className="print-balance">
          <div style={s.col}>
            <div style={s.colHeader}>ACTIVO</div>
            {ac.length > 0 && <><Sub t="ACTIVO CORRIENTE"/>{ac.map(c=><Fila key={c.codigoCuenta} c={c}/>)}<Subtotal label="TOTAL ACTIVO CORRIENTE" monto={tac}/></>}
            {anc.length > 0 && <><Sub t="ACTIVO NO CORRIENTE"/>{anc.map(c=><Fila key={c.codigoCuenta} c={c}/>)}<Subtotal label="TOTAL ACTIVO NO CORRIENTE" monto={tanc}/></>}
            <Total label="TOTAL ACTIVO" monto={totalActivos}/>
          </div>
          <div style={{...s.col, borderLeft:"1px solid #e2e8f0"}}>
            <div style={s.colHeader}>PASIVO Y PATRIMONIO</div>
            {pc.length > 0 && <><Sub t="PASIVO CORRIENTE"/>{pc.map(c=><Fila key={c.codigoCuenta} c={c}/>)}<Subtotal label="TOTAL PASIVO CORRIENTE" monto={tpc}/></>}
            {pnc.length > 0 && <><Sub t="PASIVO NO CORRIENTE"/>{pnc.map(c=><Fila key={c.codigoCuenta} c={c}/>)}<Subtotal label="TOTAL PASIVO NO CORRIENTE" monto={tpnc}/></>}
            {totalPasivos > 0 && <Total label="TOTAL PASIVO" monto={totalPasivos}/>}
            <Sub t="PATRIMONIO"/>
            {patrimonio.map(c=><Fila key={c.codigoCuenta} c={c}/>)}
            <div style={s.fila}><span style={s.filaL}>Utilidad del Período</span><span style={{...s.filaM, color: utilidad>=0?"#15803d":"#dc2626"}}>B/. {fmt(utilidad)}</span></div>
            <Subtotal label="TOTAL PATRIMONIO" monto={totalPatrimonio}/>
            <Total label="TOTAL PASIVO Y PATRIMONIO" monto={totalPP}/>
          </div>
        </div>

        <div style={{...s.verificacion, background: cuadrado?"#dcfce7":"#fee2e2", borderColor: cuadrado?"#86efac":"#fca5a5"}}>
          <div><p style={s.verL}>TOTAL ACTIVOS</p><p style={{...s.verV, color:"#0f172a"}}>B/. {fmt(totalActivos)}</p></div>
          <div style={{fontSize:"24px"}}>{cuadrado?"✅":"❌"}</div>
          <div><p style={s.verL}>TOTAL PASIVO Y PATRIMONIO</p><p style={{...s.verV, color:"#0f172a"}}>B/. {fmt(totalPP)}</p></div>
          <div><p style={{...s.verL, textAlign:"center"}}>ESTADO</p><p style={{...s.verV, color: cuadrado?"#15803d":"#b91c1c", textAlign:"center"}}>{cuadrado?"Cuadrado":"Descuadrado"}</p></div>
        </div>
      </div>
    </div>
  );
}

const cssprint = `
  .only-print { display: none; }
  @media print {
    @page { size: A4 landscape; margin: 12mm 10mm; }
    body { background: #fff !important; font-size: 9pt; }
    .no-print { display: none !important; }
    .only-print { display: block !important; }
    .print-balance { border: 1px solid #000 !important; }
  }
`;

const s = {
  page: { minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter','Segoe UI',sans-serif" },
  printHeader: { display:"none", padding:"0 20px 12px", borderBottom:"2px solid #000" },
  container: { maxWidth:"1200px", margin:"0 auto", padding:"20px 16px" },
  titulo: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" },
  tituloH: { margin:0, fontSize:"clamp(18px,3vw,24px)", fontWeight:"700", color:"#0f172a" },
  moneda: { fontSize:"13px", fontWeight:"700", color:"#64748b" },
  dosCol: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", overflow:"hidden", marginBottom:"16px" },
  col: { padding:"0 0 16px" },
  colHeader: { background:"#0f172a", color:"white", fontWeight:"800", fontSize:"13px", letterSpacing:"0.1em", textAlign:"center", padding:"12px 16px" },
  sub: { padding:"10px 16px 6px", fontSize:"11px", fontWeight:"800", color:"#0369a1", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:"1px solid #e2e8f0", background:"#f0f9ff" },
  fila: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 16px", borderBottom:"1px solid #f8fafc" },
  filaL: { fontSize:"13px", color:"#334155" },
  filaM: { fontSize:"13px", fontFamily:"monospace", fontWeight:"600", color:"#0f172a" },
  subtotal: { display:"flex", justifyContent:"space-between", padding:"9px 16px", borderTop:"1px solid #cbd5e1", borderBottom:"2px solid #cbd5e1", background:"#f8fafc" },
  subtotalL: { fontSize:"12px", fontWeight:"700", color:"#0f172a", textTransform:"uppercase" },
  subtotalM: { fontSize:"13px", fontFamily:"monospace", fontWeight:"800", color:"#0f172a" },
  total: { display:"flex", justifyContent:"space-between", padding:"12px 16px", background:"#0f172a", color:"white", fontWeight:"800", fontSize:"13px", fontFamily:"monospace", marginTop:"6px" },
  verificacion: { borderRadius:"12px", border:"1px solid", padding:"16px 24px", display:"flex", justifyContent:"space-around", alignItems:"center", flexWrap:"wrap", gap:"16px" },
  verL: { margin:0, fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase" },
  verV: { margin:"4px 0 0", fontSize:"clamp(16px,3vw,22px)", fontWeight:"800", fontFamily:"monospace" },
};
