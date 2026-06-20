import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Corregido el import para resolver el error de Vite

const formatoMoneda = (numero) =>
  Number(numero).toLocaleString("en-US", { minimumFractionDigits: 2 });

// ─── Catálogo Base Inicial (Plan Panameño 4 dígitos) ──────────────────────────
const CATALOGO_INICIAL = [
  // ACTIVOS CORRIENTES
  { codigo: "1010", cuenta: "Caja General",                  grupo: "Activo Corriente" },
  { codigo: "1020", cuenta: "Caja Chica",                    grupo: "Activo Corriente" },
  { codigo: "1030", cuenta: "Banco Nacional",                grupo: "Activo Corriente" },
  { codigo: "1040", cuenta: "Banco General",                 grupo: "Activo Corriente" },
  { codigo: "1050", cuenta: "Cuentas por Cobrar Clientes",   grupo: "Activo Corriente" },
  { codigo: "1060", cuenta: "Documentos por Cobrar",         grupo: "Activo Corriente" },
  { codigo: "1070", cuenta: "Inventario de Mercancías",      grupo: "Activo Corriente" },
  { codigo: "1080", cuenta: "Inventario de Materias Primas", grupo: "Activo Corriente" },
  { codigo: "1090", cuenta: "Gastos Pagados por Anticipado", grupo: "Activo Corriente" },
  { codigo: "1100", cuenta: "ITBMS Acreditable",             grupo: "Activo Corriente" },
  // ACTIVOS NO CORRIENTES
  { codigo: "1200", cuenta: "Terrenos",                      grupo: "Activo No Corriente" },
  { codigo: "1210", cuenta: "Edificios",                     grupo: "Activo No Corriente" },
  { codigo: "1220", cuenta: "Maquinaria y Equipo",           grupo: "Activo No Corriente" },
  { codigo: "1230", cuenta: "Mobiliario y Equipo de Oficina",grupo: "Activo No Corriente" },
  { codigo: "1240", cuenta: "Equipo de Cómputo",             grupo: "Activo No Corriente" },
  { codigo: "1250", cuenta: "Vehículos",                     grupo: "Activo No Corriente" },
  { codigo: "1260", cuenta: "Depreciación Acumulada",        grupo: "Activo No Corriente" },
  // PASIVOS CORRIENTES
  { codigo: "2010", cuenta: "Cuentas por Pagar Proveedores", grupo: "Pasivo Corriente" },
  { codigo: "2020", cuenta: "Documentos por Pagar",          grupo: "Pasivo Corriente" },
  { codigo: "2030", cuenta: "ITBMS por Pagar",               grupo: "Pasivo Corriente" },
  { codigo: "2040", cuenta: "CSS por Pagar",                 grupo: "Pasivo Corriente" },
  { codigo: "2050", cuenta: "Impuesto s/Renta por Pagar",    grupo: "Pasivo Corriente" },
  { codigo: "2060", cuenta: "Sueldos por Pagar",             grupo: "Pasivo Corriente" },
  { codigo: "2070", cuenta: "Ingresos Recibidos por Anticip",grupo: "Pasivo Corriente" },
  // PASIVOS NO CORRIENTES
  { codigo: "2100", cuenta: "Préstamos Bancarios L/P",       grupo: "Pasivo No Corriente" },
  { codigo: "2110", cuenta: "Hipotecas por Pagar",           grupo: "Pasivo No Corriente" },
  // PATRIMONIO
  { codigo: "3010", cuenta: "Capital Social",                grupo: "Patrimonio" },
  { codigo: "3020", cuenta: "Reserva Legal",                 grupo: "Patrimonio" },
  { codigo: "3030", cuenta: "Utilidades Retenidas",          grupo: "Patrimonio" },
  { codigo: "3040", cuenta: "Dividendos por Pagar",          grupo: "Patrimonio" },
  // INGRESOS
  { codigo: "4010", cuenta: "Ventas",                        grupo: "Ingreso" },
  { codigo: "4020", cuenta: "Devoluciones en Ventas",        grupo: "Ingreso" },
  { codigo: "4030", cuenta: "Descuentos en Ventas",          grupo: "Ingreso" },
  { codigo: "4040", cuenta: "Otros Ingresos",                grupo: "Ingreso" },
  { codigo: "4050", cuenta: "Ingresos Financieros",          grupo: "Ingreso" },
  // GASTOS OPERATIVOS
  { codigo: "5010", cuenta: "Gasto de Salarios",             grupo: "Gasto Operativo" },
  { codigo: "5020", cuenta: "Gasto de CSS Patronal",         grupo: "Gasto Operativo" },
  { codigo: "5030", cuenta: "Gasto de Alquiler",             grupo: "Gasto Operativo" },
  { codigo: "5040", cuenta: "Gasto de Servicios Públicos",   grupo: "Gasto Operativo" },
  { codigo: "5050", cuenta: "Gasto de Transporte",           grupo: "Gasto Operativo" },
  { codigo: "5060", cuenta: "Gasto de Publicidad",           grupo: "Gasto Operativo" },
  { codigo: "5070", cuenta: "Gasto de Depreciación",         grupo: "Gasto Operativo" },
  { codigo: "5080", cuenta: "Gasto de Suministros de Oficina",grupo:"Gasto Operativo" },
  { codigo: "5090", cuenta: "Gasto de Seguros",              grupo: "Gasto Operativo" },
  { codigo: "5100", cuenta: "Gasto de Intereses",            grupo: "Gasto Operativo" },
  // COSTO DE VENTAS
  { codigo: "6010", cuenta: "Costo de Ventas",               grupo: "Costo de Venta" },
  { codigo: "6020", cuenta: "Compras",                       grupo: "Costo de Venta" },
  { codigo: "6030", cuenta: "Devoluciones en Compras",       grupo: "Costo de Venta" },
  { codigo: "6040", cuenta: "Descuentos en Compras",         grupo: "Costo de Venta" },
  { codigo: "6050", cuenta: "Flete en Compras",              grupo: "Costo de Venta" },
  // COSTO DE PRODUCCIÓN
  { codigo: "7010", cuenta: "Materia Prima Utilizada",       grupo: "Costo de Producción" },
  { codigo: "7020", cuenta: "Mano de Obra Directa",          grupo: "Costo de Producción" },
  { codigo: "7030", cuenta: "Costos Indirectos de Fabric.",  grupo: "Costo de Producción" },
];

