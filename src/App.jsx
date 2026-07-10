import { useState, useEffect } from 'react';
import { Monitor, Printer, Network, Laptop, LogOut, Plus, Search, FileText, ShieldCheck, Save, Trash2, ArrowLeft, Download, Key, Building2, Warehouse, Edit3, MapPin, CheckCircle, Upload, ChevronDown, Image as ImageIcon, CheckSquare, Square, Layers, History, Camera as CameraIcon, X, ScanLine, QrCode, Share2, Barcode, Sun, Moon } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';

const CENTROS_DEFAULT = [
  { id: 'sucre', nombre: 'Multicentro Sucre' }, { id: 'americas', nombre: 'Multicentro Las Americas' }, { id: 'victoria', nombre: 'Multicentro Victoria' }, { id: 'monteagudo', nombre: 'Multicentro Monteagudo' }, { id: 'camargo', nombre: 'Multicentro Camargo' }
];

const COLORES_ITEMS = [
  { borde: 'border-blue-500', fondo: 'bg-blue-50', texto: 'text-blue-800', bordeN: 'border-fuchsia-500', fondoN: 'bg-fuchsia-950', textoN: 'text-fuchsia-300' },
  { borde: 'border-green-500', fondo: 'bg-green-50', texto: 'text-green-800', bordeN: 'border-cyan-500', fondoN: 'bg-cyan-950', textoN: 'text-cyan-300' },
  { borde: 'border-amber-500', fondo: 'bg-amber-50', texto: 'text-amber-800', bordeN: 'border-lime-500', fondoN: 'bg-lime-950', textoN: 'text-lime-300' },
  { borde: 'border-pink-500', fondo: 'bg-pink-50', texto: 'text-pink-800', bordeN: 'border-rose-500', fondoN: 'bg-rose-950', textoN: 'text-rose-300' },
  { borde: 'border-purple-500', fondo: 'bg-purple-50', texto: 'text-purple-800', bordeN: 'border-violet-500', fondoN: 'bg-violet-950', textoN: 'text-violet-300' }
];

const COLORES_CHECKS = ['text-blue-600', 'text-green-600', 'text-amber-600', 'text-pink-600', 'text-purple-600', 'text-red-600', 'text-indigo-600', 'text-teal-600', 'text-orange-600', 'text-cyan-600'];
const TIPOS_COMPUTO = ['Laptop', 'Computadora de Escritorio', 'Computadora All in One'];
const TIPOS_RED = ['Impresora', 'Impresora Multifuncional', 'Scanner', 'Switch'];
const SUBTIPOS_REPORTE = [...TIPOS_COMPUTO, ...TIPOS_RED];

const CAMPOS = [
  { key: 'numero', label: 'Nro. Registro' }, { key: 'tipo', label: 'Tipo Equipo' }, { key: 'nombreEquipo', label: 'Nombre Equipo' }, { key: 'marca', label: 'Marca' }, { key: 'modelo', label: 'Modelo' }, { key: 'codigoActivo', label: 'Código AF' }, { key: 'numeroSerie', label: 'Nro. Serie' }, { key: 'procesador', label: 'Procesador' }, { key: 'generacion', label: 'Generación' }, { key: 'ram', label: 'RAM' }, { key: 'tipoDisco', label: 'Disco 1 (Tipo)' }, { key: 'capacidadDisco', label: 'Disco 1 (Cap.)' }, { key: 'tipoDisco2', label: 'Disco 2 (Tipo)' }, { key: 'capacidadDisco2', label: 'Disco 2 (Cap.)' }, { key: 'sistemaOperativo', label: 'Sistema Operativo' }, { key: 'mac', label: 'MAC' }, { key: 'ip', label: 'IP' }, { key: 'estado', label: 'Estado' }, { key: 'enAlmacen', label: 'En Almacén' }, { key: 'centro', label: 'Centro' }, { key: 'oficina', label: 'Oficina' }, { key: 'piso', label: 'Piso' }, { key: 'personaAsignada', label: 'Persona Asignada' }, { key: 'numeroEmpleado', label: 'Nro. Empleado' }, { key: 'cargo', label: 'Cargo' }, { key: 'nombreResponsable', label: 'Responsable' }, { key: 'fechaAsignacion', label: 'Fecha Asignación' }, { key: 'notas', label: 'Notas' }, { key: 'historial', label: 'Historial' }, { key: 'marcaCPU', label: 'Marca CPU' }, { key: 'modeloCPU', label: 'Modelo CPU' }, { key: 'codigoActivoCPU', label: 'Cód. AF CPU' }, { key: 'numeroSerieCPU', label: 'Serie CPU' }, { key: 'marcaMonitor', label: 'Marca Monitor' }, { key: 'modeloMonitor', label: 'Modelo Monitor' }, { key: 'codigoActivoMonitor', label: 'Cód. AF Monitor' }, { key: 'numeroSerieMonitor', label: 'Serie Monitor' }, { key: 'conexionImpresora', label: 'Conexión' }
];

