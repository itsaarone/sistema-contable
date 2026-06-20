import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";

const API = "https://sistema-contable-backend-f67j.onrender.com";
const fmt = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function EstadoResultado() {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [ingresos, setIngresos] = useState([]);
  const [costos, setCostos] = useState([]);
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    const e = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!e) { navigate("/"); return; }
    setEmpresa(e);
    axios.get(`${API}/movimientos/${e.id}`)
      .then(r => procesar(r.data))
      .catch(err => console.error(err));
  }, [navigate]);

  const procesar = (movs) => {
    const ing={}, cos={}, gas={};
    movs.forEach(m => {
      const cod = String(m.codigoCuenta);
      const deb = Number(m.debito||0), cre = Number(m.credito||0);
      if (cod.startsWith("4")) { if(!ing[cod]) ing[cod]={codigo:cod,cuenta:m.cuenta,saldo:0}; ing[cod].saldo+=cre-deb; }
      else if (cod.startsWith("6")||cod.startsWith("7")) { if(!cos[cod]) cos[cod]={codigo:cod,cuenta:m.cuenta,saldo:0}; cos[cod].saldo+=deb-cre; }
      else if (cod.startsWith("5")) { if(!gas[cod]) gas[cod]={codigo:cod,cuenta:m.cuenta,saldo:0}; gas[cod].saldo+=deb-cre; }
    });
    setIngresos(Object.values(ing).filter(i=>Math.abs(i.saldo)>0.01).sort((a,b)=>a.codigo.localeCompare(b.codigo)));
    setCostos(Object.values(cos).filter(c=>Math.abs(c.saldo)>0.01).sort((a,b)=>a.codigo.localeCompare(b.codigo)));
    setGastos(Object.values(gas).filter(g=>Math.abs(g.saldo)>0.01).sort((a,b)=>a.codigo.localeCompare(b.codigo)));
  };

  const tIng = ingresos.reduce((a,i)=>a+i.saldo,0);
  const tCos = costos.reduce((a,c)=>a+c.saldo,0);
  const uBruta = tIng - tCos;
  const tGas = gastos.reduce((a,g)=>a+g.saldo,0);
  const uNeta = uBruta - tGas;

  const Fila = ({item}) => (
    <div style={s.fila}><span style={s.filaL}>{item.codigo} — {item.cuenta}</span><span style={s.filaM}>B/. {fmt(item.saldo)}</span></div>
  );
  const Seccion = ({t}) => <div style={s.seccion}>{t}</div>;
  const Subtotal = ({label, monto, color}) => (
    <div style={s.subtotal}><span style={s.subtotalL}>{label}</span><span style={{...s.subtotalM, color: color||"#0f172a"}}>B/. {fmt(monto)}</span></div>
  );

  return (
    <div style={s.page}>
      <style>{cssprint}</style>
      <div className="no-print"><NavBar empresa={empresa} paginaActiva="/resultados"/></div>
      <div style={s.printHeader} className="only-print">
        <h2>{empresa?.nombre}</h2>
        <p>Estado de Resultados — Periodo: {empresa?.periodo_inicio?.split("T")[0]} al {empresa?.periodo_fin?.split("T")[0]}</p>
      </div>

      <div style={s.container}>
        <div style={s.titulo} className="no-print">
          <h2 style={s.tituloH}>Estado de Resultados</h2>
          <span style={s.moneda}>Balboas (B/.)</span>
        </div>

        <div style={s.card} className="print-container">
          <Seccion t="INGRESOS OPERACIONALES"/>
          {ingresos.map(i=><Fila key={i.codigo} item={i}/>)}
          <Subtotal label="TOTAL INGRESOS" monto={tIng}/>

          {costos.length>0 && <>
            <Seccion t="COSTO DE VENTAS Y PRODUCCIÓN"/>
            {costos.map(c=><Fila key={c.codigo} item={c}/>)}
            <Subtotal label="TOTAL COSTOS" monto={tCos}/>
          </>}

          <div style={s.utilidad}>
            <span>UTILIDAD BRUTA</span>
            <span style={{color: uBruta>=0?"#15803d":"#dc2626"}}>B/. {fmt(uBruta)}</span>
          </div>

          {gastos.length>0 && <>
            <Seccion t="GASTOS OPERATIVOS"/>
            {gastos.map(g=><Fila key={g.codigo} item={g}/>)}
            <Subtotal label="TOTAL GASTOS" monto={tGas}/>
          </>}

          <div style={{...s.utilidadNeta, background: uNeta>=0?"#0f172a":"#7f1d1d"}}>
            <span>{uNeta>=0?"UTILIDAD NETA DEL EJERCICIO":"PÉRDIDA NETA DEL EJERCICIO"}</span>
            <span>B/. {fmt(Math.abs(uNeta))}</span>
          </div>
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
    .print-container { border: 1px solid #000 !important; }
  }
`;

const s = {
  page: { minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter','Segoe UI',sans-serif" },
  printHeader: { display:"none", padding:"0 20px 12px", borderBottom:"2px solid #000" },
  container: { maxWidth:"800px", margin:"0 auto", padding:"20px 16px" },
  titulo: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" },
  tituloH: { margin:0, fontSize:"clamp(18px,3vw,24px)", fontWeight:"700", color:"#0f172a" },
  moneda: { fontSize:"13px", fontWeight:"700", color:"#64748b" },
  card: { background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", overflow:"hidden" },
  seccion: { padding:"11px 20px 8px", fontSize:"11px", fontWeight:"800", color:"#0369a1", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:"1px solid #e2e8f0", background:"#f0f9ff" },
  fila: { display:"flex", justifyContent:"space-between", padding:"10px 20px", borderBottom:"1px solid #f8fafc" },
  filaL: { fontSize:"14px", color:"#334155" },
  filaM: { fontSize:"14px", fontFamily:"monospace", fontWeight:"600", color:"#0f172a" },
  subtotal: { display:"flex", justifyContent:"space-between", padding:"10px 20px", borderTop:"1px solid #cbd5e1", borderBottom:"2px solid #cbd5e1", background:"#f8fafc" },
  subtotalL: { fontSize:"12px", fontWeight:"700", color:"#0f172a", textTransform:"uppercase" },
  subtotalM: { fontSize:"14px", fontFamily:"monospace", fontWeight:"800" },
  utilidad: { display:"flex", justifyContent:"space-between", padding:"12px 20px", background:"#1e293b", color:"white", fontWeight:"800", fontSize:"14px", fontFamily:"monospace", margin:"6px 0" },
  utilidadNeta: { display:"flex", justifyContent:"space-between", padding:"16px 20px", color:"white", fontWeight:"800", fontSize:"clamp(14px,2.5vw,16px)", fontFamily:"monospace", marginTop:"6px", flexWrap:"wrap", gap:"8px" },
};