const GRUPOS_ESTATICOS = [
  "Activo Corriente", "Activo No Corriente", 
  "Pasivo Corriente", "Pasivo No Corriente", 
  "Patrimonio", "Ingreso", "Gasto Operativo", 
  "Costo de Venta", "Costo de Producción"
];

const validarCuenta = (codigo) => {
  if (!codigo) return "Cuenta inválida";
  if (codigo.startsWith("1")) return "Activo";
  if (codigo.startsWith("2")) return "Pasivo";
  if (codigo.startsWith("3")) return "Patrimonio";
  if (codigo.startsWith("4")) return "Ingreso";
  if (codigo.startsWith("5")) return "Gasto";
  if (codigo.startsWith("6")) return "Costo Venta";
  if (codigo.startsWith("7")) return "Costo Producción";
  return "Cuenta inválida";
};

const agruparPorAsiento = (movimientos) => {
  if (!movimientos.length) return [];
  const asientos = [];
  let asientoActual = null;
  let numeroAsiento = 1;
  movimientos.forEach((m, i) => {
    const prev = movimientos[i - 1];
    const esNuevo = !prev || prev.fecha !== m.fecha || prev.descripcion !== m.descripcion;
    if (esNuevo) {
      asientoActual = { numero: numeroAsiento++, fecha: m.fecha, descripcion: m.descripcion, lineas: [] };
      asientos.push(asientoActual);
    }
    asientoActual.lineas.push(m);
  });
  return asientos;
};

