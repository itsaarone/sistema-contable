import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar";

const API = "https://sistema-contable-backend-f67j.onrender.com";
const formatoMoneda = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 });

const CATALOGO_INICIAL = [
  { codigo: "1010", cuenta: "Caja General", grupo: "Activo Corriente" },
  { codigo: "1020", cuenta: "Caja Chica", grupo: "Activo Corriente" },
  { codigo: "1030", cuenta: "Banco Nacional", grupo: "Activo Corriente" },
  { codigo: "1040", cuenta: "Banco General", grupo: "Activo Corriente" },
  { codigo: "1050", cuenta: "Cuentas por Cobrar Clientes", grupo: "Activo Corriente" },
  { codigo: "1060", cuenta: "Documentos por Cobrar", grupo: "Activo Corriente" },
  { codigo: "1070", cuenta: "Inventario de Mercancías", grupo: "Activo Corriente" },
  { codigo: "1080", cuenta: "Inventario de Materias Primas", grupo: "Activo Corriente" },
  { codigo: "1090", cuenta: "Gastos Pagados por Anticipado", grupo: "Activo Corriente" },
  { codigo: "1100", cuenta: "ITBMS Acreditable", grupo: "Activo Corriente" },
  { codigo: "1200", cuenta: "Terrenos", grupo: "Activo No Corriente" },
  { codigo: "1210", cuenta: "Edificios", grupo: "Activo No Corriente" },
  { codigo: "1220", cuenta: "Maquinaria y Equipo", grupo: "Activo No Corriente" },
  { codigo: "1230", cuenta: "Mobiliario y Equipo de Oficina", grupo: "Activo No Corriente" },
  { codigo: "1240", cuenta: "Equipo de Cómputo", grupo: "Activo No Corriente" },
  { codigo: "1250", cuenta: "Vehículos", grupo: "Activo No Corriente" },
  { codigo: "1260", cuenta: "Depreciación Acumulada", grupo: "Activo No Corriente" },
  { codigo: "2010", cuenta: "Cuentas por Pagar Proveedores", grupo: "Pasivo Corriente" },
  { codigo: "2020", cuenta: "Documentos por Pagar", grupo: "Pasivo Corriente" },
  { codigo: "2030", cuenta: "ITBMS por Pagar", grupo: "Pasivo Corriente" },
  { codigo: "2040", cuenta: "CSS por Pagar", grupo: "Pasivo Corriente" },
  { codigo: "2050", cuenta: "Impuesto s/Renta por Pagar", grupo: "Pasivo Corriente" },
  { codigo: "2060", cuenta: "Sueldos por Pagar", grupo: "Pasivo Corriente" },
  { codigo: "2070", cuenta: "Ingresos Recibidos por Anticip", grupo: "Pasivo Corriente" },
  { codigo: "2100", cuenta: "Préstamos Bancarios L/P", grupo: "Pasivo No Corriente" },
  { codigo: "2110", cuenta: "Hipotecas por Pagar", grupo: "Pasivo No Corriente" },
  { codigo: "3010", cuenta: "Capital Social", grupo: "Patrimonio" },
  { codigo: "3020", cuenta: "Reserva Legal", grupo: "Patrimonio" },
  { codigo: "3030", cuenta: "Utilidades Retenidas", grupo: "Patrimonio" },
  { codigo: "3040", cuenta: "Dividendos por Pagar", grupo: "Patrimonio" },
  { codigo: "4010", cuenta: "Ventas", grupo: "Ingreso" },
  { codigo: "4020", cuenta: "Devoluciones en Ventas", grupo: "Ingreso" },
  { codigo: "4030", cuenta: "Descuentos en Ventas", grupo: "Ingreso" },
  { codigo: "4040", cuenta: "Otros Ingresos", grupo: "Ingreso" },
  { codigo: "4050", cuenta: "Ingresos Financieros", grupo: "Ingreso" },
  { codigo: "5010", cuenta: "Gasto de Salarios", grupo: "Gasto Operativo" },
  { codigo: "5020", cuenta: "Gasto de CSS Patronal", grupo: "Gasto Operativo" },
  { codigo: "5030", cuenta: "Gasto de Alquiler", grupo: "Gasto Operativo" },
  { codigo: "5040", cuenta: "Gasto de Servicios Públicos", grupo: "Gasto Operativo" },
  { codigo: "5050", cuenta: "Gasto de Transporte", grupo: "Gasto Operativo" },
  { codigo: "5060", cuenta: "Gasto de Publicidad", grupo: "Gasto Operativo" },
  { codigo: "5070", cuenta: "Gasto de Depreciación", grupo: "Gasto Operativo" },
  { codigo: "5080", cuenta: "Gasto de Suministros de Oficina", grupo: "Gasto Operativo" },
  { codigo: "5090", cuenta: "Gasto de Seguros", grupo: "Gasto Operativo" },
  { codigo: "5100", cuenta: "Gasto de Intereses", grupo: "Gasto Operativo" },
  { codigo: "6010", cuenta: "Costo de Ventas", grupo: "Costo de Venta" },
  { codigo: "6020", cuenta: "Compras", grupo: "Costo de Venta" },
  { codigo: "6030", cuenta: "Devoluciones en Compras", grupo: "Costo de Venta" },
  { codigo: "6040", cuenta: "Descuentos en Compras", grupo: "Costo de Venta" },
  { codigo: "6050", cuenta: "Flete en Compras", grupo: "Costo de Venta" },
  { codigo: "7010", cuenta: "Materia Prima Utilizada", grupo: "Costo de Producción" },
  { codigo: "7020", cuenta: "Mano de Obra Directa", grupo: "Costo de Producción" },
  { codigo: "7030", cuenta: "Costos Indirectos de Fabric.", grupo: "Costo de Producción" },
];

