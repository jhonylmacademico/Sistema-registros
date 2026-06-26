import { useState, useEffect } from 'react';
import { Monitor, Printer, Network, Laptop, LogOut, Plus, Search, FileText, ShieldCheck, Save, Trash2, ArrowLeft, Download, Key, Building2, Warehouse, Edit3, MapPin, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Filesystem, Directory, Share } from '@capacitor/filesystem';

const CENTROS_DEFAULT = [
  { id: 'sucre', nombre: 'Multicentro Sucre' },
  { id: 'americas', nombre: 'Multicentro Las Americas' },
  { id: 'victoria', nombre: 'Multicentro Victoria' },
  { id: 'monteagudo', nombre: 'Multicentro Monteagudo' },
  { id: 'camargo', nombre: 'Multicentro Camargo' }
];

const CAMPOS = [
  { key: 'numero', label: 'Nro. Registro' }, { key: 'tipo', label: 'Tipo Equipo' }, { key: 'nombreEquipo', label: 'Nombre Equipo' }, { key: 'marca', label: 'Marca' }, { key: 'marcaCPU', label: 'Marca CPU' }, { key: 'procesador', label: 'Procesador' }, { key: 'ram', label: 'RAM' }, { key: 'numeroSerie', label: 'Nro. Serie' }, { key: 'estado', label: 'Estado' }, { key: 'enAlmacen', label: 'En Almacen' }, { key: 'oficina', label: 'Oficina' }, { key: 'piso', label: 'Piso' }, { key: 'personaAsignada', label: 'Persona Asignada' }, { key: 'numeroEmpleado', label: 'Nro. Empleado' }
];

const datosIniciales = [
  { id: '1', centro: 'sucre', numero: '0001', tipo: 'Laptop', nombreEquipo: 'LAP-JPEREZ', marca: 'Lenovo', modelo: 'T14', codigoActivo: 'AF-001', numeroSerie: 'LP-001', procesador: 'Intel i5', generacion: '10ma', ram: '8 GB', tipoDisco: 'SSD M.2', capacidadDisco: '256 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: 'Win 11', mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.10', estado: 'Activo', enAlmacen: false, oficina: 'Contabilidad', piso: '2', cargo: 'Contador', numeroEmpleado: 'EMP-001', personaAsignada: 'Juan Perez', nombreResponsable: 'Juan Perez', fechaAsignacion: '2024-01-15', notas: '' },
  { id: '2', centro: 'sucre', numero: '0002', tipo: 'Impresora', subtipoImpresora: 'Multifuncional', marca: 'HP', modelo: 'MFP', numeroSerie: 'IMP-002', codigoActivo: 'AF-002', conexionImpresora: 'En Red', mac: 'AA:BB:CC:DD:EE:02', ip: '192.168.1.50', estado: 'Activo', enAlmacen: false, oficina: 'Recursos Humanos', piso: '1', fechaAsignacion: '2024-01-10', notas: '' },
  { id: '3', centro: 'sucre', numero: '0003', tipo: 'Laptop', marca: 'Dell', modelo: 'Latitude', procesador: 'Intel i7', ram: '16 GB', tipoDisco: 'SSD M.2', capacidadDisco: '512 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', estado: 'Danado', enAlmacen: false, oficina: 'Contabilidad', piso: '2', personaAsignada: 'Ana Torres', nombreResponsable: 'Ana Torres', fechaAsignacion: '2024-02-20', notas: 'Pantalla rota' }
];

const OFICINAS_DEFAULT = { sucre: [{ id: 'conta', nombre: 'Contabilidad' }, { id: 'rrhh', nombre: 'Recursos Humanos' }] };