export default function DiarioGeneral() {
  const navigate   = useNavigate();
  const selectRef  = useRef(null);

  const [catalogo, setCatalogo] = useState(() => {
    const guardado = localStorage.getItem("catalogo_contable_personalizado");
    return guardado ? JSON.parse(guardado) : CATALOGO_INICIAL;
  });

  const [movimientos, setMovimientos] = useState([]);
  const [editando, setEditando]       = useState(null);
  const [empresa, setEmpresa]         = useState(null);

  const formVacio = { fecha: "", codigoCuenta: "", cuenta: "", referencia: "", descripcion: "", debito: "", credito: "" };
  const [form, setForm] = useState(formVacio);

  const [mostrarCrearCuenta, setMostrarCrearCuenta] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({ codigo: "", cuenta: "", grupo: "Activo Corriente" });

  useEffect(() => {
    const empresaActiva = JSON.parse(localStorage.getItem("empresaActiva"));
    if (!empresaActiva) { alert("Por favor, seleccione una empresa."); navigate("/"); return; }
    setEmpresa(empresaActiva);
    cargarMovimientos(empresaActiva.id);
  }, []);

  const cargarMovimientos = async (empresaId) => {
    try {
      const res = await axios.get(`https://sistema-contable-backend-f67j.onrender.com/movimientos/${empresaId}`);
      const refsGuardadas = JSON.parse(localStorage.getItem("referencias_mov") || "{}");
      setMovimientos(res.data.map((m) => ({
        ...m,
        fecha: m.fecha ? m.fecha.split("T")[0] : "",
        referencia: (m.referencia && String(m.referencia).trim()) || refsGuardadas[String(m.id)] || "",
      })));
    } catch (e) { console.log("Error al cargar movimientos:", e); }
  };

  const onSelectCuenta = (e) => {
    const codigo = e.target.value;
    if (!codigo) { setForm((f) => ({ ...f, codigoCuenta: "", cuenta: "" })); return; }
    const item = catalogo.find((c) => c.codigo === codigo);
    if (item) setForm((f) => ({ ...f, codigoCuenta: item.codigo, cuenta: item.cuenta }));
  };

  const agregarNuevaCuentaAlCatalogo = () => {
    const { codigo, cuenta, grupo } = nuevaCuenta;
    if (!codigo.trim() || !cuenta.trim()) {
      alert("Por favor, ingrese el código y el nombre de la nueva cuenta.");
      return;
    }
    if (catalogo.some((c) => c.codigo === codigo)) {
      alert("Este código de cuenta ya existe en el catálogo.");
      return;
    }

    const nuevoCatalogo = [...catalogo, { codigo, cuenta, grupo }].sort((a, b) =>
      a.codigo.localeCompare(b.codigo)
    );

    setCatalogo(nuevoCatalogo);
    localStorage.setItem("catalogo_contable_personalizado", JSON.stringify(nuevoCatalogo));
    
    setForm((f) => ({ ...f, codigoCuenta: codigo, cuenta: cuenta }));
    setMostrarCrearCuenta(false);
    setNuevaCuenta({ codigo: "", cuenta: "", grupo: "Activo Corriente" });
  };

  const guardarMovimiento = async () => {
    if (!form.fecha || !form.codigoCuenta || !form.cuenta) {
      alert("Por favor rellene: Fecha y Cuenta."); return;
    }
    const debitoValue  = parseFloat(form.debito)  || 0;
    const creditoValue = parseFloat(form.credito) || 0;
    if (debitoValue === 0 && creditoValue === 0) { alert("Ingrese un monto en Débito o Crédito."); return; }

    const payload = {
      id: editando,
      empresa_id: empresa.id,
      fecha: form.fecha,
      codigoCuenta: form.codigoCuenta,
      cuenta: form.cuenta,
      referencia: form.referencia,
      descripcion: form.descripcion,
      debito: debitoValue,
      credito: creditoValue,
      tipoCuenta: validarCuenta(form.codigoCuenta),
    };
    try {
      const res = await axios.post("https://sistema-contable-backend-f67j.onrender.com/movimientos", payload);
      if (form.referencia && form.referencia.trim()) {
        const savedId = res.data?.id || editando;
        if (savedId) {
          const refs = JSON.parse(localStorage.getItem("referencias_mov") || "{}");
          refs[String(savedId)] = form.referencia.trim();
          localStorage.setItem("referencias_mov", JSON.stringify(refs));
        }
      }
      setEditando(null);
      setForm((f) => ({ ...formVacio, fecha: f.fecha, descripcion: f.descripcion }));
      await cargarMovimientos(empresa.id);
    } catch (e) { console.log("Error al guardar:", e); }
  };

  const siguienteAsiento = () => { setEditando(null); setForm(formVacio); };

  const editarMovimiento = (m) => {
    setEditando(m.id);
    setForm({ fecha: m.fecha, codigoCuenta: m.codigoCuenta, cuenta: m.cuenta, referencia: m.referencia || "", descripcion: m.descripcion, debito: m.debito, credito: m.credito });
  };

  const eliminarMovimiento = async (id) => {
    if (window.confirm("¿Eliminar este registro?")) {
      try { await axios.delete(`https://sistema-contable-backend-f67j.onrender.com/movimientos/${id}`); await cargarMovimientos(empresa.id); }
      catch (e) { console.log("Error al eliminar:", e); }
    }
  };

  const totalDebito  = movimientos.reduce((a, m) => a + Number(m.debito), 0);
  const totalCredito = movimientos.reduce((a, m) => a + Number(m.credito), 0);
  const asientos     = agruparPorAsiento(movimientos);

  const gruposDinamicos = [...new Set(catalogo.map((c) => c.grupo))];

  return (
    <div style={st.page}>
      <style>{st.cssImpresion}</style>

      {empresa && (
        <div style={st.empresaHeader} className="print-header-block">
          <h2 style={st.empresaNombre}>{empresa.nombre}</h2>
          <p style={st.empresaPeriodo}>
            Libro Diario General <span style={{ color: "#cbd5e1", margin: "0 6px" }}>|</span>
            Periodo contable: {empresa.periodo_inicio?.split("T")[0]} al {empresa.periodo_fin?.split("T")[0]}
          </p>
          <div style={st.actionRow} className="no-print">
            <div style={st.btnGroup}>
              <button style={{ ...st.btnNav, ...st.btnNavActive }} onClick={() => navigate("/diario")}>Libro Diario</button>
              <button style={st.btnNav} onClick={() => navigate("/mayorizar")}>Mayorización</button>
              <button style={st.btnNav} onClick={() => navigate("/resultados")}>Estado Resultado</button>
              <button style={st.btnNav} onClick={() => navigate("/balance")}>Balance General</button>
            </div>
            
            {/* Los botones "Cambiar Empresa" y "Cerrar sesión" agrupados juntos a la derecha */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={st.btnDanger} onClick={() => navigate("/inicio")}>Cambiar Empresa</button> 
              <button style={st.btnCerrarSesion} onClick={() => navigate("/")}>Cerrar sesión</button> 
            </div>
          </div>
          <h3 className="only-print" style={st.tituloReportePdf}>LIBRO DIARIO GENERAL OFICIAL</h3>
        </div>
      )}

      {/* ── Formulario de Transacciones ── */}
      <div style={st.card} className="no-print">
        <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: "12px", marginBottom: "12px" }}>
          <div style={st.inputBox}>
            <label style={st.label}>Fecha</label>
            <input type="date" value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={st.inputDate} />
          </div>
          <div style={st.inputBox}>
            <label style={st.label}>Descripción del Asiento</label>
            <input placeholder="Ej: Registro de aporte inicial de socios"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              style={st.input} />
          </div>
        </div>

        <div style={st.gridInputs}>
          <div style={st.inputBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={st.label}>Tipo de Cuenta Contable</label>
              <button 
                type="button" 
                onClick={() => setMostrarCrearCuenta(!mostrarCrearCuenta)} 
                style={st.btnCrearCuentaLink}
              >
                {mostrarCrearCuenta ? "✕ Cancelar" : "➕ Crear cuenta"}
              </button>
            </div>
            <select
              ref={selectRef}
              value={form.codigoCuenta}
              onChange={onSelectCuenta}
              style={st.select}
            >
              <option value="">— Seleccione una cuenta —</option>
              {gruposDinamicos.map((grupo) => (
                <optgroup key={grupo} label={grupo}>
                  {catalogo.filter((c) => c.grupo === grupo).map((c) => (
                    <option key={c.codigo} value={c.codigo}>
                      {c.codigo} — {c.cuenta}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {form.codigoCuenta && (
              <span style={st.codigoTag}>
                Código: <strong>{form.codigoCuenta}</strong>
                <span style={st.tipoTag}>{validarCuenta(form.codigoCuenta)}</span>
              </span>
            )}
          </div>

          <div style={st.inputBox}>
            <label style={st.label}>Ref. / N° Documento</label>
            <input
              type="text"
              placeholder="Ej: CHQ-001, FAC-A23, F-102"
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
              style={{ ...st.input, fontFamily: "monospace", letterSpacing: "0.02em" }}
              maxLength={50}
            />
            <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              Cheque, factura, folio, orden de compra, etc.
            </span>
          </div>

          <div style={st.inputBox}>
            <label style={st.label}>Débito (Debe)</label>
            <input type="number" placeholder="0.00" value={form.debito}
              onChange={(e) => setForm({ ...form, debito: e.target.value })}
              style={st.inputMonto} />
          </div>

          <div style={st.inputBox}>
            <label style={st.label}>Crédito (Haber)</label>
            <input type="number" placeholder="0.00" value={form.credito}
              onChange={(e) => setForm({ ...form, credito: e.target.value })}
              style={st.inputMonto} />
          </div>
        </div>

        {mostrarCrearCuenta && (
          <div style={st.seccionCrearCuenta}>
            <h4 style={{ margin: "0 0 10px 0", color: "#1e293b", fontSize: "13.5px", fontWeight: "700" }}>
              Panel de Control: Registrar Nueva Cuenta Estructurada
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "120px 2fr 2fr auto", gap: "10px", alignItems: "end" }}>
              <div style={st.inputBox}>
                <label style={st.labelSub}>Código (4 dig.)</label>
                <input 
                  type="text" 
                  maxLength={6} 
                  placeholder="Ej: 1035" 
                  value={nuevaCuenta.codigo}
                  onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, codigo: e.target.value })}
                  style={st.inputSub}
                />
              </div>
              <div style={st.inputBox}>
                <label style={st.labelSub}>Nombre de la Cuenta</label>
                <input 
                  type="text" 
                  placeholder="Ej: Banco General Especial" 
                  value={nuevaCuenta.cuenta}
                  onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, cuenta: e.target.value })}
                  style={st.inputSub}
                />
              </div>
              <div style={st.inputBox}>
                <label style={st.labelSub}>Clasificación del Grupo</label>
                <select 
                  value={nuevaCuenta.grupo}
                  onChange={(e) => setNuevaCuenta({ ...nuevaCuenta, grupo: e.target.value })}
                  style={st.selectSub}
                >
                  {GRUPOS_ESTATICOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button 
                type="button" 
                onClick={agregarNuevaCuentaAlCatalogo} 
                style={st.btnGuardarCuenta}
              >
                ✔ Registrar en Catálogo
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "18px" }}>
          <p style={st.money}>Moneda Oficial: Balboas (B/.)</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button style={st.btnPrint} onClick={() => window.print()}>Imprimir / PDF</button>
            {(form.fecha || form.descripcion) && (
              <button style={st.btnSiguiente} onClick={siguienteAsiento}>Siguiente asiento →</button>
            )}
            <button style={st.save} onClick={guardarMovimiento}>
              {editando !== null ? "✓ Guardar Cambios" : "+ Insertar Fila"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabla por asientos ── */}
      <div style={st.tableCard} className="print-container">
        <table style={st.table}>
          <thead>
            <tr>
              <th style={{ ...st.th, width: "5%",  textAlign: "center" }}>N°</th>
              <th style={{ ...st.th, width: "9%" }}>Fecha</th>
              <th style={{ ...st.th, width: "8%" }}>Código</th>
              <th style={st.th}>Cuentas y Detalle</th>
              <th style={{ ...st.th, width: "8%",  textAlign: "center" }}>Ref.</th>
              <th style={{ ...st.th, textAlign: "right", width: "13%" }}>Debe</th>
              <th style={{ ...st.th, textAlign: "right", width: "13%" }}>Haber</th>
              <th style={{ ...st.th, width: "9%" }} className="no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asientos.map((asiento) =>
              asiento.lineas.map((m, lineaIdx) => {
                const esHaber       = Number(m.credito) > 0;
                const esPrimeraLinea = lineaIdx === 0;
                const esUltimaLinea  = lineaIdx === asiento.lineas.length - 1;
                return (
                  <tr key={m.id} style={{ borderBottom: esUltimaLinea ? "2px solid #cbd5e1" : "1px dashed #e2e8f0" }}>
                    <td style={{ ...st.tdNumero, color: esPrimeraLinea ? "#1e293b" : "transparent" }}>
                      {esPrimeraLinea ? asiento.numero : ""}
                    </td>
                    <td style={st.tdCentral}>{esPrimeraLinea ? m.fecha : ""}</td>
                    <td style={st.tdCodigo}>{m.codigoCuenta}</td>
                    <td style={{ ...st.tdCuenta, paddingLeft: esHaber ? "40px" : "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>{esHaber ? `a ${m.cuenta}` : m.cuenta}</span>
                        {m.referencia && (
                          <span style={st.refBadge}>{m.referencia}</span>
                        )}
                      </div>
                      {esUltimaLinea && m.descripcion && (
                        <div style={st.glosa}>{m.descripcion}</div>
                      )}
                    </td>
                    <td style={st.tdRef}>{m.referencia || "—"}</td>
                    <td style={st.tdMonto}>{Number(m.debito)  > 0 ? `B/. ${formatoMoneda(m.debito)}`  : ""}</td>
                    <td style={st.tdMonto}>{Number(m.credito) > 0 ? `B/. ${formatoMoneda(m.credito)}` : ""}</td>
                    <td style={st.td} className="no-print">
                      <button style={st.edit}   onClick={() => editarMovimiento(m)}>Editar</button>
                      <button style={st.delete} onClick={() => eliminarMovimiento(m.id)}>Borrar</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div style={st.total} className="print-totals">
          <div style={st.totalBlock}>
            <span style={st.totalLabel}>TOTAL DEBE</span>
            <h2 style={st.totalMonto}>B/. {formatoMoneda(totalDebito)}</h2>
          </div>
          <div style={st.totalBlock}>
            <span style={st.totalLabel}>TOTAL HABER</span>
            <h2 style={st.totalMonto}>B/. {formatoMoneda(totalCredito)}</h2>
          </div>
          <div style={st.statusContainer}>
            {totalDebito.toFixed(2) === totalCredito.toFixed(2)
              ? <div style={st.statusSuccess}>✅ Sumas Iguales Correctas</div>
              : <div style={st.statusError}>❌ Descuadrado (Falta Partida Doble)</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const st = {
  page: { padding: "30px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },
  empresaHeader: { background: "white", padding: "30px 32px", borderRadius: "16px", marginBottom: "25px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.05)" },
  empresaNombre: { margin: 0, color: "#000", fontSize: "32px", fontWeight: "700", letterSpacing: "-0.025em" },
  empresaPeriodo: { margin: "6px 0 24px 0", color: "#64748b", fontSize: "15px" },
  tituloReportePdf: { margin: "15px 0 0 0", color: "#1f2937", borderTop: "2px dashed #e2e8f0", paddingTop: "10px", fontSize: "16px", fontWeight: "bold", textAlign: "center" },
  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  btnGroup: { display: "flex", gap: "10px", flexWrap: "wrap" },
  btnNav: { background: "#f1f5f9", color: "#334155", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" },
  btnNavActive: { background: "#1e293b", color: "white", fontWeight: "600" },
  
  btnDanger: { background: "white", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" },
  btnCerrarSesion: { background: "white", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px" },
  
  money: { fontWeight: "700", color: "#475569", margin: 0, fontSize: "14px" },

  card: { background: "white", padding: "24px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #e2e8f0" },
  gridInputs: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px" },
  inputBox: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#475569" },

  btnCrearCuentaLink: { background: "none", border: "none", color: "#2563eb", fontSize: "11px", fontWeight: "700", cursor: "pointer", outline: "none", padding: 0 },
  seccionCrearCuenta: { marginTop: "15px", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" },
  labelSub: { fontSize: "11px", fontWeight: "600", color: "#64748b" },
  inputSub: { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", color: "#334155", outline: "none", background: "white" },
  selectSub: { padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", color: "#334155", outline: "none", background: "white", cursor: "pointer" },
  btnGuardarCuenta: { background: "#1e293b", color: "white", border: "none", padding: "9px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },

  select: { padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#334155", outline: "none", background: "white", cursor: "pointer", appearance: "auto" },
  codigoTag: { fontSize: "12px", color: "#475569", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" },
  tipoTag: { background: "#f1f5f9", color: "#475569", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", border: "1px solid #e2e8f0" },

  input: { padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#334155", outline: "none" },
  inputDate: { padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#475569", outline: "none", background: "#f8fafc" },
  inputMonto: { padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#334155", outline: "none", textAlign: "right", fontWeight: "600" },

  save:        { background: "#10b981", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  btnPrint:    { background: "#64748b", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  btnSiguiente:{ background: "transparent", color: "#64748b", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px" },

  tableCard: { background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { borderBottom: "2px solid #0f172a", padding: "14px 12px", textAlign: "left", background: "#f8fafc", color: "#1e293b", fontSize: "13px", fontWeight: "700" },

  tdNumero:  { padding: "12px 8px", fontSize: "13px", textAlign: "center", verticalAlign: "top", fontWeight: "700", borderRight: "2px solid #e2e8f0" },
  tdCentral: { padding: "12px", fontSize: "13px", color: "#64748b", textAlign: "center", verticalAlign: "top", whiteSpace: "nowrap" },
  tdCodigo:  { padding: "12px", fontSize: "13.5px", color: "#1e3a8a", fontWeight: "700", fontFamily: "monospace", verticalAlign: "top" },
  tdCuenta:  { padding: "12px 12px 8px 12px", fontSize: "15px", fontWeight: "600", color: "#0f172a", verticalAlign: "top" },

  glosa: { fontSize: "14px", color: "#475569", fontWeight: "400", fontStyle: "italic", marginTop: "5px", paddingTop: "5px", borderTop: "1px dashed #e2e8f0" },
  refBadge: { fontSize: "12px", fontWeight: "700", color: "#0369a1", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace", whiteSpace: "nowrap" },
  tdRef: { padding: "12px 10px", fontSize: "13px", color: "#0369a1", textAlign: "center", fontFamily: "monospace", fontWeight: "600", verticalAlign: "top", whiteSpace: "nowrap" },

  tdMonto: { padding: "12px", fontSize: "14px", textAlign: "right", fontFamily: "monospace", fontWeight: "600", color: "#000", verticalAlign: "top" },
  td: { padding: "12px", verticalAlign: "top" },
  edit:   { background: "#eab308", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", marginRight: "5px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  delete: { background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },

  total: { marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "20px", borderRadius: "10px", border: "1px solid #cbd5e1" },
  totalBlock: { display: "flex", flexDirection: "column" },
  totalLabel: { fontSize: "11px", fontWeight: "700", color: "#64748b" },
  totalMonto: { margin: "2px 0 0 0", fontSize: "20px", color: "#000", fontWeight: "700", fontFamily: "monospace" },
  statusContainer: { display: "flex", alignItems: "center" },
  statusSuccess: { background: "#dcfce7", color: "#15803d", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "14px" },
  statusError:   { background: "#fee2e2", color: "#b91c1c", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "14px" },

  cssImpresion: `
    .only-print { display: none; }
    @media print {
      @page { size: A4 landscape; margin: 12mm 10mm; }
      body { background: #ffffff !important; color: #000000 !important; font-size: 10pt; }
      .no-print { display: none !important; }
      .only-print { display: block !important; }
      .print-header-block { padding: 0 0 12px 0 !important; margin-bottom: 20px !important; border-bottom: 2px solid #000000 !important; border-radius: 0 !important; box-shadow: none !important; }
      .print-header-block h2 { color: #000000 !important; font-size: 24px !important; }
      .print-container { background: transparent !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
      table { width: 100% !important; border: 1px solid #000000 !important; }
      th { background-color: #f1f5f9 !important; color: #000000 !important; border: 1px solid #000000 !important; padding: 8px !important; font-weight: bold !important; }
      td { border: 1px solid #e2e8f0 !important; padding: 8px !important; }
      .print-totals { margin-top: 15px !important; padding: 12px !important; background: #ffffff !important; border: 1px solid #000000 !important; }
      .print-totals h2 { font-size: 14pt !important; margin: 0 !important; color: #000000 !important; }
    }
  `,
};