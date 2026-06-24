import { useState, useEffect } from 'react';
import { Monitor, Printer, Network, Laptop, LogOut, Plus, Search, FileText, ShieldCheck, Save, Trash2, ArrowLeft } from 'lucide-react';

// --- DATOS INICIALES DE PRUEBA ---
const datosIniciales = [
  { id: '1', tipo: 'Laptop', marca: 'Lenovo', modelo: 'ThinkPad T14', serie: 'LP-001-ABC', estado: 'Activo', asignadoA: 'Juan Pérez', departamento: 'Contabilidad', procesador: 'Intel i5', ram: '8GB', almacenamiento: '256GB SSD', notas: '' },
  { id: '2', tipo: 'Impresora', marca: 'HP', modelo: 'LaserJet Pro', serie: 'IMP-002-XYZ', estado: 'Activo', oficina: 'Recursos Humanos', notas: 'Cartucho nuevo' },
  { id: '3', tipo: 'Computadora de Escritorio', marca: 'Dell', modelo: 'Optiplex 7090', serie: 'PC-003-DEF', estado: 'Dañado', asignadoA: 'María García', departamento: 'Ventas', procesador: 'Intel i7', ram: '16GB', almacenamiento: '512GB SSD', notas: 'Falla en la fuente de poder' }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [vista, setVista] = useState('dashboard'); // dashboard, lista, formulario, reporte
  const [activos, setActivos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos del celular al abrir
  useEffect(() => {
    const datosGuardados = localStorage.getItem('activos_fijos');
    if (datosGuardados) {
      setActivos(JSON.parse(datosGuardados));
    } else {
      setActivos(datosIniciales);
      localStorage.setItem('activos_fijos', JSON.stringify(datosIniciales));
    }
  }, []);

  // Guardar datos en el celular cada vez que cambian
  const guardarDatos = (nuevosDatos) => {
    setActivos(nuevosDatos);
    localStorage.setItem('activos_fijos', JSON.stringify(nuevosDatos));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin123') setIsLoggedIn(true);
  };

  const limpiarFormulario = () => {
    setEditando(null);
    setVista('formulario');
  };

  // --- VISTA: LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
          <div className="flex justify-center mb-6 text-blue-400"><ShieldCheck size={48} /></div>
          <h1 className="text-white text-2xl font-bold text-center mb-6">Control de Activos Fijos</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
            <input type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">Ingresar</button>
          </form>
          <p className="text-gray-500 text-xs text-center mt-4">Demo: admin / admin123</p>
        </div>
      </div>
    );
  }

  // --- LÓGICA DE REPORTES ---
  const totalActivos = activos.length;
  const estadoCount = (estado) => activos.filter(a => a.estado === estado).length;
  const tipoCount = (tipo) => activos.filter(a => a.tipo === tipo).length;

  // --- FILTRAR LISTA ---
  const activosFiltrados = activos.filter(a => 
    a.marca?.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.serie?.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.asignadoA?.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.oficina?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* CABECERA */}
      <div className="bg-blue-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg font-bold">Activos Fijos</h1>
        <button onClick={() => setIsLoggedIn(false)} className="bg-blue-800 p-2 rounded-lg"><LogOut size={20} /></button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-4">
        
        {/* VISTA: DASHBOARD */}
        {vista === 'dashboard' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Resumen General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500"><p className="text-gray-500 text-sm">Total Equipos</p><p className="text-3xl font-bold text-gray-800">{totalActivos}</p></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500"><p className="text-gray-500 text-sm">Activos</p><p className="text-3xl font-bold text-green-600">{estadoCount('Activo')}</p></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500"><p className="text-gray-500 text-sm">Mantenimiento</p><p className="text-3xl font-bold text-yellow-600">{estadoCount('En Mantenimiento')}</p></div>
              <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500"><p className="text-gray-500 text-sm">Dañados</p><p className="text-3xl font-bold text-red-600">{estadoCount('Dañado')}</p></div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mt-6">Por Tipo de Equipo</h2>
            <div className="space-y-2">
              <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm"><span className="flex items-center gap-2"><Laptop size={18} /> Laptops</span><span className="font-bold">{tipoCount('Laptop')}</span></div>
              <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm"><span className="flex items-center gap-2"><Monitor size={18} /> Computadoras</span><span className="font-bold">{tipoCount('Computadora de Escritorio')}</span></div>
              <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm"><span className="flex items-center gap-2"><Printer size={18} /> Impresoras</span><span className="font-bold">{tipoCount('Impresora')}</span></div>
              <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm"><span className="flex items-center gap-2"><Network size={18} /> Switchs</span><span className="font-bold">{tipoCount('Switch')}</span></div>
            </div>
          </div>
        )}

        {/* VISTA: LISTA DE INVENTARIO */}
        {vista === 'lista' && (
          <div>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input placeholder="Buscar por marca, serie, persona..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-blue-500 shadow-sm" />
              </div>
              <button onClick={limpiarFormulario} className="bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2 shadow-sm"><Plus size={20} /> Nuevo</button>
            </div>
            
            <div className="space-y-3">
              {activosFiltrados.length === 0 ? <p className="text-center text-gray-500 mt-10">No se encontraron activos.</p> : 
              activosFiltrados.map(activo => (
                <div key={activo.id} onClick={() => { setEditando(activo); setVista('formulario'); }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{activo.marca} {activo.modelo}</h3>
                      <p className="text-sm text-gray-500">Serie: {activo.serie}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${activo.estado === 'Activo' ? 'bg-green-100 text-green-700' : activo.estado === 'En Mantenimiento' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {activo.estado}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 border-t pt-2 mt-2">
                    {activo.asignadoA ? <p>👤 Asignado a: <b>{activo.asignadoA}</b></p> : <p>🏢 Oficina: <b>{activo.oficina}</b></p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: FORMULARIO (CREAR / EDITAR) */}
        {(vista === 'formulario') && (
          <FormularioActivo activo={editando} guardarDatos={guardarDatos} setVista={setVista} />
        )}

        {/* VISTA: REPORTE COMPLETO */}
        {vista === 'reporte' && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 text-center">REPORTE COMPLETO DE ACTIVOS FIJOS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-2 py-2">Tipo/Marca</th>
                    <th className="px-2 py-2">Serie</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">Asignado/Oficina</th>
                    <th className="px-2 py-2">Características</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="px-2 py-2 font-medium text-gray-900">{a.tipo}<br/><span className="text-xs">{a.marca} {a.modelo}</span></td>
                      <td className="px-2 py-2">{a.serie}</td>
                      <td className={`px-2 py-2 font-bold ${a.estado === 'Activo' ? 'text-green-600' : a.estado === 'Dañado' ? 'text-red-600' : 'text-yellow-600'}`}>{a.estado}</td>
                      <td className="px-2 py-2">{a.asignadoA || a.oficina || '-'}</td>
                      <td className="px-2 py-2 text-xs">{a.procesador ? `CPU: ${a.procesador}, RAM: ${a.ram}` : a.notas || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Generado el {new Date().toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* MENÚ INFERIOR (BARRA DE NAVEGACIÓN) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button onClick={() => setVista('dashboard')} className={`flex flex-col items-center text-xs ${vista === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}><FileText size={24} /><span>Inicio</span></button>
        <button onClick={() => setVista('lista')} className={`flex flex-col items-center text-xs ${vista === 'lista' ? 'text-blue-600' : 'text-gray-400'}`}><Search size={24} /><span>Inventario</span></button>
        <button onClick={() => setVista('reporte')} className={`flex flex-col items-center text-xs ${vista === 'reporte' ? 'text-blue-600' : 'text-gray-400'}`}><FileText size={24} /><span>Reportes</span></button>
      </div>
    </div>
  );
}

// --- COMPONENTE FORMULARIO (Separado lógicamente pero en el mismo archivo) ---
function FormularioActivo({ activo, guardarDatos, setVista }) {
  const esImpresoraOSwitch = activo?.tipo === 'Impresora' || activo?.tipo === 'Switch';
  const [form, setForm] = useState(activo || {
    id: Date.now().toString(), tipo: 'Laptop', marca: '', modelo: '', serie: '', estado: 'Activo', asignadoA: '', departamento: '', procesador: '', ram: '', almacenamiento: '', oficina: '', notas: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEliminar = () => {
    if(confirm("¿Estás seguro de eliminar este activo?")) {
      // Nota: usaremos una función temporal para obtener los datos actuales
      const datosActuales = JSON.parse(localStorage.getItem('activos_fijos') || '[]');
      guardarDatos(datosActuales.filter(a => a.id !== form.id));
      setVista('lista');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosActuales = JSON.parse(localStorage.getItem('activos_fijos') || '[]');
    if (activo) {
      // Editar
      const nuevosDatos = datosActuales.map(a => a.id === activo.id ? form : a);
      guardarDatos(nuevosDatos);
    } else {
      // Crear nuevo
      guardarDatos([...datosActuales, form]);
    }
    setVista('lista');
  };

  return (
    <div>
      <button onClick={() => setVista('lista')} className="flex items-center text-blue-600 font-bold mb-4"><ArrowLeft size={20} /> Volver al Inventario</button>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-gray-800">{activo ? 'Editar Activo' : 'Registrar Nuevo Activo'}</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Equipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500">
            <option>Laptop</option>
            <option>Computadora de Escritorio</option>
            <option>Impresora</option>
            <option>Switch</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input name="marca" value={form.marca} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" placeholder="Ej: Dell, HP" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input name="modelo" value={form.modelo} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" placeholder="Ej: Optiplex 7090" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Serie</label>
          <input name="serie" value={form.serie} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" placeholder="Ej: PC-001-ABC" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
            <option>Activo</option>
            <option>En Mantenimiento</option>
            <option>Dañado</option>
          </select>
        </div>

        {/* CAMPOS DINÁMICOS SEGÚN EL TIPO */}
        {esImpresoraOSwitch ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿En qué oficina se encuentra?</label>
            <input name="oficina" value={form.oficina || ''} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" placeholder="Ej: Recursos Humanos" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a (Personal)</label>
              <input name="asignadoA" value={form.asignadoA || ''} onChange={handleChange} required className="w-full p-3