const arrayBufferToBase64 = (buffer) => { let binary = ''; const bytes = new Uint8Array(buffer); for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); } return window.btoa(binary); };

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [customPass, setCustomPass] = useState('admin123');
  const [vista, setVista] = useState('hub');
  const [centroActual, setCentroActual] = useState(null);
  const [oficinaFiltro, setOficinaFiltro] = useState(null);
  const [pisoFiltro, setPisoFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [activos, setActivos] = useState([]);
  const [centros, setCentros] = useState([]);
  const [oficinas, setOficinas] = useState({});
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [camposSeleccionados, setCamposSeleccionados] = useState(['numero', 'tipo', 'nombreEquipo', 'procesador', 'ram', 'estado', 'oficina', 'personaAsignada']);

  useEffect(() => {
    const c = localStorage.getItem('mis_centros_v73'); if (c) setCentros(JSON.parse(c)); else { setCentros(CENTROS_DEFAULT); localStorage.setItem('mis_centros_v73', JSON.stringify(CENTROS_DEFAULT)); }
    const d = localStorage.getItem('activos_fijos_v73'); if (d) setActivos(JSON.parse(d)); else { setActivos(datosIniciales); localStorage.setItem('activos_fijos_v73', JSON.stringify(datosIniciales)); }
    const o = localStorage.getItem('mis_oficinas_v73'); if (o) setOficinas(JSON.parse(o)); else { setOficinas(OFICINAS_DEFAULT); localStorage.setItem('mis_oficinas_v73', JSON.stringify(OFICINAS_DEFAULT)); }
    const p = localStorage.getItem('app_pass_v73'); if (p) setCustomPass(p);
  }, []);

  const guardarDatos = (n) => { setActivos(n); localStorage.setItem('activos_fijos_v73', JSON.stringify(n)); };
  const guardarOficinas = (n) => { setOficinas(n); localStorage.setItem('mis_oficinas_v73', JSON.stringify(n)); };
  const handleLogin = (e) => { e.preventDefault(); if (user === 'admin' && pass === customPass) setIsLoggedIn(true); };
  const getNextNumber = () => { const d = JSON.parse(localStorage.getItem('activos_fijos_v73') || '[]'); return (d.reduce((m, a) => Math.max(m, parseInt(a.numero || '0')), 0) + 1).toString().padStart(4, '0'); };
  const agregarCentro = () => { const n = prompt('Nombre del nuevo Multicentro:'); if (n && n.trim()) { const nc = [...centros, { id: n.trim().toLowerCase().replace(/\s+/g, '_'), nombre: n.trim() }]; setCentros(nc); localStorage.setItem('mis_centros_v73', JSON.stringify(nc)); } };
  
  const agregarOficina = () => { const n = prompt('Nombre de la nueva oficina:'); if (n && n.trim()) { const act = oficinas[centroActual] || []; const nuevas = [...act, { id: n.trim().toLowerCase().replace(/\s+/g, '_'), nombre: n.trim() }]; guardarOficinas({...oficinas, [centroActual]: nuevas}); setMsg('Oficina agregada'); setTimeout(()=>setMsg(''), 2000); } };

  const limpiarFormulario = () => { setEditando(null); setVista('formulario'); };
  const getValor = (a, key) => { if (key === 'enAlmacen') return a.enAlmacen ? 'SI' : 'NO'; return a[key] || '-'; };
  const handleCheck = (key) => { setCamposSeleccionados(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]); };

  const guardarArchivoNativo = async (blob, nombreArchivo) => {
    setCargando(true); setMsg('Preparando archivo...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        await Filesystem.writeFile({ path: nombreArchivo, data: base64, directory: Directory.Cache });
        const uri = 'file://' + (await Filesystem.getUri({ path: nombreArchivo, directory: Directory.Cache })).uri;
        await Share.share({ url: uri });
        setMsg('Abre el menu y elige "Guardar en archivos" o "PDF Viewer"'); setCargando(false);
      };
      reader.readAsDataURL(blob);
    } catch(e) {
      setMsg('Error al guardar. Intente de nuevo.'); setCargando(false);
    }
    setTimeout(()=>setMsg(''), 4000);
  };

  const exportarCSV = () => {
    const datosC = activos.filter(a => a.centro === centroActual);
    const headers = camposSeleccionados.map(k => CAMPOS.find(c=>c.key===k)?.label || k);
    const rows = datosC.map(a => camposSeleccionados.map(k => getValor(a, k)));
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(c => '\x22' + String(c).replace(/\x22/g, '\x22\x22') + '\x22').join(';'))].join('\n');
    guardarArchivoNativo(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'Reporte_Activos.csv');
  };

  const exportarPDF = () => {
    const datosC = activos.filter(a => a.centro === centroActual);
    const headers = camposSeleccionados.map(k => CAMPOS.find(c=>c.key===k)?.label || k);
    const rows = datosC.map(a => camposSeleccionados.map(k => String(getValor(a, k))));
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16); doc.text('Reporte de Activos Fijos', 14, 15);
    doc.setFontSize(10); doc.text('Centro: ' + (centros.find(c=>c.id===centroActual)?.nombre || ''), 14, 22);
    doc.autoTable({ startY: 28, head: [headers], body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [30, 58, 95] } });
    doc.save('Reporte_Activos.pdf');
    const pdfBlob = doc.output('blob');
    guardarArchivoNativo(pdfBlob, 'Reporte_Activos.pdf');
  };

  if (!isLoggedIn) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700'>
          <div className='flex justify-center mb-6 text-blue-400'><ShieldCheck size={48} /></div>
          <h1 className='text-white text-2xl font-bold text-center mb-6'>Control de Activos Fijos</h1>
          <form onSubmit={handleLogin} className='space-y-4'>
            <input type='text' placeholder='Usuario' value={user} onChange={e => setUser(e.target.value)} className='w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600' />
            <input type='password' placeholder='Contrasena' value={pass} onChange={e => setPass(e.target.value)} className='w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600' />
            <button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold'>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  const datosCentro = centroActual ? activos.filter(a => a.centro === centroActual) : [];
  const oficinasCentro = oficinas[centroActual] || [];
  
  let datosFinales = datosCentro;
  if (estadoFiltro) datosFinales = datosFinales.filter(a => a.estado === estadoFiltro);
  else if (oficinaFiltro) {
    datosFinales = datosFinales.filter(a => a.oficina === oficinaFiltro);
    if (pisoFiltro !== 'Todos') datosFinales = datosFinales.filter(a => a.piso === pisoFiltro);
  }

  const pisosDisponibles = oficinaFiltro ? ['Todos', ...new Set(datosCentro.filter(a => a.oficina === oficinaFiltro && a.piso).map(a => a.piso))] : [];
  const activosFiltrados = datosFinales.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.personaAsignada||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numero||'').includes(busqueda));

  return (
    <div className='min-h-screen bg-gray-100 pb-20'>
      {msg && <div className='bg-green-500 text-white text-center p-2 font-bold fixed top-0 left-0 right-0 z-50'>{cargando ? 'Generando archivo...' : msg}</div>}
      <div className='bg-blue-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-10'>
        <div className='flex gap-3 items-center'>
          {(centroActual || vista !== 'hub' && vista !== 'config') && <button onClick={() => { setCentroActual(null); setOficinaFiltro(null); setEstadoFiltro(null); setVista('hub'); setBusqueda(''); }} className='bg-blue-800 p-2 rounded-lg'><ArrowLeft size={20} /></button>}
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
              {centros.map(c => (<button key={c.id} onClick={() => { setCentroActual(c.id); setVista('dashboard'); }} className='p-6 rounded-xl shadow-sm border-l-4 border-blue-500 bg-blue-50 text-left active:bg-gray-200'><h3 className='text-lg font-bold text-gray-800'>{c.nombre}</h3><p className='text-sm text-gray-500 mt-1'>{activos.filter(a => a.centro === c.id).length} activos</p></button>))}
            </div>
          </div>
        )}

        {centroActual && vista === 'dashboard' && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Resumen General</h2>
            <div className='grid grid-cols-2 gap-3'>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro(null); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-500 text-left'><p className='text-gray-500 text-xs'>Total Equipos</p><p className='text-2xl font-bold text-gray-800'>{datosCentro.length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('Activo'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 text-left'><p className='text-gray-500 text-xs'>Activos</p><p className='text-2xl font-bold text-green-600'>{datosCentro.filter(a=>a.estado==='Activo').length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('Danado'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 text-left'><p className='text-gray-500 text-xs'>Danados</p><p className='text-2xl font-bold text-red-600'>{datosCentro.filter(a=>a.estado==='Danado').length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('En Mantenimiento'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 text-left'><p className='text-gray-500 text-xs'>Mantenimiento</p><p className='text-2xl font-bold text-yellow-600'>{datosCentro.filter(a=>a.estado==='En Mantenimiento').length}</p></button>
            </div>

            <div className='flex justify-between items-center mt-4 mb-2'>
              <h3 className='font-bold text-gray-700 flex items-center gap-2'><MapPin size={18} /> Oficinas y Areas</h3>
              <button onClick={() => setVista('oficinas')} className='bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold'><Edit3 size={16} /> Gestionar</button>
            </div>
            
            {oficinasCentro.length === 0 ? <p className='text-sm text-gray-500 bg-white p-4 rounded-lg text-center'>No hay oficinas. Toca Gestionar para agregar.</p> : (
              <div className='grid grid-cols-2 gap-3'>
                {oficinasCentro.map(o => {
                  const count = datosCentro.filter(a => a.oficina === o.nombre).length;
                  return (
                    <button key={o.id} onClick={() => { setOficinaFiltro(o.nombre); setPisoFiltro('Todos'); setEstadoFiltro(null); setVista('lista'); setBusqueda(''); }} className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-left active:bg-gray-50 hover:border-blue-400 transition'>
                      <h4 className='font-bold text-gray-800 text-sm'>{o.nombre}</h4>
                      <p className='text-xs text-gray-500 mt-1'>{count} equipos</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {centroActual && vista === 'oficinas' && (
          <div>
            <button onClick={() => setVista('dashboard')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver al Dashboard</button>
            <div className='bg-white p-4 rounded-xl shadow-sm mb-4'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='font-bold text-lg text-gray-800'>Administrar Oficinas de {centros.find(c=>c.id===centroActual)?.nombre}</h2>
                <button onClick={agregarOficina} className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-sm'><Plus size={18} /> Nueva Oficina</button>
              </div>
              {oficinasCentro.length === 0 ? <p className='text-gray-500 text-center py-8'>Aun no hay oficinas creadas.</p> : (
                <div className='space-y-3'>
                  {oficinasCentro.map((o, index) => (
                    <div key={o.id} className='flex justify-between items-center bg-gray-50 p-4 rounded-lg border'>
                      <div>
                        <p className='font-bold text-gray-800'>{index + 1}. {o.nombre}</p>
                        <p className='text-xs text-gray-500'>{datosCentro.filter(a => a.oficina === o.nombre).length} equipos asignados</p>
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={() => { const nuevo = prompt('Editar nombre de la oficina:', o.nombre); if (nuevo && nuevo.trim()) { const act = oficinas[centroActual]; act[index].nombre = nuevo.trim(); guardarOficinas({...oficinas, [centroActual]: act}); setMsg('Oficina actualizada'); setTimeout(()=>setMsg(''), 2000); }}} className='bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold'>Editar</button>
                        <button onClick={() => { if (confirm('Seguro que quieres eliminar ' + o.nombre + '?')) { const act = oficinas[centroActual]; act.splice(index, 1); guardarOficinas({...oficinas, [centroActual]: act}); setMsg('Oficina eliminada'); setTimeout(()=>setMsg(''), 2000); }}} className='bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-bold'>Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {centroActual && vista === 'lista' && (
          <div>
            {(estadoFiltro || oficinaFiltro) && (
              <div className='bg-blue-50 p-3 rounded-xl mb-4 flex justify-between items-center border border-blue-200'>
                <div>
                  <p className='text-xs text-blue-600 font-bold'>FILTRANDO POR:</p>
                  <p className='text-sm font-bold text-gray-800'>{estadoFiltro ? 'Estado: ' + estadoFiltro : 'Oficina: ' + oficinaFiltro} {pisoFiltro !== 'Todos' ? '| Piso: ' + pisoFiltro : ''}</p>
                </div>
                <button onClick={() => { setEstadoFiltro(null); setOficinaFiltro(null); setPisoFiltro('Todos'); setBusqueda(''); }} className='text-red-500 font-bold text-sm'>LIMPIAR</button>
              </div>
            )}

            {oficinaFiltro && pisosDisponibles.length > 0 && (
              <div className='flex gap-2 mb-4 overflow-x-auto pb-2'>
                {pisosDisponibles.map(p => (
                  <button key={p} onClick={() => setPisoFiltro(p)} className={'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ' + (pisoFiltro === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border')}>Piso {p}</button>
                ))}
              </div>
            )}

            <div className='flex gap-2 mb-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-3.5 text-gray-400' size={18} />
                <input placeholder='Buscar equipo...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm' />
              </div>
              <button onClick={limpiarFormulario} className='bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2 shadow-sm'><Plus size={20} /> Nuevo</button>
            </div>
            
            <div className='space-y-3'>
              {activosFiltrados.length === 0 ? <p className='text-center text-gray-500 mt-10'>Sin activos.</p> : 
              activosFiltrados.map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('formulario'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-400 active:bg-gray-50'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-xs text-blue-600 font-bold'>Nro. {a.numero}</p>
                      <h3 className='font-bold text-gray-800'>{a.nombreEquipo || (a.marcaCPU || a.marca) + ' ' + (a.modeloCPU || a.modelo)}</h3>
                      <p className='text-sm text-gray-500'>{a.tipo} {a.subtipoImpresora ? '- '+a.subtipoImpresora : ''}</p>
                    </div>
                    <div className='text-right'>
                      {a.enAlmacen && <span className='text-xs font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 block mb-1'>Almacen</span>}
                      <span className={'text-xs font-bold px-2 py-1 rounded-full ' + (a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{a.estado}</span>
                    </div>
                  </div>
                  <div className='mt-2 text-sm text-gray-600 border-t pt-2 flex justify-between'>
                    <span>{a.personaAsignada ? 'Asignado: ' + a.personaAsignada : 'En Stock'}</span>
                    <span>{a.oficina || '-'} {a.piso ? '- Piso ' + a.piso : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {centroActual && vista === 'reporte' && (
          <div className='space-y-4'>
            <div className='bg-white p-4 rounded-xl shadow-sm'>
              <h2 className='font-bold text-gray-800 mb-3'>Selecciona columnas:</h2>
              <div className='grid grid-cols-2 gap-2'>
                {CAMPOS.map(c => (
                  <label key={c.key} className={'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ' + (camposSeleccionados.includes(c.key) ? 'bg-blue-50 border-blue-500 text-blue-800 font-medium' : 'bg-gray-50 border-gray-200')}>
                    <input type='checkbox' checked={camposSeleccionados.includes(c.key)} onChange={() => handleCheck(c.key)} className='accent-blue-600' />{c.label}
                  </label>
                ))}
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <button onClick={exportarCSV} disabled={cargando} className='bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2'><Download size={20} /> Excel</button>
              <button onClick={exportarPDF} disabled={cargando} className='bg-red-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2'><FileText size={20} /> PDF</button>
            </div>
            <p className='text-xs text-gray-500 text-center bg-gray-100 p-2 rounded-lg'>Al tocar el boton, se abrira el menu nativo de tu celular. Elige "Guardar en archivos" o "Abrir con..." para verlo.</p>
          </div>
        )}

        {centroActual && vista === 'formulario' && <FormularioActivo activo={editando} guardarDatos={guardarDatos} setVista={setVista} getNextNumber={getNextNumber} centroActual={centroActual} oficinasCentro={oficinasCentro} />}
        {vista === 'config' && <ConfigVista customPass={customPass} setCustomPass={setCustomPass} setVista={setVista} setMsg={setMsg} />}
      </div>

      {centroActual && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
          <button onClick={() => setVista('dashboard')} className={'flex flex-col items-center text-xs ' + (vista === 'dashboard' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Inicio</span></button>
          <button onClick={() => {setVista('lista'); setEstadoFiltro(null); setOficinaFiltro(null);}} className={'flex flex-col items-center text-xs ' + (vista === 'lista' ? 'text-blue-600' : 'text-gray-400')}><Search size={24} /><span>Inventario</span></button>
          <button onClick={() => setVista('reporte')} className={'flex flex-col items-center text-xs ' + (vista === 'reporte' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Reportes</span></button>
        </div>
      )}
    </div>
  );
}

function ConfigVista({ customPass, setCustomPass, setVista, setMsg }) {
  const [nueva, setNueva] = useState('');
  const h = (e) => { e.preventDefault(); if (nueva.length < 4) { alert('Minimo 4 caracteres'); return; } setCustomPass(nueva); localStorage.setItem('app_pass_v73', nueva); setMsg('Contrasena actualizada'); setTimeout(() => setMsg(''), 3000); setVista('hub'); };
  return (<div className='bg-white p-6 rounded-xl shadow-sm'><button onClick={() => setVista('hub')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver</button><h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'><Key size={24} /> Cambiar Contrasena</h2><form onSubmit={h} className='space-y-4'><input type='password' value={nueva} onChange={e => setNueva(e.target.value)} required className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50' placeholder='Nueva contrasena' /><button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold'>Guardar</button></form></div>);
}

function FormularioActivo({ activo, guardarDatos, setVista, getNextNumber, centroActual, oficinasCentro }) {
  const [form, setForm] = useState(activo || { id: Date.now().toString(), centro: centroActual, numero: getNextNumber(), tipo: 'Laptop', subtipoImpresora: 'Impresora Normal', nombreEquipo: '', marca: '', modelo: '', codigoActivo: '', numeroSerie: '', procesador: '', generacion: '', ram: '', tipoDisco: 'SSD M.2', capacidadDisco: '', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: '', mac: '', ip: '', estado: 'Activo', enAlmacen: false, oficina: oficinasCentro[0]?.nombre || '', piso: '', cargo: '', numeroEmpleado: '', personaAsignada: '', nombreResponsable: '', fechaAsignacion: '', marcaCPU: '', modeloCPU: '', codigoActivoCPU: '', numeroSerieCPU: '', marcaMonitor: '', modeloMonitor: '', codigoActivoMonitor: '', conexionImpresora: 'En Red', notas: '' });

  const h = (e) => { const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm({ ...form, [e.target.name]: val }); };
  const handleSubmit = (e) => { e.preventDefault(); const datos = JSON.parse(localStorage.getItem('activos_fijos_v73') || '[]'); if (activo) { guardarDatos(datos.map(a => a.id === activo.id ? form : a)); } else { guardarDatos([...datos, form]); } setVista('lista'); };
  const handleEliminar = () => { if (confirm('Eliminar?')) { const datos = JSON.parse(localStorage.getItem('activos_fijos_v73') || '[]'); guardarDatos(datos.filter(a => a.id !== form.id)); setVista('lista'); } };

  const OficinaSelect = ({ etiqueta, req }) => (
    <div>
      <label className='block text-xs font-medium text-gray-700 mb-1'>{etiqueta}</label>
      <select name='oficina' value={form.oficina||''} onChange={h} required={req} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'>
        <option value='' disabled>Seleccionar...</option>
        {oficinasCentro.map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <button onClick={() => setVista('lista')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver</button>
      <form onSubmit={handleSubmit} className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
        <h2 className='font-bold text-lg text-gray-800 border-b pb-2'>{activo ? 'Editar Nro. ' + form.numero : 'Nuevo Registro'}</h2>
        
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>Nro. REGISTRO</label><input name='numero' value={form.numero} readOnly className='w-full p-3 border border-gray-200 rounded-lg bg-blue-50 text-blue-800 font-bold' /></div>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>TIPO EQUIPO</label><select name='tipo' value={form.tipo} onChange={h} className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50'><option>Laptop</option><option>Computadora de Escritorio</option><option>Impresora</option><option>Switch</option></select></div>
        </div>

        {form.tipo === 'Laptop' && (<><div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'><p className='text-xs font-bold text-blue-600'>DATOS LAPTOP</p><div className='grid grid-cols-2 gap-3'><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Maquina</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Numero de Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div><CamposSpecs form={form} h={h} /><CamposUbicacion form={form} h={h} oficinasCentro={oficinasCentro} OficinaSelect={OficinaSelect} /></>)}

        {form.tipo === 'Computadora de Escritorio' && (<><div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'><p className='text-xs font-bold text-blue-600'>DATOS CPU</p><div className='grid grid-cols-2 gap-3'><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Equipo</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca CPU</label><input name='marcaCPU' value={form.marcaCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo CPU</label><input name='modeloCPU' value={form.modeloCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF CPU</label><input name='codigoActivoCPU' value={form.codigoActivoCPU||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie CPU</label><input name='numeroSerieCPU' value={form.numeroSerieCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div><div className='bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 space-y-3'><p className='text-xs font-bold text-yellow-700'>DATOS MONITOR</p><div className='grid grid-cols-2 gap-3'><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca Monitor</label><input name='marcaMonitor' value={form.marcaMonitor||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo Monitor</label><input name='modeloMonitor' value={form.modeloMonitor||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF Monitor</label><input name='codigoActivoMonitor' value={form.codigoActivoMonitor||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div><CamposSpecs form={form} h={h} /><CamposUbicacion form={form} h={h} oficinasCentro={oficinasCentro} OficinaSelect={OficinaSelect} /></>)}

        {form.tipo === 'Impresora' && (<div className='bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 space-y-3'><p className='text-xs font-bold text-orange-600'>DATOS IMPRESORA / SCANNER</p><div className='grid grid-cols-2 gap-3'><div><label className='block text-xs font-medium text-gray-700 mb-1'>Subtipo</label><select name='subtipoImpresora' value={form.subtipoImpresora||'Impresora Normal'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Impresora Normal</option><option>Multifuncional</option><option>Scanner</option></select></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Conexion</label><select name='conexionImpresora' value={form.conexionImpresora||'En Red'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>En Red</option><option>Por USB</option></select></div>{form.conexionImpresora === 'En Red' && <><div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></>}<OficinaSelect etiqueta='Oficina / Area' req={true} /><div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Asignacion</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div>)}

        {form.tipo === 'Switch' && (<div className='bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 space-y-3'><p className='text-xs font-bold text-orange-600'>DATOS SWITCH</p><div className='grid grid-cols-2 gap-3'><div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div><OficinaSelect etiqueta='Ubicacion / Area' req={false} /><div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></div></div>)}

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
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Generacion</label><input name='generacion' value={form.generacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>RAM</label><input name='ram' value={form.ram||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>S.O.</label><input name='sistemaOperativo' value={form.sistemaOperativo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
      </div>
      <div className='border-t border-purple-200 pt-3 mt-2 grid grid-cols-2 gap-3'>
        <div><p className='text-xs font-bold text-purple-800 mb-1'>DISCO 1</p><select name='tipoDisco' value={form.tipoDisco||'SSD M.2'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm mb-1'><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select><input name='capacidadDisco' value={form.capacidadDisco||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Capacidad' /></div>
        <div><p className='text-xs font-bold text-purple-800 mb-1'>DISCO 2</p><select name='tipoDisco2' value={form.tipoDisco2||'Ninguno'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm mb-1'><option>Ninguno</option><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select><input name='capacidadDisco2' value={form.capacidadDisco2||''} onChange={h} disabled={form.tipoDisco2==='Ninguno'} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Capacidad' /></div>
      </div>
    </div>
  );
}

function CamposUbicacion({ form, h, oficinasCentro, OficinaSelect }) {
  return (
    <div className='bg-green-50 p-3 rounded-lg border-l-4 border-green-400 space-y-3'>
      <p className='text-xs font-bold text-green-700'>UBICACION Y ASIGNACION</p>
      <label className='flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-indigo-200 cursor-pointer'>
        <input type='checkbox' name='enAlmacen' checked={form.enAlmacen || false} onChange={h} className='w-5 h-5 accent-indigo-600' />
        <div>
          <span className='font-bold text-indigo-700'>Marcar como 'En Almacen'</span>
          <p className='text-xs text-gray-500'>Sin asignar a ningun usuario.</p>
        </div>
      </label>

      {!form.enAlmacen ? (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Ej: 2' /></div>
          <OficinaSelect etiqueta='Oficina / Area' req={true} />
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Nro. Empleado</label><input name='numeroEmpleado' value={form.numeroEmpleado||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Cargo que Ocupa</label><input name='cargo' value={form.cargo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Persona Asignada</label><input name='personaAsignada' value={form.personaAsignada||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Responsable</label><input name='nombreResponsable' value={form.nombreResponsable||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Asignacion</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado Fisico</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Ingreso</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        </div>
      )}
    </div>
  );
}
