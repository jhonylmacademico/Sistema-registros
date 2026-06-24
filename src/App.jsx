import { useState, useEffect } from 'react';
import { Monitor, Printer, Network, Laptop, LogOut, Plus, Search, FileText, ShieldCheck, Save, Trash2, ArrowLeft, Download, Key } from 'lucide-react';

const datosIniciales = [
  { id: '1', numero: '0001', tipo: 'Laptop', nombreEquipo: 'LAP-JPEREZ', marca: 'Lenovo', modelo: 'ThinkPad T14', codigoActivo: 'AF-2024-001', numeroSerie: 'LP-001-ABC', procesador: 'Intel Core i5', generacion: '10ma', ram: '8 GB', tipoDisco: 'SSD M.2', capacidadDisco: '256 GB', sistemaOperativo: 'Windows 11 Pro', mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.101', estado: 'Activo', piso: '2', area: 'Contabilidad', personaAsignada: 'Juan Pérez', nombreResponsable: 'Juan Pérez', fechaAsignacion: '2024-01-15', notas: '' },
  { id: '2', numero: '0002', tipo: 'Impresora', marca: 'HP', modelo: 'LaserJet Pro', numeroSerie: 'IMP-002-XYZ', estado: 'Activo', piso: '1', area: 'Recursos Humanos', oficina: 'Recursos Humanos', fechaAsignacion: '2024-01-10', notas: 'Cartucho nuevo' },
  { id: '3', numero: '0003', tipo: 'Computadora de Escritorio', nombreEquipo: 'PC-MGARCIA', marca: 'Dell', modelo: 'Optiplex 7090', codigoActivo: 'AF-2024-003', numeroSerie: 'PC-003-DEF', procesador: 'Intel Core i7', generacion: '11va', ram: '16 GB', tipoDisco: 'SSD M.2', capacidadDisco: '512 GB', sistemaOperativo: 'Windows 10 Pro', mac: 'AA:BB:CC:DD:EE:03', ip: '192.168.1.103', estado: 'Dañado', piso: '3', area: 'Ventas', personaAsignada: 'María García', nombreResponsable: 'María García', fechaAsignacion: '2024-02-20', marcaMonitor: 'Dell', modeloMonitor: 'P2422H', marcaCPU: 'Dell', modeloCPU: 'Optiplex SFF', notas: 'Falla fuente de poder' }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [customPass, setCustomPass] = useState('admin123');
  const [vista, setVista] = useState('dashboard');
  const [activos, setActivos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const datosGuardados = localStorage.getItem('activos_fijos_v2');
    if (datosGuardados) { setActivos(JSON.parse(datosGuardados)); } 
    else { setActivos(datosIniciales); localStorage.setItem('activos_fijos_v2', JSON.stringify(datosIniciales)); }
    const p = localStorage.getItem('app_password_v2');
    if (p) setCustomPass(p);
  }, []);

  const guardarDatos = (nuevosDatos) => { setActivos(nuevosDatos); localStorage.setItem('activos_fijos_v2', JSON.stringify(nuevosDatos)); };
  
  const handleLogin = (e) => { e.preventDefault(); if (user === 'admin' && pass === customPass) setIsLoggedIn(true); };
  
  const getNextNumber = () => {
    const datos = JSON.parse(localStorage.getItem('activos_fijos_v2') || '[]');
    const maxNum = datos.reduce((max, a) => { const n = parseInt(a.numero || '0'); return n > max ? n : max; }, 0);
    return (maxNum + 1).toString().padStart(4, '0');
  };

  const limpiarFormulario = () => { setEditando(null); setVista('formulario'); };

  const exportarCSV = () => {
    const headers = ['N°', 'Tipo', 'Nombre Equipo', 'Marca', 'Modelo', 'Cod. Activo', 'N° Serie', 'Procesador', 'Generación', 'RAM', 'Tipo Disco', 'Cap. Disco', 'S.O.', 'MAC', 'IP', 'Estado', 'Piso', 'Área', 'Asignado A', 'Responsable', 'Fecha Asignación', 'Marca Monitor', 'Modelo Monitor', 'Marca CPU', 'Modelo CPU', 'Oficina', 'Notas'];
    const rows = activos.map(a => [a.numero, a.tipo, a.nombreEquipo||'', a.marca||'', a.modelo||'', a.codigoActivo||'', a.numeroSerie||'', a.procesador||'', a.generacion||'', a.ram||'', a.tipoDisco||'', a.capacidadDisco||'', a.sistemaOperativo||'', a.mac||'', a.ip||'', a.estado, a.piso||'', a.area||'', a.personaAsignada||'', a.nombreResponsable||'', a.fechaAsignacion||'', a.marcaMonitor||'', a.modeloMonitor||'', a.marcaCPU||'', a.modeloCPU||'', a.oficina||'', a.notas||'']);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'Reporte_Activos_Fijos.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    setMsg('Reporte descargado');
    setTimeout(() => setMsg(''), 3000);
  };

  if (!isLoggedIn) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
        <div className='bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700'>
          <div className='flex justify-center mb-6 text-blue-400'><ShieldCheck size={48} /></div>
          <h1 className='text-white text-2xl font-bold text-center mb-6'>Control de Activos Fijos</h1>
          <form onSubmit={handleLogin} className='space-y-4'>
            <input type='text' placeholder='Usuario' value={user} onChange={e => setUser(e.target.value)} className='w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500' />
            <input type='password' placeholder='Contraseña' value={pass} onChange={e => setPass(e.target.value)} className='w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500' />
            <button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition'>Ingresar</button>
          </form>
          <p className='text-gray-500 text-xs text-center mt-4'>Default: admin / admin123</p>
        </div>
      </div>
    );
  }

  const totalActivos = activos.length;
  const estadoCount = (estado) => activos.filter(a => a.estado === estado).length;
  const activosFiltrados = activos.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.serie||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.personaAsignada||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numeroSerie||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numero||'').includes(busqueda));

  return (
    <div className='min-h-screen bg-gray-100 pb-20'>
      {msg && <div className='bg-green-500 text-white text-center p-2 font-bold fixed top-0 left-0 right-0 z-50'>{msg}</div>}
      <div className='bg-blue-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-10'>
        <div className='flex gap-3 items-center'>
          <button onClick={() => setVista('config')} className='bg-blue-800 p-2 rounded-lg'><Key size={20} /></button>
          <h1 className='text-lg font-bold'>Activos Fijos</h1>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className='bg-blue-800 p-2 rounded-lg'><LogOut size={20} /></button>
      </div>

      <div className='p-4'>
        {vista === 'dashboard' && (
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-gray-800'>Resumen General</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500'><p className='text-gray-500 text-sm'>Total Equipos</p><p className='text-3xl font-bold text-gray-800'>{totalActivos}</p></div>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500'><p className='text-gray-500 text-sm'>Activos</p><p className='text-3xl font-bold text-green-600'>{estadoCount('Activo')}</p></div>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500'><p className='text-gray-500 text-sm'>Mantenimiento</p><p className='text-3xl font-bold text-yellow-600'>{estadoCount('En Mantenimiento')}</p></div>
              <div className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500'><p className='text-gray-500 text-sm'>Dañados</p><p className='text-3xl font-bold text-red-600'>{estadoCount('Dañado')}</p></div>
            </div>
            <h2 className='text-xl font-bold text-gray-800 mt-6'>Por Tipo</h2>
            <div className='space-y-2'>
              <div className='flex justify-between bg-white p-3 rounded-lg shadow-sm'><span className='flex items-center gap-2'><Laptop size={18} /> Laptops</span><span className='font-bold'>{activos.filter(a=>a.tipo==='Laptop').length}</span></div>
              <div className='flex justify-between bg-white p-3 rounded-lg shadow-sm'><span className='flex items-center gap-2'><Monitor size={18} /> Computadoras</span><span className='font-bold'>{activos.filter(a=>a.tipo==='Computadora de Escritorio').length}</span></div>
              <div className='flex justify-between bg-white p-3 rounded-lg shadow-sm'><span className='flex items-center gap-2'><Printer size={18} /> Impresoras</span><span className='font-bold'>{activos.filter(a=>a.tipo==='Impresora').length}</span></div>
              <div className='flex justify-between bg-white p-3 rounded-lg shadow-sm'><span className='flex items-center gap-2'><Network size={18} /> Switchs</span><span className='font-bold'>{activos.filter(a=>a.tipo==='Switch').length}</span></div>
            </div>
          </div>
        )}

        {vista === 'lista' && (
          <div>
            <div className='flex gap-2 mb-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-3.5 text-gray-400' size={18} />
                <input placeholder='Buscar N°, nombre, serie, persona...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-blue-500 shadow-sm' />
              </div>
              <button onClick={limpiarFormulario} className='bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2 shadow-sm'><Plus size={20} /> Nuevo</button>
            </div>
            <div className='space-y-3'>
              {activosFiltrados.length === 0 ? <p className='text-center text-gray-500 mt-10'>No se encontraron activos.</p> : 
              activosFiltrados.map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('formulario'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-400 active:bg-gray-50'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-xs text-blue-600 font-bold'>N° {a.numero}</p>
                      <h3 className='font-bold text-gray-800'>{a.nombreEquipo || a.marca + ' ' + a.modelo}</h3>
                      <p className='text-sm text-gray-500'>{a.tipo} | Serie: {a.numeroSerie}</p>
                    </div>
                    <span className={'text-xs font-bold px-2 py-1 rounded-full ' + (a.estado === 'Activo' ? 'bg-green-100 text-green-700' : a.estado === 'En Mantenimiento' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>{a.estado}</span>
                  </div>
                  <div className='mt-2 text-sm text-gray-600 border-t pt-2 flex justify-between'>
                    <span>{a.personaAsignada ? '👤 ' + a.personaAsignada : '🏢 ' + (a.oficina||'')}</span>
                    <span>📍 Piso {a.piso} - {a.area}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vista === 'formulario' && <FormularioActivo activo={editando} guardarDatos={guardarDatos} setVista={setVista} getNextNumber={getNextNumber} />}

        {vista === 'reporte' && (
          <div>
            <button onClick={exportarCSV} className='w-full bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-4 shadow-sm'><Download size={20} /> Descargar Reporte Excel (CSV)</button>
            <div className='bg-white p-4 rounded-xl shadow-sm overflow-x-auto'>
              <h2 className='text-lg font-bold text-gray-800 mb-4 text-center'>REPORTE DE ACTIVOS FIJOS</h2>
              <table className='w-full text-sm text-left text-gray-500 min-w-[600px]'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                  <tr><th className='px-2 py-2'>N°/Tipo</th><th className='px-2 py-2'>Equipo</th><th className='px-2 py-2'>Serie</th><th className='px-2 py-2'>Estado</th><th className='px-2 py-2'>Asignado/Oficina</th><th className='px-2 py-2'>Ubicación</th><th className='px-2 py-2'>Specs</th></tr>
                </thead>
                <tbody>
                  {activos.map(a => (
                    <tr key={a.id} className='border-b'>
                      <td className='px-2 py-2 font-medium text-gray-900'>{a.numero}<br/><span className='text-xs text-gray-500'>{a.tipo}</span></td>
                      <td className='px-2 py-2'>{a.nombreEquipo||'-'}<br/><span className='text-xs'>{a.marca} {a.modelo}</span></td>
                      <td className='px-2 py-2'>{a.numeroSerie}</td>
                      <td className={'px-2 py-2 font-bold ' + (a.estado==='Activo'?'text-green-600':a.estado==='Dañado'?'text-red-600':'text-yellow-600')}>{a.estado}</td>
                      <td className='px-2 py-2'>{a.personaAsignada || a.oficina || '-'}</td>
                      <td className='px-2 py-2'>Piso {a.piso}<br/>{a.area}</td>
                      <td className='px-2 py-2 text-xs'>{a.procesador?'CPU: '+a.procesador+' | RAM: '+a.ram+' | '+a.tipoDisco: a.notas||'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vista === 'config' && <ConfigVista customPass={customPass} setCustomPass={setCustomPass} setVista={setVista} setMsg={setMsg} />}
      </div>

      <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
        <button onClick={() => setVista('dashboard')} className={'flex flex-col items-center text-xs ' + (vista === 'dashboard' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Inicio</span></button>
        <button onClick={() => setVista('lista')} className={'flex flex-col items-center text-xs ' + (vista === 'lista' ? 'text-blue-600' : 'text-gray-400')}><Search size={24} /><span>Inventario</span></button>
        <button onClick={() => setVista('reporte')} className={'flex flex-col items-center text-xs ' + (vista === 'reporte' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Reportes</span></button>
      </div>
    </div>
  );
}

function ConfigVista({ customPass, setCustomPass, setVista, setMsg }) {
  const [nueva, setNueva] = useState('');
  const handleChange = (e) => {
    e.preventDefault();
    if (nueva.length < 4) { alert('La contraseña debe tener al menos 4 caracteres'); return; }
    setCustomPass(nueva);
    localStorage.setItem('app_password_v2', nueva);
    setMsg('Contraseña actualizada');
    setTimeout(() => setMsg(''), 3000);
    setVista('dashboard');
  };
  return (
    <div className='bg-white p-6 rounded-xl shadow-sm'>
      <button onClick={() => setVista('dashboard')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver</button>
      <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'><Key size={24} /> Cambiar Contraseña</h2>
      <form onSubmit={handleChange} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Nueva Contraseña</label>
          <input type='password' value={nueva} onChange={e => setNueva(e.target.value)} required className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50' placeholder='Mínimo 4 caracteres' />
        </div>
        <button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold'>Guardar Contraseña</button>
      </form>
    </div>
  );
}

function FormularioActivo({ activo, guardarDatos, setVista, getNextNumber }) {
  const esPC = activo?.tipo === 'Computadora de Escritorio';
  const esImpSw = activo?.tipo === 'Impresora' || activo?.tipo === 'Switch';
  const [form, setForm] = useState(activo || { id: Date.now().toString(), numero: getNextNumber(), tipo: 'Laptop', nombreEquipo: '', marca: '', modelo: '', codigoActivo: '', numeroSerie: '', procesador: '', generacion: '', ram: '', tipoDisco: 'SSD M.2', capacidadDisco: '', sistemaOperativo: '', mac: '', ip: '', estado: 'Activo', piso: '', area: '', personaAsignada: '', nombreResponsable: '', fechaAsignacion: '', marcaMonitor: '', modeloMonitor: '', marcaCPU: '', modeloCPU: '', oficina: '', notas: '' });

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    const datos = JSON.parse(localStorage.getItem('activos_fijos_v2') || '[]');
    if (activo) { guardarDatos(datos.map(a => a.id === activo.id ? form : a)); } 
    else { guardarDatos([...datos, form]); }
    setVista('lista');
  };
  const handleEliminar = () => { if (confirm('¿Eliminar este activo permanentemente?')) { const datos = JSON.parse(localStorage.getItem('activos_fijos_v2') || '[]'); guardarDatos(datos.filter(a => a.id !== form.id)); setVista('lista'); } };

  return (
    <div>
      <button onClick={() => setVista('lista')} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver al Inventario</button>
      <form onSubmit={handleSubmit} className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
        <h2 className='font-bold text-lg text-gray-800 border-b pb-2'>{activo ? 'Editar Activo N° ' + form.numero : 'Registrar Nuevo Activo'}</h2>
        
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>N° REGISTRO (Auto)</label><input name='numero' value={form.numero} readOnly className='w-full p-3 border border-gray-200 rounded-lg bg-blue-50 text-blue-800 font-bold' /></div>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>TIPO DE EQUIPO</label><select name='tipo' value={form.tipo} onChange={h} className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50'><option>Laptop</option><option>Computadora de Escritorio</option><option>Impresora</option><option>Switch</option></select></div>
        </div>

        {!esImpSw ? (
          <>
            <div className='bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'>
              <p className='text-xs font-bold text-blue-600'>DATOS DEL EQUIPO</p>
              <div className='grid grid-cols-2 gap-3'>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre de Máquina</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Ej: LAP-CONT-01' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Dañado</option></select></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Lenovo, Dell...' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='ThinkPad T14' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Código Activo Fijo</label><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='AF-2024-001' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Número de Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='XX-XXX-XXX' /></div>
              </div>
            </div>

            <div className='bg-gray-50 p-3 rounded-lg border-l-4 border-purple-400 space-y-3'>
              <p className='text-xs font-bold text-purple-600'>ESPECIFICACIONES TÉCNICAS</p>
              <div className='grid grid-cols-2 gap-3'>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Procesador</label><input name='procesador' value={form.procesador||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Intel Core i5' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Generación</label><input name='generacion' value={form.generacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='10ma Gen' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>RAM</label><input name='ram' value={form.ram||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='8 GB' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Tipo de Disco</label><select name='tipoDisco' value={form.tipoDisco||'SSD M.2'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option><option>HDD + SSD</option></select></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Capacidad de Disco</label><input name='capacidadDisco' value={form.capacidadDisco||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='256 GB' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Sistema Operativo</label><input name='sistemaOperativo' value={form.sistemaOperativo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Windows 11 Pro' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC Address</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='AA:BB:CC:DD:EE:FF' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='192.168.1.10' /></div>
              </div>
            </div>

            {esPC && (
              <div className='bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-400 space-y-3'>
                <p className='text-xs font-bold text-yellow-700'>MONITOR Y GABINETE (PC Escritorio)</p>
                <div className='grid grid-cols-2 gap-3'>
                  <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca Monitor</label><input name='marcaMonitor' value={form.marcaMonitor||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
                  <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo Monitor</label><input name='modeloMonitor' value={form.modeloMonitor||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
                  <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca Gabinete/CPU</label><input name='marcaCPU' value={form.marcaCPU||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
                  <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo Gabinete/CPU</label><input name='modeloCPU' value={form.modeloCPU||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
                </div>
              </div>
            )}

            <div className='bg-gray-50 p-3 rounded-lg border-l-4 border-green-400 space-y-3'>
              <p className='text-xs font-bold text-green-700'>UBICACIÓN Y ASIGNACIÓN</p>
              <div className='grid grid-cols-2 gap-3'>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='2' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Área</label><input name='area' value={form.area||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Contabilidad' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Persona Asignada</label><input name='personaAsignada' value={form.personaAsignada||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Nombre de quien lo usa' /></div>
                <div><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Responsable</label><input name='nombreResponsable' value={form.nombreResponsable||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Nombre del responsable' /></div>
                <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha de Asignación</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              </div>
            </div>
          </>
        ) : (
          <div className='bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400 space-y-3'>
            <p className='text-xs font-bold text-orange-600'>DATOS DE IMPRESORA / SWITCH</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='HP, Cisco...' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Número de Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Dañado</option></select></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Oficina</label><input name='oficina' value={form.oficina||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Recursos Humanos' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha de Asignación</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
            </div>
          </div>
        )}

        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Notas / Observaciones</label><textarea name='notas' value={form.notas||''} onChange={h} rows='2' className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Detalles adicionales...'></textarea></div>

        <div className='flex gap-3 pt-2'>
          <button type='submit' className='flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2'><Save size={20} /> Guardar</button>
          {activo && <button type='button' onClick={handleEliminar} className='bg-red-100 text-red-600 px-4 rounded-lg font-bold'><Trash2 size={20} /></button>}
        </div>
      </form>
    </div>
  );
}
