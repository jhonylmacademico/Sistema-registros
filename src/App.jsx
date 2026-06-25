import { useState, useEffect } from 'react';
import { Monitor, Printer, Network, Laptop, LogOut, Plus, Search, FileText, ShieldCheck, Save, Trash2, ArrowLeft, Download, Key, Building2, Warehouse } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CENTROS_DEFAULT = [
  { id: 'sucre', nombre: 'Multicentro Sucre' },
  { id: 'americas', nombre: 'Multicentro Las Americas' },
  { id: 'victoria', nombre: 'Multicentro Victoria' },
  { id: 'monteagudo', nombre: 'Multicentro Monteagudo' },
  { id: 'camargo', nombre: 'Multicentro Camargo' }
];

const CAMPOS_DISPONIBLES = [
  { key: 'numero', label: 'N° Registro' },
  { key: 'tipo', label: 'Tipo Equipo' },
  { key: 'nombreEquipo', label: 'Nombre Equipo' },
  { key: 'marca', label: 'Marca (Gen/Imp)' },
  { key: 'modelo', label: 'Modelo (Gen/Imp)' },
  { key: 'marcaCPU', label: 'Marca CPU' },
  { key: 'modeloCPU', label: 'Modelo CPU' },
  { key: 'marcaMonitor', label: 'Marca Monitor' },
  { key: 'procesador', label: 'Procesador' },
  { key: 'generacion', label: 'Generación' },
  { key: 'ram', label: 'RAM' },
  { key: 'tipoDisco', label: 'Tipo Disco 1' },
  { key: 'capacidadDisco', label: 'Capacidad Disco 1' },
  { key: 'sistemaOperativo', label: 'Sistema Operativo' },
  { key: 'numeroSerie', label: 'N° Serie (Gen)' },
  { key: 'estado', label: 'Estado' },
  { key: 'enAlmacen', label: 'En Almacén' },
  { key: 'piso', label: 'Piso' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'personaAsignada', label: 'Persona Asignada' },
  { key: 'numeroEmpleado', label: 'N° Empleado' }
];