const GRUPOS_ESTATICOS = [
  "Activo Corriente","Activo No Corriente","Pasivo Corriente","Pasivo No Corriente",
  "Patrimonio","Ingreso","Gasto Operativo","Costo de Venta","Costo de Producción"
];

const validarCuenta = (c) => {
  if (!c) return "Cuenta inválida";
  if (c.startsWith("1")) return "Activo";
  if (c.startsWith("2")) return "Pasivo";
  if (c.startsWith("3")) return "Patrimonio";
  if (c.startsWith("4")) return "Ingreso";
  if (c.startsWith("5")) return "Gasto";
  if (c.startsWith("6")) return "Costo Venta";
  if (c.startsWith("7")) return "Costo Producción";
  return "Cuenta inválida";
};

const agruparPorAsiento = (movimientos) => {
  if (!movimientos.length) return [];
  const asientos = [];
  let actual = null, num = 1;
  movimientos.forEach((m, i) => {
    const prev = movimientos[i-1];
    const esNuevo = !prev || prev.fecha !== m.fecha || prev.descripcion !== m.descripcion;
    if (esNuevo) { actual = { numero: num++, fecha: m.fecha, descripcion: m.descripcion, lineas: [] }; asientos.push(actual); }
    actual.lineas.push(m);
  });
  return asientos;
};