const CAMPOS_POR_TIPO = {
  'Laptop': ['numero', 'nombreEquipo', 'marca', 'modelo', 'codigoActivo', 'numeroSerie', 'procesador', 'generacion', 'ram', 'sistemaOperativo', 'mac', 'ip', 'tipoDisco', 'capacidadDisco', 'tipoDisco2', 'capacidadDisco2', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial'],
  'Computadora All in One': ['numero', 'nombreEquipo', 'marca', 'modelo', 'codigoActivo', 'numeroSerie', 'procesador', 'generacion', 'ram', 'sistemaOperativo', 'mac', 'ip', 'tipoDisco', 'capacidadDisco', 'tipoDisco2', 'capacidadDisco2', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial'],
  'Computadora de Escritorio': ['numero', 'nombreEquipo', 'marcaCPU', 'modeloCPU', 'codigoActivoCPU', 'numeroSerieCPU', 'procesador', 'generacion', 'ram', 'sistemaOperativo', 'mac', 'ip', 'tipoDisco', 'capacidadDisco', 'tipoDisco2', 'capacidadDisco2', 'marcaMonitor', 'modeloMonitor', 'codigoActivoMonitor', 'numeroSerieMonitor', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial'],
  'Impresora': ['numero', 'marca', 'modelo', 'codigoActivo', 'numeroSerie', 'conexionImpresora', 'mac', 'ip', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial'],
  'Impresora Multifuncional': ['numero', 'marca', 'modelo', 'codigoActivo', 'numeroSerie', 'conexionImpresora', 'mac', 'ip', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial'],
  'Scanner': ['numero', 'marca', 'modelo', 'codigoActivo', 'numeroSerie', 'conexionImpresora', 'mac', 'ip', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial'],
  'Switch': ['numero', 'marca', 'modelo', 'codigoActivo', 'numeroSerie', 'mac', 'ip', 'estado', 'oficina', 'piso', 'personaAsignada', 'numeroEmpleado', 'cargo', 'nombreResponsable', 'fechaAsignacion', 'notas', 'historial']
};

const datosIniciales = [
  { id: '1', centro: 'sucre', numero: '0001', tipo: 'Laptop', nombreEquipo: 'LAP-JPEREZ', marca: 'Lenovo', modelo: 'T14', codigoActivo: 'AF-001', numeroSerie: 'LP-001', procesador: 'Intel i5', generacion: '10ma', ram: '8 GB', tipoDisco: 'SSD M.2', capacidadDisco: '256 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: 'Win 11', mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.10', estado: 'Activo', enAlmacen: false, oficina: 'Contabilidad', piso: '2', cargo: 'Contador', numeroEmpleado: 'EMP-001', personaAsignada: 'Juan Perez', nombreResponsable: 'Juan Perez', fechaAsignacion: '2024-01-15', notas: '', fotoEquipo: '', fotoSerie: '', historial: [{ fecha: '15/01/2024', nota: 'Equipo registrado' }] }
];
const OFICINAS_DEFAULT = { sucre: [{ id: 'conta', nombre: 'Contabilidad', piso: '2' }, { id: 'rrhh', nombre: 'Recursos Humanos', piso: '1' }] };
const PISOS_DEFAULT = { sucre: ['1', '2'] };

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [customPass, setCustomPass] = useState('admin123');
  const [vista, setVista] = useState('hub');
  const [centroActual, setCentroActual] = useState(null);
  const [categoriaVista, setCategoriaVista] = useState('computo');
  const [subtipoFiltro, setSubtipoFiltro] = useState('Todos');
  const [oficinaFiltro, setOficinaFiltro] = useState(null);
  const [pisoFiltro, setPisoFiltro] = useState('Todos');
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [activos, setActivos] = useState([]);
  const [centros, setCentros] = useState([]);
  const [oficinas, setOficinas] = useState({});
  const [pisos, setPisos] = useState({}); 
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const [pisoExpandido, setPisoExpandido] = useState(null);
  const [logo, setLogo] = useState(null);
  const [reporteCols, setReporteCols] = useState({}); 
  const [catsReporte, setCatsReporte] = useState([...SUBTIPOS_REPORTE]);
  const [reporteExpandido, setReporteExpandido] = useState(null); 
  const [darkMode, setDarkMode] = useState(localStorage.getItem('dark_mode') === 'true');

  useEffect(() => {
    const c = localStorage.getItem('mis_centros_v74'); if (c) setCentros(JSON.parse(c)); else { setCentros(CENTROS_DEFAULT); localStorage.setItem('mis_centros_v74', JSON.stringify(CENTROS_DEFAULT)); }
    const d = localStorage.getItem('activos_fijos_v74'); if (d) setActivos(JSON.parse(d)); else { setActivos(datosIniciales); localStorage.setItem('activos_fijos_v74', JSON.stringify(datosIniciales)); }
    const o = localStorage.getItem('mis_oficinas_v74'); if (o) setOficinas(JSON.parse(o)); else { setOficinas(OFICINAS_DEFAULT); localStorage.setItem('mis_oficinas_v74', JSON.stringify(OFICINAS_DEFAULT)); }
    const p = localStorage.getItem('mis_pisos_v74'); if (p) setPisos(JSON.parse(p)); else { setPisos(PISOS_DEFAULT); localStorage.setItem('mis_pisos_v74', JSON.stringify(PISOS_DEFAULT)); }
    const passLs = localStorage.getItem('app_pass_v74'); if (passLs) setCustomPass(passLs);
    const l = localStorage.getItem('logo_empresa_v74'); if (l) setLogo(l);
  }, []);

  const guardarDatos = (n) => { setActivos(n); localStorage.setItem('activos_fijos_v74', JSON.stringify(n)); };
  const guardarOficinas = (n) => { setOficinas(n); localStorage.setItem('mis_oficinas_v74', JSON.stringify(n)); };
  const guardarPisos = (n) => { setPisos(n); localStorage.setItem('mis_pisos_v74', JSON.stringify(n)); };
  const guardarCentros = (n) => { setCentros(n); localStorage.setItem('mis_centros_v74', JSON.stringify(n)); };
  const handleLogin = (e) => { e.preventDefault(); if (user === 'admin' && pass === customPass) setIsLoggedIn(true); };
  const getNextNumber = () => { const d = JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'); return (d.reduce((m, a) => Math.max(m, parseInt(a.numero || '0')), 0) + 1).toString().padStart(4, '0'); };
  
  const agregarCentro = () => { const n = prompt('Nombre del nuevo Multicentro:'); if (n && n.trim()) { const id = n.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4); guardarCentros([...centros, { id, nombre: n.trim() }]); } };
  const editarCentro = (id, viejoNombre) => { const n = prompt('Editar nombre:', viejoNombre); if (n && n.trim() && n !== viejoNombre) { guardarCentros(centros.map(c => c.id === id ? { ...c, nombre: n.trim() } : c)); } };
  const eliminarCentro = (id) => { if (confirm('Eliminar este Multicentro y sus equipos?')) { guardarCentros(centros.filter(c => c.id !== id)); guardarDatos(activos.filter(a => a.centro !== id)); const no = { ...oficinas }; delete no[id]; guardarOficinas(no); const np = { ...pisos }; delete np[id]; guardarPisos(np); } };

  const agregarPiso = () => { const n = prompt('Nombre del nuevo piso:'); if (n && n.trim()) { const pc = pisos[centroActual] || []; if (!pc.includes(n.trim())) { guardarPisos({ ...pisos, [centroActual]: [...pc, n.trim()] }); setMsg('Piso agregado'); setTimeout(()=>setMsg(''), 2000); } else { alert('Ese piso ya existe'); } } };
  const editarPiso = (viejoPiso) => { const n = prompt('Editar nombre del piso:', viejoPiso); if (n && n.trim() && n !== viejoPiso) { if (pisos[centroActual].includes(n.trim())) { alert('Ese piso ya existe'); return; } guardarPisos({ ...pisos, [centroActual]: pisos[centroActual].map(p => p === viejoPiso ? n.trim() : p) }); const no = (oficinas[centroActual] || []).map(o => o.piso === viejoPiso ? { ...o, piso: n.trim() } : o); guardarOficinas({ ...oficinas, [centroActual]: no }); const na = activos.map(a => a.centro === centroActual && a.piso === viejoPiso ? { ...a, piso: n.trim() } : a); guardarDatos(na); setMsg('Piso actualizado'); setTimeout(()=>setMsg(''), 2000); } };
  const eliminarPiso = (piso) => { if (confirm(`Eliminar el piso ${piso}?`)) { guardarPisos({ ...pisos, [centroActual]: pisos[centroActual].filter(p => p !== piso) }); const no = (oficinas[centroActual] || []).map(o => o.piso === piso ? { ...o, piso: '' } : o); guardarOficinas({ ...oficinas, [centroActual]: no }); setMsg('Piso eliminado'); setTimeout(()=>setMsg(''), 2000); } };

  const agregarOficina = () => { const n = prompt('Nombre de la nueva oficina:'); if (n && n.trim()) { const pc = pisos[centroActual] || []; let p = ''; if (pc.length > 0) { p = prompt(`En qué piso está? (${pc.join(', ')}):`, pc[0]); if (p && !pc.includes(p)) { alert('Ese piso no existe.'); return; } } else { alert('Primero crea un piso.'); return; } const no = [...(oficinas[centroActual] || []), { id: n.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4), nombre: n.trim(), piso: p }]; guardarOficinas({...oficinas, [centroActual]: no}); setMsg('Oficina agregada'); setTimeout(()=>setMsg(''), 2000); } };
  const editarOficina = (id, viejoNombre) => { const n = prompt('Editar nombre:', viejoNombre); if (n && n.trim() && n !== viejoNombre) { const no = (oficinas[centroActual] || []).map(o => o.id === id ? { ...o, nombre: n.trim() } : o); guardarOficinas({ ...oficinas, [centroActual]: no }); const na = activos.map(a => a.centro === centroActual && a.oficina === viejoNombre ? { ...a, oficina: n.trim() } : a); guardarDatos(na); setMsg('Oficina actualizada'); setTimeout(()=>setMsg(''), 2000); } };
  const eliminarOficina = (id, nombre) => { if (confirm(`Eliminar ${nombre}?`)) { guardarOficinas({ ...oficinas, [centroActual]: (oficinas[centroActual] || []).filter(o => o.id !== id) }); setMsg('Oficina eliminada'); setTimeout(()=>setMsg(''), 2000); } };

  const limpiarFormulario = () => { setEditando({ _template: true, oficina: oficinaFiltro || '', piso: pisoFiltro || '' }); setVista('formulario'); };
  
  const getValor = (a, key) => { if (key === 'enAlmacen') return a.enAlmacen ? 'SI' : 'NO'; if (key === 'historial') { if (!a.historial || a.historial.length === 0) return 'Sin registros'; return a.historial.map(h => `[${h.fecha}] ${h.nota}`).join(' \n '); } if (key === 'centro') return centros.find(c => c.id === a.centro)?.nombre || '-'; return a[key] || '-'; };
  const getSubtipo = (a) => (a.tipo === 'Impresora' && a.subtipoImpresora === 'Multifuncional') ? 'Impresora Multifuncional' : (a.tipo === 'Impresora' && a.subtipoImpresora === 'Scanner') ? 'Scanner' : a.tipo;

  const handleCheckCol = (tipo, key) => setReporteCols(prev => { const c = prev[tipo] || []; return { ...prev, [tipo]: c.includes(key) ? c.filter(k => k !== key) : [...c, key] }; });
  const selectAllCols = (tipo) => setReporteCols(prev => ({ ...prev, [tipo]: [...CAMPOS_POR_TIPO[tipo]] }));
  const clearCols = (tipo) => setReporteCols(prev => { const n = {...prev}; delete n[tipo]; return n; });
  const handleCatReporte = (cat) => setCatsReporte(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleVolver = () => {
    if (vista === 'formulario' || vista === 'detalles') { if ((editando && editando.enAlmacen) || !centroActual) setVista('almacen'); else setVista('lista'); } 
    else if (vista === 'lista' || vista === 'reporte' || vista === 'oficinas' || vista === 'gestion_centros') { setVista('hub'); setEstadoFiltro(null); setOficinaFiltro(null); setPisoFiltro('Todos'); setBusqueda(''); setSubtipoFiltro('Todos'); setCentroActual(null); } 
    else if (vista === 'dashboard' || vista === 'almacen' || vista === 'config') { setVista('hub'); setCentroActual(null); setPisoExpandido(null); }
  };

  const guardarArchivoNativo = async (blob, nombreArchivo) => {
    setCargando(true); setMsg('Preparando archivo...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        await Filesystem.writeFile({ path: nombreArchivo, data: base64, directory: Directory.Cache });
        const uriResult = await Filesystem.getUri({ path: nombreArchivo, directory: Directory.Cache });
        await Share.share({ url: uriResult.uri });
        setMsg('Abre el menu y elige "Guardar en archivos" o "PDF Viewer"'); setCargando(false);
      };
      reader.readAsDataURL(blob);
    } catch(e) { setMsg('Error al guardar.'); setCargando(false); }
    setTimeout(()=>setMsg(''), 4000);
  };

  const exportarCSV = () => {
    const datosCentro = activos.filter(a => a.centro === centroActual && !a.enAlmacen);
    let csv = '\uFEFF' + 'REPORTE DE ACTIVOS FIJOS\nCentro: ' + (centros.find(c=>c.id===centroActual)?.nombre || '') + '\n---------------------------------------------------\n';
    catsReporte.forEach(cat => {
      const datosCat = datosCentro.filter(a => getSubtipo(a) === cat);
      const cols = reporteCols[cat] || [];
      if (datosCat.length > 0 && cols.length > 0) {
        csv += '\n=== ' + cat.toUpperCase() + ' ===\n';
        csv += cols.map(k => CAMPOS.find(c=>c.key===k)?.label || k).join(';') + '\n';
        datosCat.forEach(a => { csv += cols.map(k => getValor(a, k)).map(c => '\x22' + String(c).replace(/\x22/g, '\x22\x22') + '\x22').join(';') + '\n'; });
      }
    });
    guardarArchivoNativo(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'Reporte_Activos.csv');
  };

  const COLORES_PDF = { 'Laptop': [30, 58, 95], 'Computadora de Escritorio': [22, 163, 74], 'Computadora All in One': [217, 119, 6], 'Impresora': [220, 38, 38], 'Impresora Multifuncional': [147, 51, 234], 'Scanner': [14, 165, 233], 'Switch': [120, 53, 15] };

  const exportarPDF = () => {
    const datosCentro = activos.filter(a => a.centro === centroActual && !a.enAlmacen);
    const doc = new jsPDF('l', 'mm', 'a4'); 
    if (logo) { try { doc.addImage(logo, 'PNG', 14, 10, 30, 15); } catch (e) {} }
    doc.setFontSize(18); doc.setTextColor(30, 58, 95); doc.text('Reporte de Activos Fijos', 50, 18);
    doc.setFontSize(10); doc.setTextColor(100); doc.text('Centro: ' + (centros.find(c=>c.id===centroActual)?.nombre || ''), 50, 24);
    doc.text('Generado: ' + new Date().toLocaleDateString(), 250, 18);
    let currentY = 30;
    catsReporte.forEach(cat => {
      const datosCat = datosCentro.filter(a => getSubtipo(a) === cat);
      const cols = reporteCols[cat] || [];
      if (datosCat.length > 0 && cols.length > 0) {
        const headers = cols.map(k => CAMPOS.find(c=>c.key===k)?.label || k);
        const rows = datosCat.map(a => cols.map(k => String(getValor(a, k))));
        if (currentY > 160) { doc.addPage(); currentY = 20; }
        doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.text(cat + ' (' + datosCat.length + ')', 14, currentY); currentY += 4;
        doc.autoTable({ startY: currentY, head: [headers], body: rows, styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: COLORES_PDF[cat] || [30, 58, 95] }, margin: { left: 14, right: 14 } });
        currentY = doc.lastAutoTable.finalY + 10;
      }
    });
    guardarArchivoNativo(doc.output('blob'), 'Reporte_Activos.pdf');
  };

  const generarDatosQR = (f) => { 
    if (!f) return ''; 
    let t = '=== ACTIVO FIJO ===\nNro: ' + f.numero + '\nTipo: ' + f.tipo + '\n'; 
    if (f.nombreEquipo) t += 'Nombre: ' + f.nombreEquipo + '\n'; 
    if (f.marca) t += 'Marca: ' + f.marca + '\n'; 
    if (f.numeroSerie) t += 'Serie: ' + f.numeroSerie + '\n'; 
    if (f.codigoActivo) t += 'Cod AF: ' + f.codigoActivo + '\n'; 
    t += 'Estado: ' + f.estado + '\n'; 
    if (f.enAlmacen) t += 'Ubicacion: ALMACEN\n'; 
    else { if (f.personaAsignada) t += 'Asignado a: ' + f.personaAsignada + '\n'; if (f.oficina) t += 'Oficina: ' + f.oficina + '\n'; } 
    return t + '===================\nID_APP:' + f.id; 
  };
  
  const compartirQR = async (f) => { 
    try { 
      const canvas = document.querySelector('#qr-detalles-canvas canvas'); 
      if (!canvas) return; 
      setMsg('Preparando QR...'); 
      const base64 = canvas.toDataURL('image/png').split(',')[1]; 
      await Filesystem.writeFile({ path: `QR_${f.numero}.png`, data: base64, directory: Directory.Cache }); 
      const uriResult = await Filesystem.getUri({ path: `QR_${f.numero}.png`, directory: Directory.Cache }); 
      await Share.share({ url: uriResult.uri, dialogTitle: 'Compartir Código QR' }); 
      setMsg('Listo.'); setTimeout(() => setMsg(''), 3000); 
    } catch (e) { setMsg('Error.'); setTimeout(() => setMsg(''), 3000); } 
  };

  const escanearQR = async () => {
    try {
      setMsg('Abriendo cámara...');
      const image = await Camera.getPhoto({ quality: 80, allowEditing: false, resultType: CameraResultType.Base64, source: CameraSource.Camera });
      setMsg('Leyendo código...');
      const img = new Image();
      img.onload = async () => {
        try {
          const tempCanvas = document.createElement('canvas'); tempCanvas.width = img.width; tempCanvas.height = img.height;
          const ctx = tempCanvas.getContext('2d'); ctx.drawImage(img, 0, 0);
          let detectedCode = null;
          if ('BarcodeDetector' in window) { try { const detector = new BarcodeDetector({ formats: ['code_39', 'code_128', 'ean_13', 'qr_code'] }); const codes = await detector.detect(tempCanvas); if (codes.length > 0) detectedCode = codes[0].rawValue; } catch(e) {} }
          if (!detectedCode) { const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height); const code = jsQR(imageData.data, imageData.width, imageData.height); if (code) detectedCode = code.data; }
          if (detectedCode) {
            const match = detectedCode.match(/ID_APP:(.*)/);
            if (match && match[1]) { const equipo = activos.find(a => a.id === match[1].trim()); if (equipo) { setCentroActual(equipo.centro); setEditando(equipo); setVista('detalles'); setMsg(''); return; } }
            const equipo = activos.find(a => a.codigoActivo === detectedCode || a.numeroSerie === detectedCode || a.numeroSerieCPU === detectedCode);
            if (equipo) { setCentroActual(equipo.centro); setEditando(equipo); setVista('detalles'); setMsg(''); return; }
            alert('Código leído: ' + detectedCode + '\n\nPero no se encontró equipo.'); setMsg('');
          } else { alert('No se detectó código.'); setMsg(''); }
        } catch (err) { alert('Error al procesar imagen.'); setMsg(''); }
      };
      img.src = 'data:image/jpeg;base64,' + image.base64String;
    } catch (e) { setMsg('Escaneo cancelado.'); setTimeout(() => setMsg(''), 2000); }
  };

  const escanearParaCampo = async (campo) => {
    try {
      setMsg('Abriendo cámara...');
      const image = await Camera.getPhoto({ quality: 80, allowEditing: false, resultType: CameraResultType.Base64, source: CameraSource.Camera });
      const img = new Image();
      img.onload = async () => {
        try {
          const tempCanvas = document.createElement('canvas'); tempCanvas.width = img.width; tempCanvas.height = img.height;
          const ctx = tempCanvas.getContext('2d'); ctx.drawImage(img, 0, 0);
          let detectedCode = null;
          if ('BarcodeDetector' in window) { try { const detector = new BarcodeDetector({ formats: ['code_39', 'code_128', 'ean_13', 'qr_code'] }); const codes = await detector.detect(tempCanvas); if (codes.length > 0) detectedCode = codes[0].rawValue; } catch(e) {} }
          if (!detectedCode) { const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height); const code = jsQR(imageData.data, imageData.width, imageData.height); if (code) detectedCode = code.data; }
          if (detectedCode) {
            const val = detectedCode.match(/ID_APP:(.*)/) ? detectedCode.match(/ID_APP:(.*)/)[1] : detectedCode;
            setForm(prev => ({ ...prev, [campo]: val })); setMsg('Código capturado: ' + val); setTimeout(()=>setMsg(''), 3000);
          } else { alert('No se detectó código.'); setMsg(''); }
        } catch (err) { alert('Error al analizar la foto.'); setMsg(''); }
      };
      img.src = 'data:image/jpeg;base64,' + image.base64String;
    } catch (e) { setMsg('Cancelado'); setTimeout(() => setMsg(''), 2000); }
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-black' : 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800'}`}>
        <div className={`p-8 rounded-3xl shadow-2xl w-full max-w-sm border ${darkMode ? 'bg-gray-900 border-fuchsia-500' : 'bg-white border-gray-100'}`}>
          <div className='flex justify-center mb-6'>{logo ? <img src={logo} alt='Logo' className='h-24 object-contain' /> : <ShieldCheck size={64} className={darkMode ? 'text-fuchsia-500' : 'text-blue-600'} />}</div>
          <h1 className={`text-2xl font-bold text-center mb-1 ${darkMode ? 'text-cyan-200' : 'text-gray-800'}`}>Control de Activos</h1>
          <p className={`text-center text-sm mb-6 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Ingrese sus credenciales</p>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div><label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>USUARIO</label><input type='text' placeholder='admin' value={user} onChange={e => setUser(e.target.value)} className={`w-full p-3 rounded-xl ${darkMode ? 'bg-black border-cyan-500 text-cyan-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`} /></div>
            <div><label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CONTRASENA</label><input type='password' placeholder='********' value={pass} onChange={e => setPass(e.target.value)} className={`w-full p-3 rounded-xl ${darkMode ? 'bg-black border-cyan-500 text-cyan-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`} /></div>
            <button type='submit' className={`w-full p-3 rounded-xl font-bold shadow-lg ${darkMode ? 'bg-fuchsia-600 text-white' : 'bg-blue-600 text-white'}`}>INGRESAR</button>
          </form>
        </div>
      </div>
    );
  }

  const datosCentro = centroActual ? activos.filter(a => a.centro === centroActual && !a.enAlmacen && (categoriaVista === 'computo' ? TIPOS_COMPUTO.includes(getSubtipo(a)) : TIPOS_RED.includes(getSubtipo(a)))) : [];
  const oficinasCentro = oficinas[centroActual] || [];
  const pisosCentroActual = pisos[centroActual] || [];
  let datosFinales = datosCentro;
  if (estadoFiltro) datosFinales = datosFinales.filter(a => a.estado === estadoFiltro);
  else if (oficinaFiltro) { datosFinales = datosFinales.filter(a => a.oficina === oficinaFiltro); if (pisoFiltro !== 'Todos') datosFinales = datosFinales.filter(a => a.piso === pisoFiltro); }
  if (subtipoFiltro !== 'Todos') datosFinales = datosFinales.filter(a => getSubtipo(a) === subtipoFiltro);
  const activosFiltrados = datosFinales.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numero||'').includes(busqueda));
  const activosEnAlmacen = activos.filter(a => a.enAlmacen);
  const oficinasAgrupadas = {};
  oficinasCentro.forEach(o => { const p = o.piso || 'Sin Piso'; if (!oficinasAgrupadas[p]) oficinasAgrupadas[p] = []; oficinasAgrupadas[p].push(o); });
  const pisosOrdenados = Object.keys(oficinasAgrupadas).sort((a, b) => { if (a === 'Sin Piso') return 1; if (b === 'Sin Piso') return -1; return a.localeCompare(b); });

  const appBg = darkMode ? 'bg-black text-cyan-200' : 'bg-gray-100 text-gray-800';
  const hdrBg = darkMode ? 'bg-black border-b border-fuchsia-500' : 'bg-blue-700';
  const cardBg = darkMode ? 'bg-gray-900 border border-fuchsia-500/30' : 'bg-white border border-gray-200';
  const txtMain = darkMode ? 'text-cyan-200' : 'text-gray-800';
  const txtMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const txtDark = darkMode ? 'text-fuchsia-400' : 'text-blue-600';
  const btnPrimary = darkMode ? 'bg-fuchsia-600 text-white' : 'bg-blue-600 text-white';
  const btnSecondary = darkMode ? 'bg-cyan-600 text-black' : 'bg-indigo-600 text-white';
  const btnDanger = darkMode ? 'bg-red-900/50 text-red-400 border border-red-500' : 'bg-red-100 text-red-600';
  const inputClass = darkMode ? 'bg-black border border-cyan-500 text-cyan-200' : 'bg-white border border-gray-300 text-gray-800';

  return (
    <div className={`min-h-screen pb-20 ${appBg}`}>
      {msg && <div className={`text-white text-center p-2 font-bold fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-fuchsia-600' : 'bg-green-500'}`}>{cargando ? 'Generando archivo...' : msg}</div>}
      <div className={`${hdrBg} ${darkMode ? 'text-fuchsia-300' : 'text-white'} p-4 shadow-lg flex justify-between items-center sticky top-0 z-10`}>
        <div className='flex gap-3 items-center'>
          {vista !== 'hub' && <button onClick={handleVolver} className={`p-2 rounded-lg ${darkMode ? 'bg-fuchsia-900/50' : 'bg-blue-800'}`}><ArrowLeft size={20} /></button>}
          {vista === 'hub' && <button onClick={() => setVista('config')} className={`p-2 rounded-lg ${darkMode ? 'bg-fuchsia-900/50' : 'bg-blue-800'}`}><Key size={20} /></button>}
          <h1 className='text-lg font-bold'>{vista === 'almacen' ? 'Almacén Global' : (vista === 'gestion_centros' ? 'Gestión Multicentros' : (centroActual ? centros.find(c => c.id === centroActual)?.nombre : 'Multicentros'))}</h1>
        </div>
        <div className='flex gap-2'>
          <button onClick={() => { const n = !darkMode; setDarkMode(n); localStorage.setItem('dark_mode', n); }} className={`p-2 rounded-lg ${darkMode ? 'bg-fuchsia-900/50' : 'bg-blue-800'}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={() => setIsLoggedIn(false)} className={`p-2 rounded-lg ${darkMode ? 'bg-fuchsia-900/50' : 'bg-blue-800'}`}><LogOut size={20} /></button>
        </div>
      </div>

      <div className='p-4'>
        {vista === 'hub' && (
          <div className='space-y-4'>
            <button onClick={escanearQR} className={`w-full p-6 rounded-xl flex justify-between items-center active:opacity-80 mb-4 ${darkMode ? 'bg-fuchsia-900/30 border border-fuchsia-500 text-fuchsia-300' : 'bg-purple-600 text-white'}`}><div className='flex items-center gap-3'><ScanLine size={32} /><div className='text-left'><h3 className='text-lg font-bold'>Escanear Código</h3><p className='text-sm opacity-80'>Ver ficha del equipo</p></div></div></button>
            <button onClick={() => { setCentroActual(null); setVista('almacen'); }} className={`w-full p-6 rounded-xl flex justify-between items-center active:opacity-80 mb-4 ${darkMode ? 'bg-cyan-900/30 border border-cyan-500 text-cyan-300' : 'bg-indigo-600 text-white'}`}><div className='flex items-center gap-3'><Warehouse size={32} /><div className='text-left'><h3 className='text-lg font-bold'>Almacén Global</h3><p className='text-sm opacity-80'>Equipos sin asignar</p></div></div><span className={`font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center ${darkMode ? 'bg-cyan-500 text-black' : 'bg-white text-indigo-600'}`}>{activosEnAlmacen.length}</span></button>
            
            <div className='flex justify-between items-center mb-2'>
              <div className={`flex items-center gap-2 ${txtMuted}`}><Building2 size={20} /><h2 className='text-xl font-bold'>Multicentros</h2></div>
              <button onClick={() => setVista('gestion_centros')} className={`px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold ${darkMode ? 'bg-fuchsia-900/50 text-fuchsia-300' : 'bg-indigo-100 text-indigo-700'}`}><Edit3 size={16} /> Gestionar</button>
            </div>
            <div className='grid grid-cols-1 gap-4'>
              {centros.map((c, index) => { 
                const color = COLORES_ITEMS[index % COLORES_ITEMS.length]; 
                const cClass = darkMode ? `${color.bordeN} ${color.fondoN} ${color.textoN}` : `${color.borde} ${color.fondo} text-gray-800`; 
                return (
                  <button key={c.id} onClick={() => { setCentroActual(c.id); setVista('dashboard'); setPisoExpandido(null); setCategoriaVista('computo'); }} className={`p-6 rounded-xl shadow-sm border-l-4 text-left active:opacity-80 ${cClass}`}>
                    <h3 className='text-lg font-bold'>{c.nombre}</h3>
                    <p className='text-sm opacity-70 mt-1'>{activos.filter(a => a.centro === c.id && !a.enAlmacen).length} activos</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {vista === 'gestion_centros' && (
          <div>
            <button onClick={handleVolver} className={`flex items-center font-bold mb-4 ${txtDark}`}><ArrowLeft size={20} /> Volver al Menú</button>
            <div className={`p-4 rounded-xl shadow-sm ${cardBg}`}>
              <div className='flex justify-between items-center mb-4'>
                <h2 className={`font-bold text-lg ${txtMain}`}>Administrar Multicentros</h2>
                <button onClick={agregarCentro} className={`px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-sm ${btnPrimary}`}><Plus size={18} /> Nuevo</button>
              </div>
              <div className='space-y-3'>
                {centros.map((c, index) => { 
                  const color = COLORES_ITEMS[index % COLORES_ITEMS.length]; 
                  const cClass = darkMode ? `${color.bordeN} ${color.fondoN}` : `${color.borde} ${color.fondo}`; 
                  return (
                    <div key={c.id} className={`flex justify-between items-center p-4 rounded-lg border ${cClass}`}>
                      <div><p className={`font-bold ${txtMain}`}>{c.nombre}</p><p className={`text-xs ${txtMuted}`}>{activos.filter(a => a.centro === c.id).length} equipos totales</p></div>
                      <div className='flex gap-2'><button onClick={() => editarCentro(c.id, c.nombre)} className={`px-3 py-2 rounded-lg text-sm font-bold ${btnSecondary}`}>Editar</button><button onClick={() => eliminarCentro(c.id)} className={`px-3 py-2 rounded-lg text-sm font-bold ${btnDanger}`}>Borrar</button></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {vista === 'almacen' && (
          <div>
            <div className='flex gap-2 mb-4'>
              <div className='flex-1 relative'>
                <Search className={`absolute left-3 top-3.5 ${txtMuted}`} size={18} />
                <input placeholder='Buscar en almacén...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl shadow-sm ${inputClass}`} />
              </div>
              <button onClick={limpiarFormulario} className={`px-4 rounded-xl flex items-center gap-2 shadow-sm ${btnPrimary}`}><Plus size={20} /> Nuevo</button>
            </div>
            <div className='space-y-3'>
              {activosEnAlmacen.length === 0 ? <p className={`text-center mt-10 ${txtMuted}`}>El almacén está vacío.</p> : 
              activosEnAlmacen.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase())).map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('detalles'); }} className={`p-4 rounded-xl shadow-sm border-l-4 border-indigo-400 active:opacity-80 ${cardBg}`}>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-xs text-indigo-600 font-bold'>Nro. {a.numero}</p>
                      <h3 className={`font-bold ${txtMain}`}>{a.nombreEquipo || (a.marcaCPU || a.marca) + ' ' + (a.modeloCPU || a.modelo)}</h3>
                      <p className={`text-sm ${txtMuted}`}>{a.tipo} {a.subtipoImpresora ? '- '+a.subtipoImpresora : ''}</p>
                    </div>
                    {a.centro && <span className={`text-xs font-bold px-2 py-1 rounded-full ${darkMode ? 'bg-black' : 'bg-gray-100 text-gray-600'}`}>{centros.find(c=>c.id===a.centro)?.nombre || 'N/A'}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {centroActual && vista === 'dashboard' && (
          <div className='space-y-4'>
            <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-black border border-fuchsia-500' : 'bg-gray-200'}`}>
              <button onClick={() => { setCategoriaVista('computo'); setEstadoFiltro(null); setOficinaFiltro(null); setSubtipoFiltro('Todos'); }} className={`flex-1 p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${categoriaVista === 'computo' ? (darkMode ? 'bg-gray-900 text-fuchsia-400' : 'bg-white text-blue-600 shadow') : txtMuted}`}>
                <Laptop size={18} /> Cómputo ({activos.filter(a => a.centro === centroActual && !a.enAlmacen && TIPOS_COMPUTO.includes(getSubtipo(a))).length})
              </button>
              <button onClick={() => { setCategoriaVista('red'); setEstadoFiltro(null); setOficinaFiltro(null); setSubtipoFiltro('Todos'); }} className={`flex-1 p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${categoriaVista === 'red' ? (darkMode ? 'bg-gray-900 text-cyan-400' : 'bg-white text-blue-600 shadow') : txtMuted}`}>
                <Printer size={18} /> Red ({activos.filter(a => a.centro === centroActual && !a.enAlmacen && TIPOS_RED.includes(getSubtipo(a))).length})
              </button>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${txtMain}`}>Resumen General</h2>
            <div className='grid grid-cols-2 gap-3'>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro(null); setSubtipoFiltro('Todos'); setVista('lista'); }} className={`p-4 rounded-xl shadow-sm border-l-4 border-gray-500 text-left ${cardBg}`}><p className={`text-xs ${txtMuted}`}>Total Equipos</p><p className={`text-2xl font-bold ${txtMain}`}>{datosCentro.length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('Activo'); setSubtipoFiltro('Todos'); setVista('lista'); }} className={`p-4 rounded-xl shadow-sm border-l-4 border-green-500 text-left ${cardBg}`}><p className={`text-xs ${txtMuted}`}>Activos</p><p className='text-2xl font-bold text-green-500'>{datosCentro.filter(a=>a.estado==='Activo').length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('Danado'); setSubtipoFiltro('Todos'); setVista('lista'); }} className={`p-4 rounded-xl shadow-sm border-l-4 border-red-500 text-left ${cardBg}`}><p className={`text-xs ${txtMuted}`}>Dañados</p><p className='text-2xl font-bold text-red-500'>{datosCentro.filter(a=>a.estado==='Danado').length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('En Mantenimiento'); setSubtipoFiltro('Todos'); setVista('lista'); }} className={`p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 text-left ${cardBg}`}><p className={`text-xs ${txtMuted}`}>Mantenimiento</p><p className='text-2xl font-bold text-yellow-500'>{datosCentro.filter(a=>a.estado==='En Mantenimiento').length}</p></button>
            </div>
            <div className='flex justify-between items-center mt-4 mb-2'>
              <h3 className={`font-bold flex items-center gap-2 ${txtMain}`}><MapPin size={18} /> Oficinas por Piso</h3>
              <button onClick={() => setVista('oficinas')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold ${darkMode ? 'bg-fuchsia-900/50 text-fuchsia-300' : 'bg-indigo-100 text-indigo-700'}`}><Edit3 size={16} /> Gestionar</button>
            </div>
            {pisosOrdenados.length === 0 ? <p className={`text-sm p-4 rounded-lg text-center ${cardBg} ${txtMuted}`}>No hay oficinas asignadas a pisos. Ve a Gestionar.</p> : (
              <div className='space-y-3'>
                {pisosOrdenados.map((p, pIdx) => { 
                  const colorPiso = COLORES_ITEMS[pIdx % COLORES_ITEMS.length]; 
                  const cClass = darkMode ? `${colorPiso.bordeN} ${colorPiso.fondoN}` : `${colorPiso.borde} ${colorPiso.fondo}`;
                  const equiposEnPiso = datosCentro.filter(a => (a.piso || 'Sin Piso') === p).length; 
                  const oficinasEnPiso = oficinasAgrupadas[p]; 
                  return (
                    <div key={p} className={`rounded-xl shadow-sm overflow-hidden border ${cardBg} ${darkMode ? colorPiso.bordeN : ''}`}>
                      <button onClick={() => setPisoExpandido(pisoExpandido === p ? null : p)} className='w-full p-4 flex justify-between items-center active:opacity-80'>
                        <span className={`font-bold ${txtMain}`}>Piso {p}</span>
                        <div className='flex items-center gap-3'>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${darkMode ? 'bg-black text-fuchsia-300' : 'bg-gray-100 text-gray-600'}`}>{equiposEnPiso} equipos</span>
                          <ChevronDown size={20} className={`${txtMuted} transition-transform ${pisoExpandido === p ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {pisoExpandido === p && (
                        <div className='p-3 pt-0 grid grid-cols-2 gap-3'>
                          {oficinasEnPiso.length === 0 ? <p className={`col-span-2 text-center text-xs py-2 ${txtMuted}`}>No hay oficinas.</p> : 
                          oficinasEnPiso.map((o, oIdx) => { 
                            const colorOficina = COLORES_ITEMS[(pIdx + oIdx) % COLORES_ITEMS.length]; 
                            const oClass = darkMode ? `${colorOficina.fondoN} ${colorOficina.bordeN}` : `${colorOficina.fondo} ${colorOficina.borde}`;
                            const count = datosCentro.filter(a => a.oficina === o.nombre).length; 
                            return (
                              <button key={o.id} onClick={() => { setOficinaFiltro(o.nombre); setPisoFiltro(p === 'Sin Piso' ? '' : p); setEstadoFiltro(null); setSubtipoFiltro('Todos'); setVista('lista'); setBusqueda(''); }} className={`p-3 rounded-lg border text-left active:opacity-80 ${oClass}`}>
                                <h4 className={`font-bold text-sm ${txtMain}`}>{o.nombre}</h4>
                                <p className={`text-xs mt-1 ${txtMuted}`}>{count} equipos</p>
                              </button>
                            ); 
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {centroActual && vista === 'oficinas' && (
          <div>
            <button onClick={handleVolver} className={`flex items-center font-bold mb-4 ${txtDark}`}><ArrowLeft size={20} /> Volver al Dashboard</button>
            <div className={`p-4 rounded-xl mb-4 ${cardBg}`}>
              <div className='flex justify-between items-center mb-4'>
                <h2 className={`font-bold text-lg flex items-center gap-2 ${txtMain}`}><Layers size={20} /> Pisos de {centros.find(c=>c.id===centroActual)?.nombre}</h2>
                <button onClick={agregarPiso} className={`px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-sm ${btnPrimary}`}><Plus size={18} /> Nuevo Piso</button>
              </div>
              {pisosCentroActual.length === 0 ? <p className={`text-center py-4 text-sm ${txtMuted}`}>No hay pisos creados.</p> : (
                <div className='flex flex-wrap gap-2'>
                  {pisosCentroActual.map((p, index) => { 
                    const colorPiso = COLORES_ITEMS[index % COLORES_ITEMS.length]; 
                    const cClass = darkMode ? `${colorPiso.bordeN} ${colorPiso.fondoN}` : `${colorPiso.borde} ${colorPiso.fondo}`; 
                    return (
                      <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cClass}`}>
                        <span className={`font-bold text-sm ${darkMode ? colorPiso.textoN : 'text-gray-700'}`}>Piso {p}</span>
                        <button onClick={() => editarPiso(p)} className={txtDark}><Edit3 size={14} /></button>
                        <button onClick={() => eliminarPiso(p)} className='text-red-500'><Trash2 size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className={`p-4 rounded-xl ${cardBg}`}>
              <div className='flex justify-between items-center mb-4'>
                <h2 className={`font-bold text-lg ${txtMain}`}>Oficinas de {centros.find(c=>c.id===centroActual)?.nombre}</h2>
                <button onClick={agregarOficina} className={`px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-sm ${btnPrimary}`}><Plus size={18} /> Nueva Oficina</button>
              </div>
              {oficinasCentro.length === 0 ? <p className={`text-center py-8 text-sm ${txtMuted}`}>Aun no hay oficinas creadas.</p> : (
                <div className='space-y-3'>
                  {oficinasCentro.map((o, index) => { 
                    const colorOficina = COLORES_ITEMS[index % COLORES_ITEMS.length]; 
                    const cClass = darkMode ? `${colorOficina.bordeN} ${colorOficina.fondoN}` : `${colorOficina.borde} ${colorOficina.fondo}`; 
                    return (
                      <div key={o.id} className={`flex justify-between items-center p-4 rounded-lg border ${cClass}`}>
                        <div>
                          <p className={`font-bold ${txtMain}`}>{index + 1}. {o.nombre}</p>
                          <p className={`text-xs ${txtMuted}`}>{datosCentro.filter(a => a.oficina === o.nombre).length} equipos | Piso: {o.piso || 'N/A'}</p>
                        </div>
                        <div className='flex gap-2'>
                          <button onClick={() => editarOficina(o.id, o.nombre)} className={`px-3 py-2 rounded-lg text-sm font-bold ${btnSecondary}`}>Editar</button>
                          <button onClick={() => eliminarOficina(o.id, o.nombre)} className={`px-3 py-2 rounded-lg text-sm font-bold ${btnDanger}`}>Borrar</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {centroActual && vista === 'lista' && (
          <div>
            {(estadoFiltro || oficinaFiltro) && (
              <div className={`p-3 rounded-xl mb-4 flex justify-between items-center border ${darkMode ? 'bg-fuchsia-950/50 border-fuchsia-500' : 'bg-blue-50 border-blue-200'}`}>
                <div>
                  <p className={`text-xs font-bold ${darkMode ? 'text-fuchsia-400' : 'text-blue-600'}`}>FILTRANDO POR:</p>
                  <p className={`text-sm font-bold ${txtMain}`}>{estadoFiltro ? 'Estado: ' + estadoFiltro : 'Oficina: ' + oficinaFiltro} {pisoFiltro && pisoFiltro !== 'Todos' ? '| Piso: ' + pisoFiltro : ''}</p>
                </div>
                <button onClick={() => { setEstadoFiltro(null); setOficinaFiltro(null); setPisoFiltro('Todos'); setBusqueda(''); setSubtipoFiltro('Todos'); }} className={`font-bold text-sm ${btnDanger}`}>LIMPIAR</button>
              </div>
            )}
            <div className='flex gap-2 mb-4 overflow-x-auto pb-2'>
              <button onClick={() => setSubtipoFiltro('Todos')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subtipoFiltro === 'Todos' ? (darkMode ? 'bg-fuchsia-600 text-white' : 'bg-gray-800 text-white') : (darkMode ? 'bg-black border border-cyan-500 text-cyan-300' : 'bg-white border border-gray-300 text-gray-600')}`}>Todos</button>
              {categoriaVista === 'computo' ? (TIPOS_COMPUTO.map(s => (<button key={s} onClick={() => setSubtipoFiltro(s)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subtipoFiltro === s ? (darkMode ? 'bg-fuchsia-600 text-white' : 'bg-blue-600 text-white') : (darkMode ? 'bg-black border border-cyan-500 text-cyan-300' : 'bg-white border border-gray-300 text-gray-600')}`}>{s}</button>))) : (TIPOS_RED.map(s => (<button key={s} onClick={() => setSubtipoFiltro(s)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subtipoFiltro === s ? (darkMode ? 'bg-fuchsia-600 text-white' : 'bg-blue-600 text-white') : (darkMode ? 'bg-black border border-cyan-500 text-cyan-300' : 'bg-white border border-gray-300 text-gray-600')}`}>{s}</button>)))}
            </div>
            <div className='flex gap-2 mb-4'>
              <div className='flex-1 relative'>
                <Search className={`absolute left-3 top-3.5 ${txtMuted}`} size={18} />
                <input placeholder='Buscar equipo...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className={`w-full pl-10 pr-4 py-3 rounded-xl ${inputClass}`} />
              </div>
              <button onClick={limpiarFormulario} className={`px-4 rounded-xl flex items-center gap-2 ${btnPrimary}`}><Plus size={20} /> Nuevo</button>
            </div>
            <div className='space-y-3'>
              {activosFiltrados.length === 0 ? <p className={`text-center mt-10 ${txtMuted}`}>Sin activos.</p> : 
              activosFiltrados.map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('detalles'); }} className={`p-4 rounded-xl border-l-4 ${darkMode ? 'border-fuchsia-500' : 'border-blue-400'} active:opacity-80 ${cardBg}`}>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className={`text-xs font-bold ${txtDark}`}>Nro. {a.numero}</p>
                      <h3 className={`font-bold ${txtMain}`}>{a.nombreEquipo || (a.marcaCPU || a.marca) + ' ' + (a.modeloCPU || a.modelo)}</h3>
                      <p className={`text-sm ${txtMuted}`}>{a.tipo} {a.subtipoImpresora ? '- '+a.subtipoImpresora : ''}</p>
                    </div>
                    <div className='text-right'>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.estado}</span>
                    </div>
                  </div>
                  <div className={`mt-2 text-sm border-t pt-2 flex justify-between ${txtMuted}`}>
                    <span>{a.personaAsignada ? 'Asignado: ' + a.personaAsignada : 'En Stock'}</span>
                    <span>{a.oficina || '-'} {a.piso ? '- Piso ' + a.piso : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vista === 'detalles' && editando && (
          <div className={`p-4 rounded-xl space-y-4 ${cardBg}`}>
            <div className={`flex justify-between items-center border-b pb-2 ${darkMode ? 'border-fuchsia-500' : 'border-gray-200'}`}>
              <h2 className={`font-bold text-lg ${txtMain}`}>Ficha del Activo</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${darkMode ? 'bg-fuchsia-900 text-fuchsia-300' : 'bg-blue-100 text-blue-800'}`}>Nro. {editando.numero}</span>
            </div>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div><p className={`text-xs ${txtMuted}`}>Tipo</p><p className={`font-bold ${txtMain}`}>{editando.tipo || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Nombre Equipo</p><p className={`font-bold ${txtMain}`}>{editando.nombreEquipo || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Marca</p><p className={`font-bold ${txtMain}`}>{editando.marca || editando.marcaCPU || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Modelo</p><p className={`font-bold ${txtMain}`}>{editando.modelo || editando.modeloCPU || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Código AF</p><p className={`font-bold ${txtMain}`}>{editando.codigoActivo || editando.codigoActivoCPU || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Serie</p><p className={`font-bold ${txtMain}`}>{editando.numeroSerie || editando.numeroSerieCPU || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Procesador</p><p className={`font-bold ${txtMain}`}>{editando.procesador || '-'} {editando.generacion ? '('+editando.generacion+')' : ''}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>RAM</p><p className={`font-bold ${txtMain}`}>{editando.ram || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Disco 1</p><p className={`font-bold ${txtMain}`}>{editando.tipoDisco} {editando.capacidadDisco}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Disco 2</p><p className={`font-bold ${txtMain}`}>{editando.tipoDisco2} {editando.capacidadDisco2}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>Estado</p><p className={`font-bold ${txtMain}`}>{editando.estado || '-'}</p></div>
              <div><p className={`text-xs ${txtMuted}`}>En Almacén</p><p className={`font-bold ${txtMain}`}>{editando.enAlmacen ? 'SÍ' : 'NO'}</p></div>
            </div>
            {!editando.enAlmacen && (
              <div className={`p-3 rounded-lg space-y-1 text-sm ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
                <h3 className={`font-bold border-b pb-1 mb-2 ${txtMain}`}>Ubicación y Asignación</h3>
                <p className={txtMain}><span className={txtMuted}>Oficina:</span> {editando.oficina || '-'} (Piso {editando.piso || '-'})</p>
                <p className={txtMain}><span className={txtMuted}>Asignado a:</span> {editando.personaAsignada || '-'}</p>
                <p className={txtMain}><span className={txtMuted}>Cargo:</span> {editando.cargo || '-'}</p>
                <p className={txtMain}><span className={txtMuted}>Fecha:</span> {editando.fechaAsignacion || '-'}</p>
              </div>
            )}
            
            {/* SECCIÓN QR */}
            <div className='flex flex-col items-center gap-3 pt-4'>
              <div id='qr-detalles-canvas' className='p-4 bg-white rounded-lg'>
                <QRCodeCanvas value={generarDatosQR(editando)} size={180} level='M' />
              </div>
              <button onClick={() => compartirQR(editando)} className={`w-full p-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm ${btnSecondary}`}><Share2 size={18} /> Compartir QR</button>
            </div>

            {(editando.fotoEquipo || editando.fotoSerie) && (
              <div className='grid grid-cols-2 gap-4'>
                {editando.fotoEquipo && <div><p className={`text-xs mb-1 ${txtMuted}`}>Foto Equipo</p><img src={editando.fotoEquipo} className='w-full h-32 object-cover rounded-lg border' /></div>}
                {editando.fotoSerie && <div><p className={`text-xs mb-1 ${txtMuted}`}>Foto Serie</p><img src={editando.fotoSerie} className='w-full h-32 object-cover rounded-lg border' /></div>}
              </div>
            )}
            
            {/* SECCIÓN HISTORIAL */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
              <h3 className={`font-bold border-b pb-1 mb-2 text-sm ${txtMain}`}>Bitácora / Historial</h3>
              <div className='space-y-2 max-h-40 overflow-y-auto'>
                {(editando.historial || []).length === 0 ? <p className={`text-xs text-center py-2 ${txtMuted}`}>Sin movimientos.</p> : 
                (editando.historial || []).slice().reverse().map((h, i) => (
                  <div key={i} className={`text-xs p-2 rounded border-l-4 ${darkMode ? 'bg-gray-900 border-fuchsia-500' : 'bg-white border-blue-400'}`}>
                    <p className={`font-bold ${txtMuted}`}>[{h.fecha}]</p>
                    <p className={`${txtMain} mt-1`}>{h.nota}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className='flex gap-3 pt-2'>
              <button onClick={() => setVista('formulario')} className={`flex-1 p-3 rounded-lg font-bold flex items-center justify-center gap-2 ${btnPrimary}`}><Edit3 size={20} /> Editar Equipo</button>
              <button onClick={handleVolver} className={`p-3 rounded-lg font-bold ${btnSecondary}`}><ArrowLeft size={20} /></button>
            </div>
          </div>
        )}

        {centroActual && vista === 'reporte' && (
          <div className='space-y-4'>
            <div className={`p-4 rounded-xl ${cardBg}`}>
              <h2 className={`font-bold mb-3 ${txtMain}`}>1. Selecciona Equipos:</h2>
              <div className='grid grid-cols-2 gap-2'>
                {SUBTIPOS_REPORTE.map(cat => {
                  const isChecked = catsReporte.includes(cat);
                  const activeClass = darkMode ? 'bg-fuchsia-900/50 border-fuchsia-500 text-fuchsia-300' : 'bg-indigo-50 border-indigo-500 text-indigo-800';
                  const inactiveClass = darkMode ? 'bg-black border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200';
                  return (
                    <label key={cat} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${isChecked ? activeClass : inactiveClass}`}>
                      <input type='checkbox' checked={isChecked} onChange={() => handleCatReporte(cat)} className='accent-fuchsia-500' />
                      {cat}
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className={`p-4 rounded-xl space-y-3 ${cardBg}`}>
              <h2 className={`font-bold ${txtMain}`}>2. Columnas (Toca para desplegar):</h2>
              {catsReporte.length === 0 ? <p className={`text-sm text-center py-4 ${txtMuted}`}>Primero selecciona un equipo arriba.</p> : catsReporte.map(cat => {
                const cols = reporteCols[cat] || [];
                const camposDisponibles = CAMPOS_POR_TIPO[cat] || [];
                const expClass = darkMode ? 'bg-black border-fuchsia-500/30' : 'bg-gray-50 border-gray-100';
                return (
                  <div key={cat} className={`rounded-xl overflow-hidden border ${expClass}`}>
                    <button type='button' onClick={() => setReporteExpandido(reporteExpandido === cat ? null : cat)} className={`w-full p-3 flex justify-between items-center font-bold active:opacity-80 ${txtMain}`}>
                      <span>{cat} <span className={`text-xs font-normal ${txtMuted}`}>({cols.length} cols)</span></span>
                      <ChevronDown size={18} className={txtMuted + (reporteExpandido === cat ? ' rotate-180 transition-transform' : ' transition-transform')} />
                    </button>
                    {reporteExpandido === cat && (
                      <div className='p-3 pt-0'>
                        <div className='flex justify-end gap-1 mb-2'>
                          <button type='button' onClick={() => selectAllCols(cat)} className={`text-xs px-2 py-1 rounded font-bold ${btnSecondary}`}>Todos</button>
                          <button type='button' onClick={() => clearCols(cat)} className={`text-xs px-2 py-1 rounded font-bold ${btnDanger}`}>Limpiar</button>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          {camposDisponibles.map((key, idx) => { 
                            const isSelected = cols.includes(key); 
                            const label = CAMPOS.find(c => c.key === key)?.label || key; 
                            const colorClass = COLORES_CHECKS[idx % COLORES_CHECKS.length]; 
                            const selClass = darkMode ? `bg-gray-900 border-fuchsia-500 font-bold ${colorClass}` : `bg-white border-gray-300 font-bold ${colorClass}`;
                            const unselClass = darkMode ? 'bg-black border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500';
                            return (
                              <label key={key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-all ${isSelected ? selClass : unselClass}`}>
                                <input type='checkbox' checked={isSelected} onChange={() => handleCheckCol(cat, key)} className='w-4 h-4 accent-fuchsia-500' />
                                <span className='flex-1 truncate'>{label}</span>
                              </label>
                            ); 
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {catsReporte.length > 0 && catsReporte.some(cat => (reporteCols[cat] || []).length > 0) && (
              <div className={`p-4 rounded-xl overflow-x-auto ${cardBg}`}>
                <h3 className={`font-bold mb-3 text-sm ${txtMain}`}>Vista Previa:</h3>
                {catsReporte.map(cat => { 
                  const datosCat = activos.filter(a => a.centro === centroActual && !a.enAlmacen && getSubtipo(a) === cat); 
                  const cols = reporteCols[cat] || []; 
                  if (datosCat.length === 0 || cols.length === 0) return null; 
                  return (
                    <div key={cat} className='mb-6'>
                      <h4 className={`font-bold text-sm mb-2 border-b pb-1 ${txtDark}`}>{cat} ({datosCat.length})</h4>
                      <table className='w-full text-xs text-left border-collapse'>
                        <thead>
                          <tr className={darkMode ? 'bg-fuchsia-900/50 text-fuchsia-300' : 'bg-blue-800 text-white'}>
                            {cols.map(k => <th key={k} className='p-2 border whitespace-nowrap'>{CAMPOS.find(c=>c.key===k)?.label || k}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {datosCat.slice(0, 3).map((a, i) => (
                            <tr key={a.id} className={darkMode ? (i % 2 === 0 ? 'bg-black' : 'bg-gray-900') : (i % 2 === 0 ? 'bg-gray-50' : 'bg-white')}>
                              {cols.map(k => <td key={k} className={`p-2 border whitespace-nowrap ${txtMain}`}>{getValor(a, k)}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {datosCat.length > 3 && <p className={`text-center text-xs mt-1 ${txtMuted}`}>+ {datosCat.length - 3} registros más...</p>}
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className='grid grid-cols-2 gap-4'>
              <button onClick={exportarCSV} disabled={cargando || catsReporte.length === 0} className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 ${btnSecondary}`}><Download size={20} /> Excel</button>
              <button onClick={exportarPDF} disabled={cargando || catsReporte.length === 0} className={`p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 ${btnDanger}`}><FileText size={20} /> PDF</button>
            </div>
          </div>
        )}

        {vista === 'formulario' && <FormularioActivo activo={editando} guardarDatos={guardarDatos} setVista={setVista} handleVolver={handleVolver} getNextNumber={getNextNumber} centroActual={centroActual} categoriaVista={categoriaVista} oficinas={oficinas} centros={centros} setMsg={setMsg} guardarArchivoNativo={guardarArchivoNativo} escanearParaCampo={escanearParaCampo} activos={activos} darkMode={darkMode} txtMain={txtMain} txtMuted={txtMuted} txtDark={txtDark} btnPrimary={btnPrimary} btnSecondary={btnSecondary} btnDanger={btnDanger} cardBg={cardBg} inputClass={inputClass} />}
        {vista === 'config' && <ConfigVista setVista={setVista} setMsg={setMsg} setActivos={setActivos} setCentros={setCentros} setOficinas={setOficinas} setPisos={setPisos} setCustomPass={setCustomPass} setLogo={setLogo} guardarArchivoNativo={guardarArchivoNativo} darkMode={darkMode} txtMain={txtMain} txtMuted={txtMuted} txtDark={txtDark} btnPrimary={btnPrimary} btnSecondary={btnSecondary} btnDanger={btnDanger} cardBg={cardBg} inputClass={inputClass} />}
      </div>
    </div>
  );
}

function ConfigVista({ setVista, setMsg, setActivos, setCentros, setOficinas, setPisos, setCustomPass, setLogo, guardarArchivoNativo, darkMode, txtMain, txtMuted, txtDark, btnPrimary, btnSecondary, btnDanger, cardBg, inputClass }) {
  const [nueva, setNueva] = useState('');
  const h = (e) => { e.preventDefault(); if (nueva.length < 4) { alert('Minimo 4 caracteres'); return; } setCustomPass(nueva); localStorage.setItem('app_pass_v74', nueva); setMsg('Contrasena actualizada'); setTimeout(() => setMsg(''), 3000); setVista('hub'); };
  const handleLogo = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { const base64 = event.target.result; localStorage.setItem('logo_empresa_v74', base64); setLogo(base64); setMsg('Logo actualizado'); setTimeout(() => setMsg(''), 3000); }; reader.readAsDataURL(file); };
  const exportarRespaldo = () => { const respaldo = { activos: JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'), centros: JSON.parse(localStorage.getItem('mis_centros_v74') || '[]'), oficinas: JSON.parse(localStorage.getItem('mis_oficinas_v74') || '{}'), pisos: JSON.parse(localStorage.getItem('mis_pisos_v74') || '{}'), pass: localStorage.getItem('app_pass_v74'), logo: localStorage.getItem('logo_empresa_v74') }; const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' }); guardarArchivoNativo(blob, 'respaldo_activos.json'); };
  const importarRespaldo = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = JSON.parse(event.target.result); if (data.activos) { localStorage.setItem('activos_fijos_v74', JSON.stringify(data.activos)); setActivos(data.activos); } if (data.centros) { localStorage.setItem('mis_centros_v74', JSON.stringify(data.centros)); setCentros(data.centros); } if (data.oficinas) { localStorage.setItem('mis_oficinas_v74', JSON.stringify(data.oficinas)); setOficinas(data.oficinas); } if (data.pisos) { localStorage.setItem('mis_pisos_v74', JSON.stringify(data.pisos)); setPisos(data.pisos); } if (data.pass) { localStorage.setItem('app_pass_v74', data.pass); setCustomPass(data.pass); } if (data.logo) { localStorage.setItem('logo_empresa_v74', data.logo); setLogo(data.logo); } setMsg('Respaldo restaurado'); setTimeout(()=>setMsg(''), 3000); setVista('hub'); } catch (err) { alert('Error: Archivo invalido.'); } }; reader.readAsText(file); };
  return (
    <div className={`p-6 rounded-xl space-y-6 ${cardBg}`}>
      <button onClick={() => setVista('hub')} className={`flex items-center font-bold mb-2 ${txtDark}`}><ArrowLeft size={20} /> Volver</button>
      <div className='border-b pb-6'>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${txtMain}`}><ImageIcon size={24} /> Logo de Empresa</h2>
        <label className={`p-6 rounded-xl font-bold flex flex-col items-center gap-2 cursor-pointer border-2 border-dashed ${darkMode ? 'border-fuchsia-500 text-fuchsia-300' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
          <Upload size={32} /><span>Seleccionar Logo</span>
          <input type='file' accept='image/*' onChange={handleLogo} className='hidden' />
        </label>
      </div>
      <div>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${txtMain}`}><Key size={24} /> Cambiar Contrasena</h2>
        <form onSubmit={h} className='space-y-4'>
          <input type='password' value={nueva} onChange={e => setNueva(e.target.value)} required className={`w-full p-3 border rounded-lg ${inputClass}`} placeholder='Nueva contrasena' />
          <button type='submit' className={`w-full p-3 rounded-lg font-bold ${btnPrimary}`}>Guardar</button>
        </form>
      </div>
      <div className='border-t pt-6'>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${txtMain}`}><Save size={24} /> Respaldo de Datos</h2>
        <div className='grid grid-cols-2 gap-4'>
          <button onClick={exportarRespaldo} className={`p-4 rounded-xl font-bold flex flex-col items-center gap-2 ${btnSecondary}`}><Download size={24} /> Exportar</button>
          <label className={`p-4 rounded-xl font-bold flex flex-col items-center gap-2 cursor-pointer ${btnDanger}`}>
            <Upload size={24} /> Importar
            <input type='file' accept='.json' onChange={importarRespaldo} className='hidden' />
          </label>
        </div>
      </div>
    </div>
  );
}

function FormularioActivo({ activo, guardarDatos, setVista, handleVolver, getNextNumber, centroActual, categoriaVista, oficinas, centros, setMsg, guardarArchivoNativo, escanearParaCampo, activos, darkMode, txtMain, txtMuted, txtDark, btnPrimary, btnSecondary, btnDanger, cardBg, inputClass }) {
  const esAlmacen = !centroActual; 
  const opcionesTipo = esAlmacen ? [...TIPOS_COMPUTO, ...TIPOS_RED] : (categoriaVista === 'red' ? TIPOS_RED : TIPOS_COMPUTO);
  const tipoDefault = categoriaVista === 'red' ? 'Impresora' : 'Laptop';
  const initialForm = activo && !activo._template ? activo : { id: Date.now().toString(), centro: centroActual, numero: getNextNumber(), tipo: tipoDefault, subtipoImpresora: 'Impresora Normal', nombreEquipo: '', marca: '', modelo: '', codigoActivo: '', numeroSerie: '', procesador: '', generacion: '', ram: '', tipoDisco: 'SSD M.2', capacidadDisco: '', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: '', mac: '', ip: '', estado: 'Activo', enAlmacen: esAlmacen, oficina: activo?.oficina || '', piso: activo?.piso || '', cargo: '', numeroEmpleado: '', personaAsignada: '', nombreResponsable: '', fechaAsignacion: '', marcaCPU: '', modeloCPU: '', codigoActivoCPU: '', numeroSerieCPU: '', marcaMonitor: '', modeloMonitor: '', codigoActivoMonitor: '', numeroSerieMonitor: '', conexionImpresora: 'En Red', notas: '', fotoEquipo: '', fotoSerie: '', historial: [] };
  const [form, setForm] = useState(initialForm);
  const [verBitacora, setVerBitacora] = useState(false);
  const [errores, setErrores] = useState({});
  const oficinasDestino = oficinas[form.centro] || [];

  const validarUnico = (campo, valor) => {
    if (!valor) { setErrores(prev => { const n = {...prev}; delete n[campo]; return n; }); return true; }
    const existe = activos.some(a => a.id !== form.id && a[campo] === valor);
    if (existe) { setErrores(prev => ({ ...prev, [campo]: true })); setMsg('¡Atención! Este código/serie ya existe.'); setTimeout(()=>setMsg(''), 3000); } 
    else { setErrores(prev => { const n = {...prev}; delete n[campo]; return n; }); }
  };
  const h = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    let newForm = { ...form, [e.target.name]: val };
    if (e.target.name === 'oficina') { const o = oficinasDestino.find(o => o.nombre === val); if (o) newForm.piso = o.piso || ''; }
    if (e.target.name === 'enAlmacen' && val === true) { newForm = { ...newForm, personaAsignada: '', cargo: '', numeroEmpleado: '', nombreResponsable: '', oficina: '', piso: '', fechaAsignacion: '' }; setMsg('Enviado a Almacén.'); setTimeout(()=>setMsg(''), 3000); }
    setForm(newForm);
  };
  const handleMarca = (e) => { const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); setForm({ ...form, [e.target.name]: val }); };
  const handleNumeric = (e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); setForm({ ...form, [e.target.name]: val }); };
  const handleIP = (e) => { const val = e.target.value.replace(/[^0-9.]/g, ''); setForm({ ...form, ip: val }); if (val) { const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/; setErrores(prev => ({ ...prev, ip: !ipRegex.test(val) })); } else { setErrores(prev => { const n = {...prev}; delete n.ip; return n; }); } };
  const parseGeneracion = (procesador) => {
    if (!procesador) return '';
    const limpio = procesador.toLowerCase().replace(/\s+/g, '');
    const matchIntel = limpio.match(/i\d+-(\d{3,5})/);
    if (matchIntel) { const numStr = matchIntel[1]; const firstTwo = parseInt(numStr.substring(0, 2)); let genNum; if (firstTwo >= 10 && firstTwo <= 14) genNum = firstTwo; else genNum = parseInt(numStr[0]); const ordinales = ['', '1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na', '10ma', '11va', '12va', '13va', '14va']; return ordinales[genNum] || `${genNum}va`; }
    const matchRyzen = limpio.match(/ryzen\d*(\d{4})/);
    if (matchRyzen) { const numStr = matchRyzen[1]; const firstTwo = parseInt(numStr.substring(0, 2)); let genNum; if (firstTwo >= 10 && firstTwo <= 14) genNum = firstTwo; else genNum = parseInt(numStr[0]); const ordinales = ['', '1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na', '10ma', '11va', '12va', '13va', '14va']; return ordinales[genNum] || `${genNum}va`; }
    return '';
  };
  const handleProcesador = (e) => setForm({ ...form, procesador: e.target.value, generacion: parseGeneracion(e.target.value) });
  const formatMemory = (campo) => { let val = (form[campo] || '').toString().trim(); if (!val) return; const num = parseFloat(val.replace(/[^0-9.]/g, '')); if (!isNaN(num) && num > 0) { if (num >= 1000) setForm({ ...form, [campo]: `${(num / 1000).toFixed(1).replace('.0', '')} TB` }); else setForm({ ...form, [campo]: `${num} GB` }); } };
  const tomarFoto = async (campo) => { try { const image = await Camera.getPhoto({ quality: 30, allowEditing: false, resultType: CameraResultType.Base64, source: CameraSource.Camera }); setForm({ ...form, [campo]: 'data:image/jpeg;base64,' + image.base64String }); setMsg('Foto capturada'); setTimeout(()=>setMsg(''), 2000); } catch (e) { setMsg('Cancelado'); setTimeout(()=>setMsg(''), 2000); } };
  const eliminarFoto = (campo) => { setForm({ ...form, [campo]: '' }); setMsg('Foto eliminada'); setTimeout(()=>setMsg(''), 1500); };
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    const camposAValidar = ['codigoActivo', 'numeroSerie', 'codigoActivoCPU', 'numeroSerieCPU', 'numeroSerieMonitor'];
    for (const c of camposAValidar) { if (form[c] && activos.some(a => a.id !== form.id && a[c] === form[c])) { setErrores(prev => ({ ...prev, [c]: true })); alert('No se puede guardar. Hay códigos o series repetidas.'); return; } }
    const datos = JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'); 
    let f = { ...form }; delete f._template; const hoy = new Date().toLocaleDateString();
    if (activo && !activo._template) { let logs = []; if (activo.personaAsignada !== f.personaAsignada && f.personaAsignada) logs.push('Asignado a ' + f.personaAsignada); if (activo.estado !== f.estado) logs.push('Estado: ' + f.estado); if (activo.oficina !== f.oficina && f.oficina) logs.push('Oficina: ' + f.oficina); if (activo.enAlmacen !== f.enAlmacen) logs.push(f.enAlmacen ? 'Enviado a Almacén' : 'Sacado de Almacén'); if (logs.length > 0) f.historial = [...(activo.historial || []), ...logs.map(n => ({ fecha: hoy, nota: n }))]; guardarDatos(datos.map(a => a.id === activo.id ? f : a)); } 
    else { f.historial = [{ fecha: hoy, nota: 'Equipo registrado' }]; guardarDatos([...datos, f]); }
    handleVolver(); 
  };
  const handleEliminar = () => { if (confirm('Eliminar?')) { const d = JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'); guardarDatos(d.filter(a => a.id !== form.id)); handleVolver(); } };

  const OficinaSelect = ({ req }) => (
    <div>
      <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Oficina</label>
      <select name='oficina' value={form.oficina||''} onChange={h} required={req} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`}>
        <option value='' disabled>Seleccionar...</option>
        {oficinasDestino.map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}
      </select>
    </div>
  );
  const PisoInput = ({ req }) => (
    <div>
      <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Piso</label>
      <input name='piso' value={form.piso||''} readOnly className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} cursor-not-allowed`} />
    </div>
  );
  const esTipoRed = ['Impresora', 'Impresora Multifuncional', 'Scanner', 'Switch'].includes(form.tipo);
  const esTipoUnificado = ['Laptop', 'Computadora All in One'].includes(form.tipo);

  return (
    <div>
      <button onClick={handleVolver} className={`flex items-center font-bold mb-4 ${txtDark}`}><ArrowLeft size={20} /> Volver</button>
      <form onSubmit={handleSubmit} className={`p-4 rounded-xl space-y-4 ${cardBg}`}>
        <h2 className={`font-bold text-lg border-b pb-2 ${txtMain}`}>{activo && !activo._template ? 'Editar Nro. ' + form.numero : 'Nuevo Registro'}</h2>
        {esAlmacen && !form.enAlmacen && (
          <div className={`p-3 rounded-lg border-l-4 ${darkMode ? 'bg-fuchsia-950/30 border-fuchsia-500' : 'bg-blue-50 border-blue-400'}`}>
            <label className={`block text-xs font-bold mb-1 ${txtDark}`}>ASIGNAR A MULTICENTRO</label>
            <select name='centro' value={form.centro||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`}>
              <option value='' disabled>Seleccionar...</option>
              {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        )}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className={`block text-xs font-bold mb-1 ${txtMuted}`}>Nro. REGISTRO</label>
            <input name='numero' value={form.numero} readOnly className={`w-full p-3 border rounded-lg font-bold ${inputClass} cursor-not-allowed`} />
          </div>
          <div>
            <label className={`block text-xs font-bold mb-1 ${txtMuted}`}>TIPO EQUIPO</label>
            <select name='tipo' value={form.tipo} onChange={h} className={`w-full p-3 border rounded-lg ${inputClass}`}>
              {opcionesTipo.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {esTipoUnificado && (
          <>
          <div className={`p-3 rounded-lg border-l-4 space-y-3 ${darkMode ? 'bg-fuchsia-950/30 border-fuchsia-500' : 'bg-blue-50 border-blue-400'}`}>
            <p className={`text-xs font-bold ${txtDark}`}>DATOS {form.tipo === 'Laptop' ? 'LAPTOP' : 'ALL IN ONE'}</p>
            <div className='grid grid-cols-2 gap-3'>
              <div className='col-span-2'><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Nombre Maquina</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Marca</label><input name='marca' value={form.marca||''} onChange={handleMarca} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div className='relative'>
                <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Codigo AF</label>
                <div className='flex gap-1'>
                  <input name='codigoActivo' value={form.codigoActivo||''} onChange={h} onBlur={(e)=>validarUnico('codigoActivo', e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.codigoActivo ? 'border-red-500 bg-red-100' : ''}`} />
                  <button type='button' onClick={() => escanearParaCampo('codigoActivo')} className={`px-2 rounded-lg ${btnSecondary}`}><Barcode size={18} /></button>
                </div>
                {errores.codigoActivo && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}
              </div>
              <div className='relative'>
                <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Numero de Serie</label>
                <div className='flex gap-1'>
                  <input name='numeroSerie' value={form.numeroSerie||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerie', e.target.value)} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.numeroSerie ? 'border-red-500 bg-red-100' : ''}`} />
                  <button type='button' onClick={() => escanearParaCampo('numeroSerie')} className={`px-2 rounded-lg ${btnSecondary}`}><Barcode size={18} /></button>
                </div>
                {errores.numeroSerie && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}
              </div>
            </div>
          </div>
          <CamposSpecs form={form} setForm={setForm} handleProcesador={handleProcesador} formatMemory={formatMemory} handleNumeric={handleNumeric} handleIP={handleIP} errores={errores} darkMode={darkMode} txtMain={txtMain} txtMuted={txtMuted} inputClass={inputClass} />
          <CamposUbicacion form={form} h={h} OficinaSelect={OficinaSelect} PisoInput={PisoInput} darkMode={darkMode} txtMain={txtMain} txtMuted={txtMuted} inputClass={inputClass} />
          </>
        )}

        {form.tipo === 'Computadora de Escritorio' && (
          <>
          <div className={`p-3 rounded-lg border-l-4 space-y-3 ${darkMode ? 'bg-fuchsia-950/30 border-fuchsia-500' : 'bg-blue-50 border-blue-400'}`}>
            <p className={`text-xs font-bold ${txtDark}`}>DATOS CPU</p>
            <div className='grid grid-cols-2 gap-3'>
              <div className='col-span-2'><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Nombre Equipo</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Marca CPU</label><input name='marcaCPU' value={form.marcaCPU||''} onChange={handleMarca} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Modelo CPU</label><input name='modeloCPU' value={form.modeloCPU||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div className='relative'>
                <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Codigo AF CPU</label>
                <div className='flex gap-1'>
                  <input name='codigoActivoCPU' value={form.codigoActivoCPU||''} onChange={h} onBlur={(e)=>validarUnico('codigoActivoCPU', e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.codigoActivoCPU ? 'border-red-500 bg-red-100' : ''}`} />
                  <button type='button' onClick={() => escanearParaCampo('codigoActivoCPU')} className={`px-2 rounded-lg ${btnSecondary}`}><Barcode size={18} /></button>
                </div>
                {errores.codigoActivoCPU && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}
              </div>
              <div className='relative'>
                <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Serie CPU</label>
                <div className='flex gap-1'>
                  <input name='numeroSerieCPU' value={form.numeroSerieCPU||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerieCPU', e.target.value)} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.numeroSerieCPU ? 'border-red-500 bg-red-100' : ''}`} />
                  <button type='button' onClick={() => escanearParaCampo('numeroSerieCPU')} className={`px-2 rounded-lg ${btnSecondary}`}><Barcode size={18} /></button>
                </div>
                {errores.numeroSerieCPU && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}
              </div>
            </div>
          </div>
          <div className={`p-3 rounded-lg border-l-4 space-y-3 ${darkMode ? 'bg-yellow-900/30 border-yellow-500' : 'bg-yellow-50 border-yellow-400'}`}>
            <p className={`text-xs font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>DATOS MONITOR</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Marca Monitor</label><input name='marcaMonitor' value={form.marcaMonitor||''} onChange={handleMarca} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Modelo Monitor</label><input name='modeloMonitor' value={form.modeloMonitor||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Serie Monitor</label><input name='numeroSerieMonitor' value={form.numeroSerieMonitor||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerieMonitor', e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.numeroSerieMonitor ? 'border-red-500 bg-red-100' : ''}`} />{errores.numeroSerieMonitor && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Codigo AF Monitor</label><input name='codigoActivoMonitor' value={form.codigoActivoMonitor||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
            </div>
          </div>
          <CamposSpecs form={form} setForm={setForm} handleProcesador={handleProcesador} formatMemory={formatMemory} handleNumeric={handleNumeric} handleIP={handleIP} errores={errores} darkMode={darkMode} txtMain={txtMain} txtMuted={txtMuted} inputClass={inputClass} />
          <CamposUbicacion form={form} h={h} OficinaSelect={OficinaSelect} PisoInput={PisoInput} darkMode={darkMode} txtMain={txtMain} txtMuted={txtMuted} inputClass={inputClass} />
          </>
        )}

        {esTipoRed && (
          <div className={`p-3 rounded-lg border-l-4 space-y-3 ${darkMode ? 'bg-orange-900/30 border-orange-500' : 'bg-orange-50 border-orange-400'}`}>
            <p className={`text-xs font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>DATOS {form.tipo.toUpperCase()}</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Estado</label><select name='estado' value={form.estado} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`}><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Marca</label><input name='marca' value={form.marca||''} onChange={handleMarca} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
              <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerie', e.target.value)} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.numeroSerie ? 'border-red-500 bg-red-100' : ''}`} />{errores.numeroSerie && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              <div className='relative'>
                <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Codigo AF</label>
                <div className='flex gap-1'>
                  <input name='codigoActivo' value={form.codigoActivo||''} onChange={h} onBlur={(e)=>validarUnico('codigoActivo', e.target.value)} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.codigoActivo ? 'border-red-500 bg-red-100' : ''}`} />
                  <button type='button' onClick={() => escanearParaCampo('codigoActivo')} className={`px-2 rounded-lg ${btnSecondary}`}><Barcode size={18} /></button>
                </div>
                {errores.codigoActivo && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}
              </div>
              {form.tipo !== 'Switch' && <div className='col-span-2'><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Conexion</label><select name='conexionImpresora' value={form.conexionImpresora||'En Red'} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`}><option>En Red</option><option>Por USB</option></select></div>}
              {(form.tipo === 'Switch' || form.conexionImpresora === 'En Red') && (
                <>
                  <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>MAC</label><input name='mac' value={form.mac||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
                  <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>IP</label><input name='ip' value={form.ip||''} onChange={handleIP} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.ip ? 'border-red-500 bg-red-100' : ''}`} />{errores.ip && <p className='text-xs text-red-500 mt-1'>IP inválida</p>}</div>
                </>
              )}
              <OficinaSelect req={true} /><PisoInput req={true} />
              <div className='col-span-2'><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Fecha Asignacion</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
            </div>
          </div>
        )}

        <div>
          <label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Notas</label>
          <textarea name='notas' value={form.notas||''} onChange={h} rows='2' className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} placeholder='Observaciones...'></textarea>
        </div>
        
        <div className={`p-3 rounded-lg border space-y-3 ${darkMode ? 'bg-black border-fuchsia-500/30' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-xs font-bold ${darkMode ? 'text-fuchsia-400' : 'text-gray-600'}`}>EVIDENCIA FOTOGRÁFICA (OPCIONAL)</p>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              {form.fotoEquipo ? (
                <div className='relative'>
                  <img src={form.fotoEquipo} alt='Foto Equipo' className='w-full h-32 object-cover rounded-lg border' />
                  <button type='button' onClick={() => eliminarFoto('fotoEquipo')} className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md'><X size={14} /></button>
                </div>
              ) : (
                <button type='button' onClick={() => tomarFoto('fotoEquipo')} className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${darkMode ? 'border-fuchsia-500 text-fuchsia-400' : 'border-gray-300 text-gray-400'}`}>
                  <CameraIcon size={24} /><span className='text-xs mt-1 font-bold'>Foto del Equipo</span>
                </button>
              )}
            </div>
            <div className='text-center'>
              {form.fotoSerie ? (
                <div className='relative'>
                  <img src={form.fotoSerie} alt='Foto Serie' className='w-full h-32 object-cover rounded-lg border' />
                  <button type='button' onClick={() => eliminarFoto('fotoSerie')} className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md'><X size={14} /></button>
                </div>
              ) : (
                <button type='button' onClick={() => tomarFoto('fotoSerie')} className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${darkMode ? 'border-cyan-500 text-cyan-400' : 'border-gray-300 text-gray-400'}`}>
                  <CameraIcon size={24} /><span className='text-xs mt-1 font-bold'>Foto N° de Serie</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {activo && !activo._template && (
          <div className={`p-3 rounded-lg border ${darkMode ? 'bg-black border-fuchsia-500/30' : 'bg-gray-50 border-gray-200'}`}>
            <button type='button' onClick={() => setVerBitacora(!verBitacora)} className={`w-full flex justify-between items-center font-bold ${txtMain}`}>
              <span className='flex items-center gap-2'><History size={18} /> Ver Bitácora ({(form.historial || []).length})</span>
              <ChevronDown size={18} className={verBitacora ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {verBitacora && (
              <div className='mt-3 space-y-2 max-h-48 overflow-y-auto'>
                {(form.historial || []).length === 0 ? <p className={`text-xs text-center py-2 ${txtMuted}`}>Sin movimientos.</p> : 
                (form.historial || []).slice().reverse().map((h, i) => (
                  <div key={i} className={`text-xs p-2 rounded border-l-4 ${darkMode ? 'bg-gray-900 border-fuchsia-500' : 'bg-white border-blue-400'}`}>
                    <p className={`font-bold ${txtMuted}`}>[{h.fecha}]</p>
                    <p className={`${txtMain} mt-1`}>{h.nota}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className='flex gap-3 pt-2'>
          <button type='submit' className={`flex-1 p-3 rounded-lg font-bold flex items-center justify-center gap-2 ${btnPrimary}`}><Save size={20} /> Guardar</button>
          {activo && !activo._template && <button type='button' onClick={handleEliminar} className={`p-3 rounded-lg font-bold ${btnDanger}`}><Trash2 size={20} /></button>}
        </div>
      </form>
    </div>
  );
}

function CamposSpecs({ form, setForm, handleProcesador, formatMemory, handleNumeric, handleIP, errores, darkMode, txtMain, txtMuted, inputClass }) {
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className={`p-3 rounded-lg border-l-4 space-y-3 ${darkMode ? 'bg-purple-900/30 border-purple-500' : 'bg-purple-50 border-purple-400'}`}>
      <p className={`text-xs font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>ESPECIFICACIONES</p>
      <div className='grid grid-cols-2 gap-3'>
        <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Procesador</label><input name='procesador' value={form.procesador||''} onChange={handleProcesador} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
        <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Generacion</label><input name='generacion' value={form.generacion||''} readOnly className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} cursor-not-allowed`} /></div>
        <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>RAM</label><input name='ram' value={form.ram||''} onChange={handleNumeric} onBlur={() => formatMemory('ram')} placeholder='Ej: 8' className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
        <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>S.O.</label><input name='sistemaOperativo' value={form.sistemaOperativo||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
        <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>MAC</label><input name='mac' value={form.mac||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
        <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>IP</label><input name='ip' value={form.ip||''} onChange={handleIP} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass} ${errores.ip ? 'border-red-500 bg-red-100' : ''}`} />{errores.ip && <p className='text-xs text-red-500 mt-1'>IP inválida</p>}</div>
      </div>
      <div className={`border-t pt-3 mt-2 grid grid-cols-2 gap-3 ${darkMode ? 'border-purple-500/30' : 'border-purple-200'}`}>
        <div>
          <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>DISCO 1</p>
          <select name='tipoDisco' value={form.tipoDisco||'SSD M.2'} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm mb-1 ${inputClass}`}><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select>
          <input name='capacidadDisco' value={form.capacidadDisco||''} onChange={handleNumeric} onBlur={() => formatMemory('capacidadDisco')} placeholder='Ej: 256' className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} />
        </div>
        <div>
          <p className={`text-xs font-bold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>DISCO 2</p>
          <select name='tipoDisco2' value={form.tipoDisco2||'Ninguno'} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm mb-1 ${inputClass}`}><option>Ninguno</option><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select>
          <input name='capacidadDisco2' value={form.capacidadDisco2||''} onChange={handleNumeric} onBlur={() => formatMemory('capacidadDisco2')} disabled={form.tipoDisco2==='Ninguno'} placeholder='Ej: 512' className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} />
        </div>
      </div>
    </div>
  );
}

function CamposUbicacion({ form, h, OficinaSelect, PisoInput, darkMode, txtMain, txtMuted, inputClass }) {
  return (
    <div className={`p-3 rounded-lg border-l-4 space-y-3 ${darkMode ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-400'}`}>
      <p className={`text-xs font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>UBICACION Y ASIGNACION</p>
      <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer ${darkMode ? 'bg-black border-fuchsia-500/50' : 'bg-white border-indigo-200'}`}>
        <input type='checkbox' name='enAlmacen' checked={form.enAlmacen || false} onChange={h} className='w-5 h-5 accent-fuchsia-500' />
        <div>
          <span className={`font-bold ${darkMode ? 'text-fuchsia-400' : 'text-indigo-700'}`}>Marcar como 'En Almacen'</span>
          <p className={`text-xs ${txtMuted}`}>Quita la asignacion del equipo.</p>
        </div>
      </label>
      {!form.enAlmacen ? (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Estado</label><select name='estado' value={form.estado} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`}><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
          <PisoInput req={true} />
          <OficinaSelect req={true} />
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Nro. Empleado</label><input name='numeroEmpleado' value={form.numeroEmpleado||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Cargo</label><input name='cargo' value={form.cargo||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Persona Asignada</label><input name='personaAsignada' value={form.personaAsignada||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Responsable</label><input name='nombreResponsable' value={form.nombreResponsable||''} onChange={h} required className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
          <div className='col-span-2'><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Fecha Asignacion</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Estado Fisico</label><select name='estado' value={form.estado} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`}><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
          <div><label className={`block text-xs font-medium mb-1 ${txtMuted}`}>Fecha Ingreso</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className={`w-full p-2.5 border rounded-lg text-sm ${inputClass}`} /></div>
        </div>
      )}
    </div>
  );
}