const datosIniciales = [
  { id: '1', centro: 'sucre', numero: '0001', tipo: 'Laptop', nombreEquipo: 'LAP-JPEREZ', marca: 'Lenovo', modelo: 'ThinkPad T14', codigoActivo: 'AF-LAP-001', numeroSerie: 'LP-001-ABC', procesador: 'Intel Core i5', generacion: '10ma', ram: '8 GB', tipoDisco: 'SSD M.2', capacidadDisco: '256 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: 'Windows 11 Pro', mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.101', estado: 'Activo', enAlmacen: false, piso: '2', cargo: 'Contador', numeroEmpleado: 'EMP-001', personaAsignada: 'Juan Pérez', nombreResponsable: 'Juan Pérez', fechaAsignacion: '2024-01-15', notas: '' },
  { id: '2', centro: 'sucre', numero: '0002', tipo: 'Laptop', marca: 'Dell', modelo: 'Latitude 5520', codigoActivo: 'AF-LAP-002', numeroSerie: 'LP-002-NEW', procesador: 'Intel Core i7', generacion: '11va', ram: '16 GB', tipoDisco: 'SSD M.2', capacidadDisco: '512 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: 'Windows 11 Pro', estado: 'Activo', enAlmacen: true, piso: '', notas: 'Equipo nuevo en stock' }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [customPass, setCustomPass] = useState('admin123');
  const [vista, setVista] = useState('hub');
  const [centroActual, setCentroActual] = useState(null);
  const [activos, setActivos] = useState([]);
  const [centros, setCentros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState('');
  const [camposSeleccionados, setCamposSeleccionados] = useState(['numero', 'tipo', 'nombreEquipo', 'procesador', 'ram', 'estado', 'personaAsignada']);

  useEffect(() => {
    const c = localStorage.getItem('mis_centros_v6'); if (c) setCentros(JSON.parse(c)); else { setCentros(CENTROS_DEFAULT); localStorage.setItem('mis_centros_v6', JSON.stringify(CENTROS_DEFAULT)); }
    const d = localStorage.getItem('activos_fijos_v6'); if (d) setActivos(JSON.parse(d)); else { setActivos(datosIniciales); localStorage.setItem('activos_fijos_v6', JSON.stringify(datosIniciales)); }
    const p = localStorage.getItem('app_pass_v6'); if (p) setCustomPass(p);
  }, []);

  const guardarDatos = (n) => { setActivos(n); localStorage.setItem('activos_fijos_v6', JSON.stringify(n)); };
  const handleLogin = (e) => { e.preventDefault(); if (user === 'admin' && pass === customPass) setIsLoggedIn(true); };
  const getNextNumber = () => { const d = JSON.parse(localStorage.getItem('activos_fijos_v6') || '[]'); return (d.reduce((m, a) => Math.max(m, parseInt(a.numero || '0')), 0) + 1).toString().padStart(4, '0'); };
  
  const agregarCentro = () => { const n = prompt('Nombre del nuevo Multicentro:'); if (n && n.trim()) { const nc = [...centros, { id: n.trim().toLowerCase().replace(/\s+/g, '_'), nombre: n.trim() }]; setCentros(nc); localStorage.setItem('mis_centros_v6', JSON.stringify(nc)); setMsg('Agregado'); setTimeout(()=>setMsg(''), 2000); } };
  const limpiarFormulario = () => { setEditando(null); setVista('formulario'); };

  const getValor = (a, key) => { if (key === 'enAlmacen') return a.enAlmacen ? 'SÍ' : 'NO'; return a[key] || '-'; };

  const handleCheck = (key) => { setCamposSeleccionados(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]); };

  const exportarCSV = () => {
    const datosC = activos.filter(a => a.centro === centroActual);
    const headers = camposSeleccionados.map(k => CAMPOS_DISPONIBLES.find(c=>c.key===k)?.label || k);
    const rows = datosC.map(a => camposSeleccionados.map(k => getValor(a, k)));
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'Reporte_Personalizado.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    setMsg('Excel descargado'); setTimeout(()=>setMsg(''), 3000);
  };

  const exportarPDF = () => {
    const datosC = activos.filter(a => a.centro === centroActual);
    const headers = camposSeleccionados.map(k => CAMPOS_DISPONIBLES.find(c=>c.key===k)?.label || k);
    const rows = datosC.map(a => camposSeleccionados.map(k => String(getValor(a, k))));
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.text("Reporte de Activos Fijos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Centro: ${centros.find(c=>c.id===centroActual)?.nombre || ''} - Fecha: ${new Date().toLocaleDateString()}`, 14, 22);
    autoTable(doc, { startY: 28, head: [headers], body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [30, 58, 95] } });
    doc.save('Reporte_Activos.pdf');
    setMsg('PDF descargado'); setTimeout(()=>setMsg(''), 3000);
  };

  if (!isLoggedIn) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700'>
          <div className='flex justify-center mb-6 text-blue-400'><ShieldCheck size={48} /></div>
          <h1 className='text-white text-2xl font-bold text-center mb-6'>Control de Activos Fijos</h1>
          <form onSubmit={handleLogin} className='space-y-4'>
            <input type='text' placeholder='Usuario' value={user} onChange={e => setUser(e.target.value)} className='w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600' />
            <input type='password' placeholder='Contraseña' value={pass} onChange={e => setPass(e.target.value)} className='w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600' />
            <button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold'>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  const datosFinales = centroActual ? activos.filter(a => a.centro === centroActual) : [];
  const estadoCount = (e) => datosFinales.filter(a => a.estado === e).length;
  const enAlmacenCount = datosFinales.filter(a => a.enAlmacen).length;
  const activosFiltrados = datosFinales.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.marcaCPU||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.personaAsignada||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numeroSerie||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numero||'').includes(busqueda) || (a.numeroEmpleado||'').toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className='min-h-screen bg-gray-100 pb-20'>
      {msg && <div className='bg-green-500 text-white text-center p-2 font-bold fixed top-0 left-0 right-0 z-50'>{msg}</div>}
      <div className='bg-blue-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-10'>
        <div className='flex gap-3 items-center'>
          {centroActual && <button onClick={() => { setCentroActual(null); setVista('hub'); setBusqueda(''); }} className='bg-blue-800 p-2 rounded-lg'><ArrowLeft size={20} /></button>}
          {!centroActual && <button onClick={() => setVista('config')} className='bg-blue-800 p-2 rounded-lg'><Key size={20} /></button>}
          <h1 className='text-lg font-bold'>{centroActual ? centros.find(c => c.id === centroActual)?.nombre : 'Multicentros'}</h1>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className='bg-blue-800 p-2 rounded-lg'><LogOut size={20} /></button>
      </div>

      <div className='p-4'>
        {vista === 'hub' && (
          <div className='space-y-4'>
            <div className='flex justify-between items-center mb-2'>
              <div className='flex items-center gap-2 text-gray-600'><Building2 size={20} /><h2 className='text-xl font-bold text-gray-800'>Seleccionar Centro</h2></div>
              <button onClick={agregarCentro} className='bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold'><Plus size={18} /> Agregar</button>
            </div>
            <div className='grid grid-cols-1 gap-4'>
              {centros.map(c => (<button key={c.id} onClick={() => { setCentroActual(c.id); setVista('dashboard'); setBusqueda(''); }} className='p-6 rounded-xl shadow-sm border-l-4 border-blue-500 bg-blue-50 text-left active:bg-gray-200'><h3 className='text-lg font-bold text-gray-800'>{c.nombre}</h3><p className='text-sm text-gray-500 mt-1'>{activos.filter(a => a.centro === c.id).length} activos</p></button>))}
            </div>
          </div>
        )}

        {centroActual && vista === 'dashboard' && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-gray-800'>Resumen General</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-500'><p className='text-gray-500 text-sm'>Total</p><p className='text-3xl font-bold text-gray-800'>{datosFinales.length}</p></div>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-500'><p className='text-gray-500 text-sm'>En Almacén</p><p className='text-3xl font-bold text-indigo-600'>{enAlmacenCount}</p></div>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500'><p className='text-gray-500 text-sm'>Activos</p><p className='text-3xl font-bold text-green-600'>{estadoCount('Activo')}</p></div>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500'><p className='text-gray-500 text-sm'>Dañados/Mant.</p><p className='text-3xl font-bold text-red-600'>{estadoCount('Dañado') + estadoCount('En Mantenimiento')}</p></div>
            </div>
          </div>
        )}

        {centroActual && vista === 'lista' && (
          <div>
            <div className='flex gap-2 mb-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-3.5 text-gray-400' size={18} />
                <input placeholder='Buscar equipo, N° empleado...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm' />
              </div>
              <button onClick={limpiarFormulario} className='bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2 shadow-sm'><Plus size={20} /> Nuevo</button>
            </div>
            <div className='space-y-3'>
              {activosFiltrados.length === 0 ? <p className='text-center text-gray-500 mt-10'>Sin activos.</p> : 
              activosFiltrados.map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('formulario'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-400 active:bg-gray-50'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-xs text-blue-600 font-bold'>N° {a.numero} {a.numeroEmpleado ? '| '+a.numeroEmpleado : ''}</p>
                      <h3 className='font-bold text-gray-800'>{a.nombreEquipo || (a.marcaCPU || a.marca) + ' ' + (a.modeloCPU || a.modelo)}</h3>
                      <p className='text-sm text-gray-500'>{a.tipo} {a.subtipoImpresora ? '- '+a.subtipoImpresora : ''}</p>
                    </div>
                    <div className='text-right'>
                      {a.enAlmacen && <span className='text-xs font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 block mb-1'><Warehouse size={12} className='inline mr-1'/>Almacén</span>}
                      <span className={'text-xs font-bold px-2 py-1 rounded-full ' + (a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{a.estado}</span>
                    </div>
                  </div>
                  <div className='mt-2 text-sm text-gray-600 border-t pt-2 flex justify-between'>
                    <span>{a.personaAsignada ? '👤 ' + a.personaAsignada : '🏢 En Stock'}</span>
                    <span>{a.piso ? '📍 Piso ' + a.piso : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {centroActual && vista === 'reporte' && (
          <div className='space-y-4'>
            <div className='bg-white p-4 rounded-xl shadow-sm'>
              <h2 className='font-bold text-gray-800 mb-3'>1. Selecciona qué columnas quieres en tu reporte:</h2>
              <div className='grid grid-cols-2 gap-2'>
                {CAMPOS_DISPONIBLES.map(c => (
                  <label key={c.key} className={'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ' + (camposSeleccionados.includes(c.key) ? 'bg-blue-50 border-blue-500 text-blue-800 font-medium' : 'bg-gray-50 border-gray-200')}>
                    <input type='checkbox' checked={camposSeleccionados.includes(c.key)} onChange={() => handleCheck(c.key)} className='accent-blue-600' />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            
            <div className='grid grid-cols-2 gap-4'>
              <button onClick={exportarCSV} className='bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm'><Download size={20} /> Descargar Excel</button>
              <button onClick={exportarPDF} className='bg-red-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm'><FileText size={20} /> Descargar PDF</button>
            </div>

            {camposSeleccionados.length > 0 && (
              <div className='bg-white p-4 rounded-xl shadow-sm overflow-x-auto'>
                <h3 className='text-sm font-bold text-gray-500 mb-2 text-center'>VISTA PREVIA DEL REPORTE</h3>
                <table className='w-full text-sm text-left text-gray-500 min-w-[500px]'>
                  <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                    <tr>{camposSeleccionados.map(k => <th key={k} className='px-2 py-2'>{CAMPOS_DISPONIBLES.find(c=>c.key===k)?.label}</th>)}</tr>
                  </thead>
                  <tbody>
                    {datosFinales.slice(0, 5).map(a => (
                      <tr key={a.id} className='border-b'>
                        {camposSeleccionados.map(k => <td key={k} className='px-2 py-2'>{getValor(a, k)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {datosFinales.length > 5 && <p className='text-xs text-gray-400 text-center mt-2'>Mostrando 5 de {datosFinales.length} registros...</p>}
              </div>
            )}
          </div>
        )}

        {centroActual && vista === 'formulario' && <FormularioActivo activo={editando} guardarDatos={guardarDatos} setVista={setVista} getNextNumber={getNextNumber} centroActual={centroActual} />}
        {vista === 'config' && <ConfigVista customPass={customPass} setCustomPass={setCustomPass} setVista={setVista} setMsg={setMsg} />}
      </div>

      {centroActual && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
          <button onClick={() => setVista('dashboard')} className={'flex flex-col items-center text-xs ' + (vista === 'dashboard' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Inicio</span></button>
          <button onClick={() => setVista('lista')} className={'flex flex-col items-center text-xs ' + (vista === 'lista' ? 'text-blue-600' : 'text-gray-400')}><Search size={24} /><span>Inventario</span></button>
          <button onClick={() => setVista('reporte')} className={'flex flex-col items-center text-xs ' + (vista === 'reporte' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Reportes</span></button>
        </div>
      )}
    </div>
  );
}

function ConfigVista({ customPass, setCustomPass, setVista, setMsg }) {
  const [nueva, setNueva] = useState('');
  const handleChange = (e) => { e.preventDefault(); if (nueva.length < 4) { alert('Mínimo 4 caracteres'); return; } setCustomPass(nueva); localStorage.setItem('app_pass_v6', nueva); setMsg('Contraseña actualizada'); setTimeout(() => setMsg(''), 3000); setVista('hub'); };
  return (<div className='bg-white p-6 rounded-xl shadow-sm'><button onClick={() => setVista('hub')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver</button><h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'><Key size={24} /> Cambiar Contraseña</h2><form onSubmit={handleChange} className='space-y-4'><input type='password' value={nueva} onChange={e => setNueva(e.target.value)} required className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50' placeholder='Nueva contraseña' /><button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold'>Guardar</button></form></div>);
}

function FormularioActivo({ activo, guardarDatos, setVista, getNextNumber, centroActual }) {
  const [form, setForm] = useState(activo || { id: Date.now().toString(), centro: centroActual, numero: getNextNumber(), tipo: 'Laptop', subtipoImpresora: 'Impresora Normal', nombreEquipo: '', marca: '', modelo: '', codigoActivo: '', numeroSerie: '', procesador: '', generacion: '', ram: '', tipoDisco: 'SSD M.2', capacidadDisco: '', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: '', mac: '', ip: '', estado: 'Activo', enAlmacen: false, piso: '', cargo: '', numeroEmpleado: '', personaAsignada: '', nombreResponsable: '', fechaAsignacion: '', marcaCPU: '', modeloCPU: '', codigoActivoCPU: '', numeroSerieCPU: '', marcaMonitor: '', modeloMonitor: '', codigoActivoMonitor: '', oficina: '', conexionImpresora: 'En Red', notas: '' });

  const h = (e) => { const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm({ ...form, [e.target.name]: val }); };
  
  const handleSubmit = (e) => { e.preventDefault(); const datos = JSON.parse(localStorage.getItem('activos_fijos_v6') || '[]'); if (activo) { guardarDatos(datos.map(a => a.id === activo.id ? form : a)); } else { guardarDatos([...datos, form]); } setVista('lista'); };
  const handleEliminar = () => { if (confirm('¿Eliminar este activo?')) { const datos = JSON.parse(localStorage.getItem('activos_fijos_v6') || '[]'); guardarDatos(datos.filter(a => a.id !== form.id)); setVista('lista'); } };

  return (
    <div>
      <button onClick={() => setVista('lista')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver al Inventario</button>
      <form onSubmit={handleSubmit} className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
        <h2 className='font-bold text-lg text-gray-800 border-b pb-2'>{activo ? 'Editar Activo N° ' + form.numero : 'Registrar Nuevo Activo'}</h2>
        
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>N° REGISTRO</label><input name='numero' value={form.numero} readOnly className='w-full p-3 border border-gray-200 rounded-lg bg-blue-50 text-blue-800 font-bold' /></div>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>TIPO EQUIPO</label><select name='tipo' value={form.tipo} onChange={h} className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50'><option>Laptop</option><option>Computadora de Escritorio</option><option>Impresora</option><option>Switch</option></select></div>
        </div>

        {form.tipo === 'Laptop' && (<><div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'><p className='text-xs font-bold text-blue-600'>DATOS LAPTOP</p><div className='grid grid-cols-2 gap-3'><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Máquina</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1">Código Activo Fijo</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1">Número de Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div><CamposSpecs form={form} h={h} /><CamposUbicacion form={form} h={h} /></>)}

        {form.tipo === 'Computadora de Escritorio' && (<><div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'><p className='text-xs font-bold text-blue-600'>DATOS CPU</p><div className='grid grid-cols-2 gap-3'><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Equipo</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca CPU</label><input name='marcaCPU' value={form.marcaCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo CPU</label><input name='modeloCPU' value={form.modeloCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Código Activo CPU</label><input name='codigoActivoCPU' value={form.codigoActivoCPU||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1">Serie CPU</label><input name='numeroSerieCPU' value={form.numeroSerieCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div><div className='bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 space-y-3'><p className='text-xs font-bold text-yellow-700'>DATOS MONITOR</p><div className='grid grid-cols-2 gap-3'><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca Monitor</label><input name='marcaMonitor' value={form.marcaMonitor||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo Monitor</label><input name='modeloMonitor' value={form.modeloMonitor||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Código Activo Monitor</label><input name='codigoActivoMonitor' value={form.codigoActivoMonitor||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div><CamposSpecs form={form} h={h} /><CamposUbicacion form={form} h={h} /></>)}

        {form.tipo === 'Impresora' && (<div className='bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 space-y-3'><p className='text-xs font-bold text-orange-600'>DATOS IMPRESORA / SCANNER</p><div className='grid grid-cols-2 gap-3'><div><label className='block text-xs font-medium text-gray-700 mb-1'>Subtipo</label><select name='subtipoImpresora' value={form.subtipoImpresora||'Impresora Normal'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Impresora Normal</option><option>Multifuncional</option><option>Scanner</option></select></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Dañado</option></select></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1">Código Activo</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Conexión</label><select name='conexionImpresora' value={form.conexionImpresora||'En Red'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>En Red</option><option>Por USB</option></select></div>{form.conexionImpresora === 'En Red' && <><div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></>}<div><label className='block text-xs font-medium text-gray-700 mb-1'>Oficina</label><input name='oficina' value={form.oficina||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Asignación</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div>)}

        {form.tipo === 'Switch' && (<div className='bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 space-y-3'><p className='text-xs font-bold text-orange-600'>DATOS SWITCH</p><div className='grid grid-cols-2 gap-3'><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Código Activo</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Dañado</option></select></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div>)}

        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Notas</label><textarea name='notas' value={form.notas||''} onChange={h} rows='2' className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Observaciones...'></textarea></div>

        <div className='flex gap-3 pt-2'>
          <button type='submit' className='flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2'><Save size={20} /> Guardar</button>
          {activo && <button type='button' onClick={handleEliminar} className='bg-red-100 text-red-600 px-4 rounded-lg font-bold'><Trash2 size={20} /></button>}
        </div>
      </form>
    </div>
  );
}

function CamposSpecs({ form, h }) {
  return (
    <div className='bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400 space-y-3'>
      <p className='text-xs font-bold text-purple-600'>ESPECIFICACIONES</p>
      <div className='grid grid-cols-2 gap-3'>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Procesador</label><input name='procesador' value={form.procesador||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Generación</label><input name='generacion' value={form.generacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>RAM</label><input name='ram' value={form.ram||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>S.O.</label><input name='sistemaOperativo' value={form.sistemaOperativo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
      </div>
      <div className='border-t border-purple-200 pt-3 mt-2 grid grid-cols-2 gap-3'>
        <div><p className='text-xs font-bold text-purple-800 mb-1'>DISCO 1</p><select name='tipoDisco' value={form.tipoDisco||'SSD M.2'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm mb-1'><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select><input name='capacidadDisco' value={form.capacidadDisco||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Capacidad' /></div>
        <div><p className='text-xs font-bold text-purple-800 mb-1'>DISCO 2 (Opc)</p><select name='tipoDisco2' value={form.tipoDisco2||'Ninguno'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm mb-1'><option>Ninguno</option><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select><input name='capacidadDisco2' value={form.capacidadDisco2||''} onChange={h} disabled={form.tipoDisco2==='Ninguno'} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Capacidad' /></div>
      </div>
    </div>
  );
}

function CamposUbicacion({ form, h }) {
  return (
    <div className='bg-green-50 p-3 rounded-lg border-l-4 border-green-400 space-y-3'>
      <p className='text-xs font-bold text-green-700'>UBICACIÓN Y ASIGNACIÓN</p>
      
      <label className='flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-indigo-200 cursor-pointer'>
        <input type='checkbox' name='enAlmacen' checked={form.enAlmacen || false} onChange={h} className='w-5 h-5 accent-indigo-600' />
        <div>
          <span className='font-bold text-indigo-700 flex items-center gap-1'><Warehouse size={16} /> Marcar como "En Almacén" (Sin asignar)</span>
          <p className='text-xs text-gray-500'>Activa esto si el equipo acaba de llegar y aún no tiene usuario.</p>
        </div>
      </label>

      {!form.enAlmacen ? (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Dañado</option></select></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>N° Empleado</label><input name='numeroEmpleado' value={form.numeroEmpleado||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Cargo que Ocupa</label><input name='cargo' value={form.cargo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Persona Asignada</label><input name='personaAsignada' value={form.personaAsignada||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Responsable</label><input name='nombreResponsable' value={form.nombreResponsable||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Asignación</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado Físico</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Dañado</option></select></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Ingreso</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        </div>
      )}
    </div>
  );
}