export default function DiarioGeneral() {
  const navigate  = useNavigate();
  const selectRef = useRef(null);
  const [catalogo, setCatalogo] = useState(() => {
    const g = localStorage.getItem("catalogo_contable_personalizado");
    return g ? JSON.parse(g) : CATALOGO_INICIAL;
  });
  const [movimientos, setMovimientos] = useState([]);
  const [editando, setEditando]       = useState(null);
  const [empresa, setEmpresa]         = useState(null);
  const formVacio = { fecha:"", codigoCuenta:"", cuenta:"", referencia:"", descripcion:"", debito:"", credito:"" };
  const [form, setForm] = useState(formVacio);
  const [mostrarCrearCuenta, setMostrarCrearCuenta] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({ codigo:"", cuenta:"", grupo:"Activo Corriente" });

  useEffect(() => {
    const e = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!e) { navigate("/"); return; }
    setEmpresa(e);
    cargarMovimientos(e.id);
  }, []);

  const cargarMovimientos = async (id) => {
    try {
      const res = await axios.get(`${API}/movimientos/${id}`);
      const refs = JSON.parse(localStorage.getItem("referencias_mov") || "{}");
      setMovimientos(res.data.map(m => ({
        ...m,
        fecha: m.fecha ? m.fecha.split("T")[0] : "",
        referencia: (m.referencia && String(m.referencia).trim()) || refs[String(m.id)] || "",
      })));
    } catch(e) { console.log("Error:", e); }
  };

  const onSelectCuenta = (e) => {
    const cod = e.target.value;
    if (!cod) { setForm(f => ({...f, codigoCuenta:"", cuenta:""})); return; }
    const item = catalogo.find(c => c.codigo === cod);
    if (item) setForm(f => ({...f, codigoCuenta: item.codigo, cuenta: item.cuenta}));
  };

  const agregarNuevaCuenta = () => {
    const { codigo, cuenta, grupo } = nuevaCuenta;
    if (!codigo.trim() || !cuenta.trim()) { alert("Ingrese código y nombre."); return; }
    if (catalogo.some(c => c.codigo === codigo)) { alert("Este código ya existe."); return; }
    const nuevo = [...catalogo, {codigo, cuenta, grupo}].sort((a,b) => a.codigo.localeCompare(b.codigo));
    setCatalogo(nuevo);
    localStorage.setItem("catalogo_contable_personalizado", JSON.stringify(nuevo));
    setForm(f => ({...f, codigoCuenta: codigo, cuenta}));
    setMostrarCrearCuenta(false);
    setNuevaCuenta({ codigo:"", cuenta:"", grupo:"Activo Corriente" });
  };

  const guardarMovimiento = async () => {
    if (!form.fecha || !form.codigoCuenta || !form.cuenta) { alert("Rellene: Fecha y Cuenta."); return; }
    const deb = parseFloat(form.debito)||0, cre = parseFloat(form.credito)||0;
    if (deb===0 && cre===0) { alert("Ingrese un monto en Débito o Crédito."); return; }
    const payload = { id: editando, empresa_id: empresa.id, fecha: form.fecha, codigoCuenta: form.codigoCuenta, cuenta: form.cuenta, referencia: form.referencia, descripcion: form.descripcion, debito: deb, credito: cre, tipoCuenta: validarCuenta(form.codigoCuenta) };
    try {
      const res = await axios.post(`${API}/movimientos`, payload);
      if (form.referencia?.trim()) {
        const savedId = res.data?.id || editando;
        if (savedId) { const refs = JSON.parse(localStorage.getItem("referencias_mov")||"{}"); refs[String(savedId)] = form.referencia.trim(); localStorage.setItem("referencias_mov", JSON.stringify(refs)); }
      }
      setEditando(null);
      setForm(f => ({...formVacio, fecha: f.fecha, descripcion: f.descripcion}));
      await cargarMovimientos(empresa.id);
    } catch(e) { console.log("Error:", e); }
  };

  const editarMovimiento = (m) => {
    setEditando(m.id);
    setForm({ fecha: m.fecha, codigoCuenta: m.codigoCuenta, cuenta: m.cuenta, referencia: m.referencia||"", descripcion: m.descripcion, debito: m.debito, credito: m.credito });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarMovimiento = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      try { await axios.delete(`${API}/movimientos/${id}`); await cargarMovimientos(empresa.id); }
      catch(e) { console.log("Error:", e); }
    }
  };

  const totalDebito  = movimientos.reduce((a,m) => a+Number(m.debito), 0);
  const totalCredito = movimientos.reduce((a,m) => a+Number(m.credito), 0);
  const asientos     = agruparPorAsiento(movimientos);
  const gruposDinamicos = [...new Set(catalogo.map(c => c.grupo))];

  return (
    <div style={st.page}>
      <style>{cssprint}</style>
      <div className="no-print"><NavBar empresa={empresa} paginaActiva="/diario"/></div>
      <div style={st.printHeader} className="only-print">
        <h2>{empresa?.nombre}</h2>
        <p>Libro Diario General — Periodo: {empresa?.periodo_inicio?.split("T")[0]} al {empresa?.periodo_fin?.split("T")[0]}</p>
      </div>

      <div style={st.container}>
        {/* Formulario */}
        <div style={st.card} className="no-print">
          <h3 style={st.cardTitle}>{editando !== null ? "✏️ Editar Movimiento" : "➕ Nuevo Movimiento"}</h3>

          <div style={st.fila2}>
            <div style={st.inputBox}>
              <label style={st.label}>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} style={st.input}/>
            </div>
            <div style={st.inputBox}>
              <label style={st.label}>Descripción del Asiento</label>
              <input placeholder="Ej: Aporte inicial de socios" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={st.input}/>
            </div>
          </div>

          <div style={st.grid4}>
            <div style={st.inputBox}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <label style={st.label}>Cuenta Contable</label>
                <button type="button" onClick={() => setMostrarCrearCuenta(!mostrarCrearCuenta)} style={st.linkBtn}>
                  {mostrarCrearCuenta ? "✕ Cancelar" : "➕ Nueva cuenta"}
                </button>
              </div>
              <select ref={selectRef} value={form.codigoCuenta} onChange={onSelectCuenta} style={st.select}>
                <option value="">— Seleccione una cuenta —</option>
                {gruposDinamicos.map(grupo => (
                  <optgroup key={grupo} label={grupo}>
                    {catalogo.filter(c => c.grupo===grupo).map(c => (
                      <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.cuenta}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {form.codigoCuenta && <span style={st.codigoTag}>Código: <strong>{form.codigoCuenta}</strong> <span style={st.tipoBadge}>{validarCuenta(form.codigoCuenta)}</span></span>}
            </div>

            <div style={st.inputBox}>
              <label style={st.label}>Ref. / N° Documento</label>
              <input type="text" placeholder="CHQ-001, FAC-A23..." value={form.referencia} onChange={e => setForm({...form, referencia: e.target.value})} style={{...st.input, fontFamily:"monospace"}} maxLength={50}/>
            </div>

            <div style={st.inputBox}>
              <label style={st.label}>Débito (Debe)</label>
              <input type="number" placeholder="0.00" value={form.debito} onChange={e => setForm({...form, debito: e.target.value})} style={{...st.input, textAlign:"right", fontWeight:"600"}}/>
            </div>

            <div style={st.inputBox}>
              <label style={st.label}>Crédito (Haber)</label>
              <input type="number" placeholder="0.00" value={form.credito} onChange={e => setForm({...form, credito: e.target.value})} style={{...st.input, textAlign:"right", fontWeight:"600"}}/>
            </div>
          </div>

          {mostrarCrearCuenta && (
            <div style={st.nuevaCuentaBox}>
              <h4 style={{margin:"0 0 10px", fontSize:"13px", fontWeight:"700", color:"#1e293b"}}>Registrar Nueva Cuenta</h4>
              <div style={st.grid4sub}>
                <div style={st.inputBox}>
                  <label style={st.labelSub}>Código</label>
                  <input type="text" maxLength={6} placeholder="Ej: 1035" value={nuevaCuenta.codigo} onChange={e => setNuevaCuenta({...nuevaCuenta, codigo: e.target.value})} style={st.inputSub}/>
                </div>
                <div style={st.inputBox}>
                  <label style={st.labelSub}>Nombre</label>
                  <input type="text" placeholder="Nombre de la cuenta" value={nuevaCuenta.cuenta} onChange={e => setNuevaCuenta({...nuevaCuenta, cuenta: e.target.value})} style={st.inputSub}/>
                </div>
                <div style={st.inputBox}>
                  <label style={st.labelSub}>Grupo</label>
                  <select value={nuevaCuenta.grupo} onChange={e => setNuevaCuenta({...nuevaCuenta, grupo: e.target.value})} style={st.inputSub}>
                    {GRUPOS_ESTATICOS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <button type="button" onClick={agregarNuevaCuenta} style={st.btnGuardar}>✔ Registrar</button>
              </div>
            </div>
          )}

          <div style={st.formFooter}>
            <span style={{fontSize:"13px", fontWeight:"700", color:"#64748b"}}>Moneda: Balboas (B/.)</span>
            <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
              {(form.fecha||form.descripcion) && <button style={st.btnSec} onClick={() => { setEditando(null); setForm(formVacio); }}>Siguiente asiento →</button>}
              <button style={st.btnGuardar} onClick={guardarMovimiento}>
                {editando !== null ? "✓ Guardar Cambios" : "+ Insertar Fila"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div style={st.tableCard} className="print-container">
          <div style={st.tableWrapper}>
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={{...st.th, textAlign:"center", width:"50px"}}>N°</th>
                  <th style={{...st.th, width:"90px"}}>Fecha</th>
                  <th style={{...st.th, width:"70px"}}>Código</th>
                  <th style={st.th}>Cuentas y Detalle</th>
                  <th style={{...st.th, textAlign:"center", width:"80px"}}>Ref.</th>
                  <th style={{...st.th, textAlign:"right", width:"120px"}}>Debe</th>
                  <th style={{...st.th, textAlign:"right", width:"120px"}}>Haber</th>
                  <th style={{...st.th, width:"100px"}} className="no-print">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asientos.map(asiento =>
                  asiento.lineas.map((m, idx) => {
                    const esHaber = Number(m.credito)>0;
                    const esPrimera = idx===0;
                    const esUltima  = idx===asiento.lineas.length-1;
                    return (
                      <tr key={m.id} style={{borderBottom: esUltima?"2px solid #cbd5e1":"1px dashed #e2e8f0"}}>
                        <td style={{...st.td, textAlign:"center", fontWeight:"700", color: esPrimera?"#1e293b":"transparent", borderRight:"2px solid #e2e8f0"}}>{esPrimera?asiento.numero:""}</td>
                        <td style={{...st.td, color:"#64748b", textAlign:"center", whiteSpace:"nowrap"}}>{esPrimera?m.fecha:""}</td>
                        <td style={{...st.td, color:"#1e3a8a", fontWeight:"700", fontFamily:"monospace"}}>{m.codigoCuenta}</td>
                        <td style={{...st.td, paddingLeft: esHaber?"36px":"12px"}}>
                          <div style={{display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap"}}>
                            <span style={{fontWeight:"600", color:"#0f172a"}}>{esHaber?`a ${m.cuenta}`:m.cuenta}</span>
                            {m.referencia && <span style={st.refBadge}>{m.referencia}</span>}
                          </div>
                          {esUltima && m.descripcion && <div style={st.glosa}>{m.descripcion}</div>}
                        </td>
                        <td style={{...st.td, textAlign:"center", fontFamily:"monospace", color:"#0369a1"}}>{m.referencia||"—"}</td>
                        <td style={{...st.td, textAlign:"right", fontFamily:"monospace", fontWeight:"600"}}>{Number(m.debito)>0?`B/. ${formatoMoneda(m.debito)}`:""}</td>
                        <td style={{...st.td, textAlign:"right", fontFamily:"monospace", fontWeight:"600"}}>{Number(m.credito)>0?`B/. ${formatoMoneda(m.credito)}`:""}</td>
                        <td style={st.td} className="no-print">
                          <button style={st.btnEdit} onClick={() => editarMovimiento(m)}>Editar</button>
                          <button style={st.btnDel} onClick={() => eliminarMovimiento(m.id)}>Borrar</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={st.totales} className="print-totals">
            <div style={st.totalBlock}>
              <span style={st.totalLabel}>TOTAL DEBE</span>
              <h2 style={st.totalMonto}>B/. {formatoMoneda(totalDebito)}</h2>
            </div>
            <div style={st.totalBlock}>
              <span style={st.totalLabel}>TOTAL HABER</span>
              <h2 style={st.totalMonto}>B/. {formatoMoneda(totalCredito)}</h2>
            </div>
            <div style={totalDebito.toFixed(2)===totalCredito.toFixed(2)?st.statusOk:st.statusErr}>
              {totalDebito.toFixed(2)===totalCredito.toFixed(2)?"✅ Sumas Iguales Correctas":"❌ Descuadrado (Falta Partida Doble)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cssprint = `
  .only-print { display: none; }
  @media print {
    @page { size: A4 landscape; margin: 12mm 10mm; }
    body { background: #fff !important; font-size: 10pt; }
    .no-print { display: none !important; }
    .only-print { display: block !important; }
    table { width: 100% !important; border: 1px solid #000 !important; }
    th { background-color: #f1f5f9 !important; border: 1px solid #000 !important; }
    td { border: 1px solid #e2e8f0 !important; }
    .print-totals { margin-top: 15px !important; border: 1px solid #000 !important; }
  }
`;

const st = {
  page: { minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter','Segoe UI',sans-serif" },
  printHeader: { display:"none", padding:"0 20px 12px", borderBottom:"2px solid #000" },
  container: { maxWidth:"1300px", margin:"0 auto", padding:"20px 16px" },
  card: { background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"20px", marginBottom:"20px" },
  cardTitle: { margin:"0 0 16px", fontSize:"16px", fontWeight:"700", color:"#0f172a" },
  fila2: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:"12px", marginBottom:"14px" },
  grid4: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:"12px" },
  grid4sub: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:"10px", alignItems:"end" },
  inputBox: { display:"flex", flexDirection:"column", gap:"5px" },
  label: { fontSize:"12px", fontWeight:"600", color:"#475569" },
  labelSub: { fontSize:"11px", fontWeight:"600", color:"#64748b" },
  input: { padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"14px", color:"#334155", outline:"none", width:"100%", boxSizing:"border-box" },
  inputSub: { padding:"8px 10px", border:"1px solid #cbd5e1", borderRadius:"6px", fontSize:"13px", color:"#334155", outline:"none", background:"white", width:"100%", boxSizing:"border-box" },
  select: { padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"14px", color:"#334155", outline:"none", background:"white", cursor:"pointer", width:"100%", boxSizing:"border-box" },
  codigoTag: { fontSize:"12px", color:"#475569", display:"flex", alignItems:"center", gap:"6px" },
  tipoBadge: { background:"#f1f5f9", color:"#475569", fontSize:"11px", fontWeight:"700", padding:"2px 8px", borderRadius:"20px" },
  linkBtn: { background:"none", border:"none", color:"#2563eb", fontSize:"11px", fontWeight:"700", cursor:"pointer", padding:0 },
  nuevaCuentaBox: { marginTop:"14px", padding:"16px", background:"#f8fafc", borderRadius:"8px", border:"1px dashed #cbd5e1" },
  formFooter: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"16px", flexWrap:"wrap", gap:"10px" },
  btnSec: { background:"white", color:"#64748b", border:"1.5px solid #e2e8f0", padding:"9px 16px", borderRadius:"8px", cursor:"pointer", fontSize:"13px" },
  btnGuardar: { background:"#10b981", color:"white", border:"none", padding:"10px 20px", borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"14px" },
  tableCard: { background:"white", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"20px" },
  tableWrapper: { overflowX:"auto" },
  table: { width:"100%", borderCollapse:"collapse", minWidth:"700px" },
  th: { borderBottom:"2px solid #0f172a", padding:"12px 10px", textAlign:"left", background:"#f8fafc", color:"#1e293b", fontSize:"12px", fontWeight:"700", whiteSpace:"nowrap" },
  td: { padding:"11px 10px", fontSize:"13px", verticalAlign:"top" },
  glosa: { fontSize:"13px", color:"#475569", fontStyle:"italic", marginTop:"5px", paddingTop:"5px", borderTop:"1px dashed #e2e8f0" },
  refBadge: { fontSize:"11px", fontWeight:"700", color:"#0369a1", background:"#eff6ff", border:"1px solid #bfdbfe", padding:"2px 6px", borderRadius:"4px", fontFamily:"monospace" },
  btnEdit: { background:"#eab308", color:"white", border:"none", padding:"5px 9px", borderRadius:"5px", marginRight:"4px", cursor:"pointer", fontSize:"12px", fontWeight:"600" },
  btnDel: { background:"#ef4444", color:"white", border:"none", padding:"5px 9px", borderRadius:"5px", cursor:"pointer", fontSize:"12px", fontWeight:"600" },
  totales: { marginTop:"20px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#f8fafc", padding:"16px 20px", borderRadius:"10px", border:"1px solid #cbd5e1", flexWrap:"wrap", gap:"12px" },
  totalBlock: { display:"flex", flexDirection:"column" },
  totalLabel: { fontSize:"11px", fontWeight:"700", color:"#64748b" },
  totalMonto: { margin:"2px 0 0", fontSize:"clamp(16px,3vw,20px)", color:"#000", fontWeight:"700", fontFamily:"monospace" },
  statusOk: { background:"#dcfce7", color:"#15803d", padding:"10px 16px", borderRadius:"8px", fontWeight:"700", fontSize:"13px" },
  statusErr: { background:"#fee2e2", color:"#b91c1c", padding:"10px 16px", borderRadius:"8px", fontWeight:"700", fontSize:"13px" },
};
