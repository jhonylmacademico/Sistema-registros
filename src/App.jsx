import { useState, useEffect } from 'react';
import { Monitor, Printer, Network, Laptop, LogOut, Plus, Search, FileText, ShieldCheck, Save, Trash2, ArrowLeft, Download, Key, Building2, Warehouse, Edit3, MapPin, CheckCircle, Upload, ChevronDown, Image as ImageIcon, CheckSquare, Square, Layers, History, Camera as CameraIcon, X, ScanLine, QrCode, Share2, Eye, Barcode } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';

const CENTROS_DEFAULT = [
  { id: 'sucre', nombre: 'Multicentro Sucre' },
  { id: 'americas', nombre: 'Multicentro Las Americas' },
  { id: 'victoria', nombre: 'Multicentro Victoria' },
  { id: 'monteagudo', nombre: 'Multicentro Monteagudo' },
  { id: 'camargo', nombre: 'Multicentro Camargo' }
];

const COLORES_CENTROS = [
  { borde: 'border-blue-500', fondo: 'bg-blue-50', texto: 'text-blue-800' },
  { borde: 'border-green-500', fondo: 'bg-green-50', texto: 'text-green-800' },
  { borde: 'border-amber-500', fondo: 'bg-amber-50', texto: 'text-amber-800' },
  { borde: 'border-pink-500', fondo: 'bg-pink-50', texto: 'text-pink-800' },
  { borde: 'border-purple-500', fondo: 'bg-purple-50', texto: 'text-purple-800' },
  { borde: 'border-red-500', fondo: 'bg-red-50', texto: 'text-red-800' },
  { borde: 'border-indigo-500', fondo: 'bg-indigo-50', texto: 'text-indigo-800' },
  { borde: 'border-teal-500', fondo: 'bg-teal-50', texto: 'text-teal-800' }
];

const COLORES_CHECKS = [
  'text-blue-600', 'text-green-600', 'text-amber-600', 'text-pink-600', 
  'text-purple-600', 'text-red-600', 'text-indigo-600', 'text-teal-600',
  'text-orange-600', 'text-cyan-600', 'text-lime-600', 'text-fuchsia-600',
  'text-rose-600', 'text-emerald-600', 'text-violet-600', 'text-sky-600'
];

const TIPOS_COMPUTO = ['Laptop', 'Computadora de Escritorio', 'Computadora All in One'];
const TIPOS_RED = ['Impresora', 'Impresora Multifuncional', 'Scanner', 'Switch'];
const SUBTIPOS_REPORTE = ['Laptop', 'Computadora de Escritorio', 'Computadora All in One', 'Impresora', 'Impresora Multifuncional', 'Scanner', 'Switch'];

const CAMPOS = [
  { key: 'numero', label: 'Nro. Registro' }, { key: 'tipo', label: 'Tipo Equipo' }, { key: 'nombreEquipo', label: 'Nombre Equipo' }, 
  { key: 'marca', label: 'Marca' }, { key: 'modelo', label: 'Modelo' }, { key: 'codigoActivo', label: 'Código AF' }, 
  { key: 'numeroSerie', label: 'Nro. Serie' }, { key: 'procesador', label: 'Procesador' }, { key: 'generacion', label: 'Generación' }, 
  { key: 'ram', label: 'RAM' }, { key: 'tipoDisco', label: 'Disco 1 (Tipo)' }, { key: 'capacidadDisco', label: 'Disco 1 (Cap.)' }, 
  { key: 'tipoDisco2', label: 'Disco 2 (Tipo)' }, { key: 'capacidadDisco2', label: 'Disco 2 (Cap.)' }, 
  { key: 'sistemaOperativo', label: 'Sistema Operativo' }, { key: 'mac', label: 'MAC' }, { key: 'ip', label: 'IP' }, 
  { key: 'estado', label: 'Estado' }, { key: 'enAlmacen', label: 'En Almacén' }, { key: 'centro', label: 'Centro' }, 
  { key: 'oficina', label: 'Oficina' }, { key: 'piso', label: 'Piso' }, { key: 'personaAsignada', label: 'Persona Asignada' }, 
  { key: 'numeroEmpleado', label: 'Nro. Empleado' }, { key: 'cargo', label: 'Cargo' }, { key: 'nombreResponsable', label: 'Responsable' }, 
  { key: 'fechaAsignacion', label: 'Fecha Asignación' }, { key: 'notas', label: 'Notas' }, { key: 'historial', label: 'Historial' }
];

const datosIniciales = [
  { id: '1', centro: 'sucre', numero: '0001', tipo: 'Laptop', nombreEquipo: 'LAP-JPEREZ', marca: 'Lenovo', modelo: 'T14', codigoActivo: 'AF-001', numeroSerie: 'LP-001', procesador: 'Intel i5', generacion: '10ma', ram: '8 GB', tipoDisco: 'SSD M.2', capacidadDisco: '256 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: 'Win 11', mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.10', estado: 'Activo', enAlmacen: false, oficina: 'Contabilidad', piso: '2', cargo: 'Contador', numeroEmpleado: 'EMP-001', personaAsignada: 'Juan Perez', nombreResponsable: 'Juan Perez', fechaAsignacion: '2024-01-15', notas: '', fotoEquipo: '', fotoSerie: '', historial: [{ fecha: '15/01/2024', nota: 'Equipo registrado en el sistema' }] },
  { id: '2', centro: 'sucre', numero: '0002', tipo: 'Impresora Multifuncional', marca: 'HP', modelo: 'MFP', numeroSerie: 'IMP-002', codigoActivo: 'AF-002', conexionImpresora: 'En Red', mac: 'AA:BB:CC:DD:EE:02', ip: '192.168.1.50', estado: 'Activo', enAlmacen: false, oficina: 'Recursos Humanos', piso: '1', fechaAsignacion: '2024-01-10', notas: '', fotoEquipo: '', fotoSerie: '', historial: [{ fecha: '10/01/2024', nota: 'Equipo registrado en el sistema' }] },
  { id: '3', centro: 'sucre', numero: '0003', tipo: 'Laptop', marca: 'Dell', modelo: 'Latitude', procesador: 'Intel i7', ram: '16 GB', tipoDisco: 'SSD M.2', capacidadDisco: '512 GB', tipoDisco2: 'Ninguno', capacidadDisco2: '', estado: 'Danado', enAlmacen: false, oficina: 'Contabilidad', piso: '2', personaAsignada: 'Ana Torres', nombreResponsable: 'Ana Torres', fechaAsignacion: '2024-02-20', notas: 'Pantalla rota', fotoEquipo: '', fotoSerie: '', historial: [{ fecha: '20/02/2024', nota: 'Equipo registrado en el sistema' }] }
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
  const [camposSeleccionados, setCamposSeleccionados] = useState(['numero', 'tipo', 'nombreEquipo', 'procesador', 'ram', 'estado', 'oficina', 'personaAsignada']);
  const [ordenCols, setOrdenCols] = useState({});
  const [catsReporte, setCatsReporte] = useState([...SUBTIPOS_REPORTE]);

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
  const handleLogin = (e) => { e.preventDefault(); if (user === 'admin' && pass === customPass) setIsLoggedIn(true); };
  const getNextNumber = () => { const d = JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'); return (d.reduce((m, a) => Math.max(m, parseInt(a.numero || '0')), 0) + 1).toString().padStart(4, '0'); };
  const agregarCentro = () => { const n = prompt('Nombre del nuevo Multicentro:'); if (n && n.trim()) { const nc = [...centros, { id: n.trim().toLowerCase().replace(/\s+/g, '_'), nombre: n.trim() }]; setCentros(nc); localStorage.setItem('mis_centros_v74', JSON.stringify(nc)); } };
  
  const agregarPiso = () => { 
    const n = prompt(`Nombre del nuevo piso para ${centros.find(c=>c.id===centroActual)?.nombre} (Ej: 1, 2, Sotano):`); 
    if (n && n.trim()) { 
      const pisosCentro = pisos[centroActual] || [];
      if (!pisosCentro.includes(n.trim())) { 
        const nuevosPisos = { ...pisos, [centroActual]: [...pisosCentro, n.trim()] };
        guardarPisos(nuevosPisos); 
        setMsg('Piso agregado'); setTimeout(()=>setMsg(''), 2000); 
      } else { alert('Ese piso ya existe en este centro'); } 
    } 
  };

  const agregarOficina = () => { 
    const n = prompt('Nombre de la nueva oficina:'); 
    if (n && n.trim()) { 
      const pisosCentro = pisos[centroActual] || [];
      let p = '';
      if (pisosCentro.length > 0) {
        p = prompt(`En qué piso está? (Opciones: ${pisosCentro.join(', ')}):`, pisosCentro[0]);
        if (p && !pisosCentro.includes(p)) { alert('Ese piso no existe. Primero créalo en la sección de pisos.'); return; }
      } else {
        alert('Primero crea al menos un piso para este centro.');
        return;
      }
      const act = oficinas[centroActual] || []; 
      const nuevas = [...act, { id: n.trim().toLowerCase().replace(/\s+/g, '_'), nombre: n.trim(), piso: p }]; 
      guardarOficinas({...oficinas, [centroActual]: nuevas}); 
      setMsg('Oficina agregada'); setTimeout(()=>setMsg(''), 2000); 
    } 
  };

  const limpiarFormulario = () => { setEditando(null); setVista('formulario'); };
  
  const getValor = (a, key) => { 
    if (key === 'enAlmacen') return a.enAlmacen ? 'SI' : 'NO'; 
    if (key === 'historial') {
      if (!a.historial || a.historial.length === 0) return 'Sin registros';
      return a.historial.map(h => `[${h.fecha}] ${h.nota}`).join(' \n ');
    }
    if (key === 'centro') return centros.find(c => c.id === a.centro)?.nombre || '-';
    return a[key] || '-'; 
  };
  
  const getSubtipo = (a) => {
    if (a.tipo === 'Impresora') {
      if (a.subtipoImpresora === 'Multifuncional') return 'Impresora Multifuncional';
      if (a.subtipoImpresora === 'Scanner') return 'Scanner';
      return 'Impresora';
    }
    return a.tipo;
  };

  const handleCheck = (key) => {
    setCamposSeleccionados(prev => {
      if (prev.includes(key)) {
        const newOrden = {}; let count = 1;
        prev.filter(k => k !== key).forEach(k => { newOrden[k] = count++; });
        setOrdenCols(newOrden);
        return prev.filter(k => k !== key);
      } else {
        setOrdenCols(prevOrden => ({ ...prevOrden, [key]: prev.length + 1 }));
        return [...prev, key];
      }
    });
  };
  const seleccionarTodosCampos = () => { 
    const todos = CAMPOS.map(c => c.key); setCamposSeleccionados(todos); 
    const newOrden = {}; todos.forEach((k, i) => newOrden[k] = i + 1); setOrdenCols(newOrden);
  };
  const limpiarCampos = () => { setCamposSeleccionados([]); setOrdenCols({}); };
  const handleCatReporte = (cat) => { setCatsReporte(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]); };

  const handleVolver = () => {
    if (vista === 'formulario' || vista === 'detalles') {
      if ((editando && editando.enAlmacen) || !centroActual) setVista('almacen');
      else setVista('lista');
    } else if (vista === 'lista' || vista === 'reporte' || vista === 'oficinas') {
      setVista('dashboard'); setEstadoFiltro(null); setOficinaFiltro(null); setPisoFiltro('Todos'); setBusqueda(''); setSubtipoFiltro('Todos');
    } else if (vista === 'dashboard' || vista === 'almacen' || vista === 'config') {
      setVista('hub'); setCentroActual(null); setPisoExpandido(null);
    }
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
    } catch(e) {
      setMsg('Error al guardar. Intente de nuevo.'); setCargando(false);
    }
    setTimeout(()=>setMsg(''), 4000);
  };

  const exportarCSV = () => {
    const datosCentro = activos.filter(a => a.centro === centroActual && !a.enAlmacen);
    const camposOrdenados = [...camposSeleccionados].sort((a, b) => (ordenCols[a] || 0) - (ordenCols[b] || 0));
    const headers = camposOrdenados.map(k => CAMPOS.find(c=>c.key===k)?.label || k);
    const fechaGen = new Date().toLocaleDateString();
    
    let csv = '\uFEFF' + 'REPORTE DE ACTIVOS FIJOS\nCentro: ' + (centros.find(c=>c.id===centroActual)?.nombre || '') + '\nGenerado el: ' + fechaGen + '\n---------------------------------------------------\n';
    
    catsReporte.forEach(cat => {
      const datosCat = datosCentro.filter(a => getSubtipo(a) === cat);
      if (datosCat.length > 0) {
        csv += '\n=== ' + cat.toUpperCase() + ' ===\n';
        csv += headers.join(';') + '\n';
        datosCat.forEach(a => {
          const row = camposOrdenados.map(k => getValor(a, k));
          csv += row.map(c => '\x22' + String(c).replace(/\x22/g, '\x22\x22') + '\x22').join(';') + '\n';
        });
      }
    });
    
    guardarArchivoNativo(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'Reporte_Activos.csv');
  };

  const COLORES_PDF = {
    'Laptop': [30, 58, 95], 'Computadora de Escritorio': [22, 163, 74], 'Computadora All in One': [217, 119, 6],
    'Impresora': [220, 38, 38], 'Impresora Multifuncional': [147, 51, 234], 'Scanner': [14, 165, 233], 'Switch': [120, 53, 15]
  };

  const exportarPDF = () => {
    const datosCentro = activos.filter(a => a.centro === centroActual && !a.enAlmacen);
    const camposOrdenados = [...camposSeleccionados].sort((a, b) => (ordenCols[a] || 0) - (ordenCols[b] || 0));
    const headers = camposOrdenados.map(k => CAMPOS.find(c=>c.key===k)?.label || k);
    const doc = new jsPDF('l', 'mm', 'a4'); 
    
    if (logo) { try { doc.addImage(logo, 'PNG', 14, 10, 30, 15); } catch (e) {} }
    
    doc.setFontSize(18); doc.setTextColor(30, 58, 95); doc.text('Reporte de Activos Fijos', 50, 18);
    doc.setFontSize(10); doc.setTextColor(100); 
    doc.text('Centro: ' + (centros.find(c=>c.id===centroActual)?.nombre || ''), 50, 24);
    doc.text('Generado: ' + new Date().toLocaleDateString(), 250, 18);
    
    let currentY = 30;
    
    catsReporte.forEach(cat => {
      const datosCat = datosCentro.filter(a => getSubtipo(a) === cat);
      if (datosCat.length > 0) {
        const rows = datosCat.map(a => camposOrdenados.map(k => String(getValor(a, k))));
        
        if (currentY > 160) { doc.addPage(); currentY = 20; }
        
        doc.setFontSize(12); doc.setTextColor(30, 58, 95); 
        doc.text(cat + ' (' + datosCat.length + ' equipos)', 14, currentY);
        currentY += 4;
        
        const color = COLORES_PDF[cat] || [30, 58, 95];
        
        doc.autoTable({ 
          startY: currentY, head: [headers], body: rows, 
          styles: { fontSize: 7, cellPadding: 2, textColor: [50, 50, 50], valign: 'top' }, 
          headStyles: { fillColor: color, textColor: 255, fontStyle: 'bold' }, 
          alternateRowStyles: { fillColor: [245, 245, 245] }, margin: { left: 14, right: 14 } 
        });
        currentY = doc.lastAutoTable.finalY + 10;
      }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
      doc.text('Pagina ' + i + ' de ' + pageCount, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }
    
    guardarArchivoNativo(doc.output('blob'), 'Reporte_Activos.pdf');
  };

  const escanearQR = async () => {
    try {
      setMsg('Abriendo cámara...');
      const image = await Camera.getPhoto({ quality: 80, allowEditing: false, resultType: CameraResultType.Base64, source: CameraSource.Camera });
      setMsg('Leyendo código...');
      const img = new Image();
      img.onload = async () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width; tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        let detectedCode = null;
        if ('BarcodeDetector' in window) {
          try { const detector = new BarcodeDetector({ formats: ['code_39', 'code_128', 'ean_13', 'qr_code'] }); const codes = await detector.detect(tempCanvas); if (codes.length > 0) detectedCode = codes[0].rawValue; } catch(e) {}
        }
        if (!detectedCode) {
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) detectedCode = code.data;
        }

        if (detectedCode) {
          const match = detectedCode.match(/ID_APP:(.*)/);
          if (match && match[1]) {
            const equipo = activos.find(a => a.id === match[1].trim());
            if (equipo) { setCentroActual(equipo.centro); setEditando(equipo); setVista('detalles'); setMsg(''); return; }
          }
          const equipo = activos.find(a => a.codigoActivo === detectedCode || a.numeroSerie === detectedCode || a.numeroSerieCPU === detectedCode);
          if (equipo) { setCentroActual(equipo.centro); setEditando(equipo); setVista('detalles'); setMsg(''); return; }
          alert('Código leído: ' + detectedCode + '\n\nPero no se encontró ningún equipo con este código.'); setMsg('');
        } else { alert('No se detectó ningún código. Intenta acercar más la cámara o mejorar la luz.'); setMsg(''); }
      };
      img.src = 'data:image/jpeg;base64,' + image.base64String;
    } catch (e) { setMsg('Escaneo cancelado.'); setTimeout(() => setMsg(''), 2000); }
  };

  const escanearParaCampo = async (campo) => {
    try {
      setMsg('Abriendo cámara para escanear...');
      const image = await Camera.getPhoto({ quality: 80, allowEditing: false, resultType: CameraResultType.Base64, source: CameraSource.Camera });
      const img = new Image();
      img.onload = async () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width; tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        let detectedCode = null;
        if ('BarcodeDetector' in window) {
          try { const detector = new BarcodeDetector({ formats: ['code_39', 'code_128', 'ean_13', 'qr_code'] }); const codes = await detector.detect(tempCanvas); if (codes.length > 0) detectedCode = codes[0].rawValue; } catch(e) {}
        }
        if (!detectedCode) {
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) detectedCode = code.data;
        }

        if (detectedCode) {
          const val = detectedCode.match(/ID_APP:(.*)/) ? detectedCode.match(/ID_APP:(.*)/)[1] : detectedCode;
          setForm(prev => ({ ...prev, [campo]: val }));
          setMsg('Código capturado: ' + val); setTimeout(()=>setMsg(''), 3000);
        } else { alert('No se detectó ningún código. Asegúrate de enfocar bien en buena luz.'); setMsg(''); }
      };
      img.src = 'data:image/jpeg;base64,' + image.base64String;
    } catch (e) { setMsg('Cancelado'); setTimeout(() => setMsg(''), 2000); }
  };

  if (!isLoggedIn) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center p-4'>
        <div className='bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100'>
          <div className='flex justify-center mb-6'>{logo ? <img src={logo} alt='Logo' className='h-24 object-contain' /> : <ShieldCheck size={64} className='text-blue-600' />}</div>
          <h1 className='text-gray-800 text-2xl font-bold text-center mb-1'>Control de Activos</h1>
          <p className='text-gray-400 text-center text-sm mb-6 font-medium'>Ingrese sus credenciales</p>
          <form onSubmit={handleLogin} className='space-y-4'>
            <div><label className='block text-xs font-bold text-gray-500 mb-1'>USUARIO</label><input type='text' placeholder='admin' value={user} onChange={e => setUser(e.target.value)} className='w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:outline-none' /></div>
            <div><label className='block text-xs font-bold text-gray-500 mb-1'>CONTRASENA</label><input type='password' placeholder='********' value={pass} onChange={e => setPass(e.target.value)} className='w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:outline-none' /></div>
            <button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition'>INGRESAR</button>
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

  const pisosDisponibles = oficinaFiltro ? ['Todos', ...new Set(datosCentro.filter(a => a.oficina === oficinaFiltro && a.piso).map(a => a.piso))] : [];
  const activosFiltrados = datosFinales.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.personaAsignada||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.numero||'').includes(busqueda));
  
  const activosEnAlmacen = activos.filter(a => a.enAlmacen);
  const oficinasAgrupadas = {};
  oficinasCentro.forEach(o => { const p = o.piso || 'Sin Piso'; if (!oficinasAgrupadas[p]) oficinasAgrupadas[p] = []; oficinasAgrupadas[p].push(o); });
  const pisosOrdenados = Object.keys(oficinasAgrupadas).sort((a, b) => { if (a === 'Sin Piso') return 1; if (b === 'Sin Piso') return -1; return a.localeCompare(b); });

  return (
    <div className='min-h-screen bg-gray-100 pb-20'>
      {msg && <div className='bg-green-500 text-white text-center p-2 font-bold fixed top-0 left-0 right-0 z-50'>{cargando ? 'Generando archivo...' : msg}</div>}
      <div className='bg-blue-700 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-10'>
        <div className='flex gap-3 items-center'>
          {vista !== 'hub' && <button onClick={handleVolver} className='bg-blue-800 p-2 rounded-lg'><ArrowLeft size={20} /></button>}
          {vista === 'hub' && <button onClick={() => setVista('config')} className='bg-blue-800 p-2 rounded-lg'><Key size={20} /></button>}
          <h1 className='text-lg font-bold'>{vista === 'almacen' ? 'Almacén Global' : (centroActual ? centros.find(c => c.id === centroActual)?.nombre : 'Multicentros')}</h1>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className='bg-blue-800 p-2 rounded-lg'><LogOut size={20} /></button>
      </div>

      <div className='p-4'>
        {vista === 'hub' && (
          <div className='space-y-4'>
            <button onClick={escanearQR} className='w-full p-6 rounded-xl shadow-sm bg-purple-600 text-white flex justify-between items-center active:bg-purple-700 mb-4'>
              <div className='flex items-center gap-3'><ScanLine size={32} /><div className='text-left'><h3 className='text-lg font-bold'>Escanear Código (QR o Barras)</h3><p className='text-sm text-purple-200'>Ver ficha del equipo al instante</p></div></div>
            </button>
            <button onClick={() => { setCentroActual(null); setVista('almacen'); }} className='w-full p-6 rounded-xl shadow-sm bg-indigo-600 text-white flex justify-between items-center active:bg-indigo-700 mb-4'>
              <div className='flex items-center gap-3'><Warehouse size={32} /><div className='text-left'><h3 className='text-lg font-bold'>Almacén Global</h3><p className='text-sm text-indigo-200'>Equipos sin asignar</p></div></div>
              <span className='bg-white text-indigo-600 font-bold text-xl rounded-full w-10 h-10 flex items-center justify-center'>{activosEnAlmacen.length}</span>
            </button>
            <div className='flex justify-between items-center mb-2'><div className='flex items-center gap-2 text-gray-600'><Building2 size={20} /><h2 className='text-xl font-bold text-gray-800'>Multicentros</h2></div><button onClick={agregarCentro} className='bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold'><Plus size={18} /> Agregar</button></div>
            <div className='grid grid-cols-1 gap-4'>
              {centros.map((c, index) => { const color = COLORES_CENTROS[index % COLORES_CENTROS.length]; return (
                <button key={c.id} onClick={() => { setCentroActual(c.id); setVista('dashboard'); setPisoExpandido(null); setCategoriaVista('computo'); }} className={'p-6 rounded-xl shadow-sm border-l-4 ' + color.borde + ' ' + color.fondo + ' text-left active:bg-gray-200'}>
                  <h3 className='text-lg font-bold text-gray-800'>{c.nombre}</h3><p className='text-sm text-gray-500 mt-1'>{activos.filter(a => a.centro === c.id && !a.enAlmacen).length} activos</p>
                </button>
              );})}
            </div>
          </div>
        )}

        {vista === 'almacen' && (
          <div>
            <div className='flex gap-2 mb-4'>
              <div className='flex-1 relative'><Search className='absolute left-3 top-3.5 text-gray-400' size={18} /><input placeholder='Buscar en almacén...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm' /></div>
              <button onClick={limpiarFormulario} className='bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2 shadow-sm'><Plus size={20} /> Nuevo</button>
            </div>
            <div className='space-y-3'>
              {activosEnAlmacen.length === 0 ? <p className='text-center text-gray-500 mt-10'>El almacén está vacío.</p> : 
              activosEnAlmacen.filter(a => (a.marca||'').toLowerCase().includes(busqueda.toLowerCase()) || (a.nombreEquipo||'').toLowerCase().includes(busqueda.toLowerCase())).map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('detalles'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-indigo-400 active:bg-gray-50'>
                  <div className='flex justify-between items-start'><div><p className='text-xs text-indigo-600 font-bold'>Nro. {a.numero}</p><h3 className='font-bold text-gray-800'>{a.nombreEquipo || (a.marcaCPU || a.marca) + ' ' + (a.modeloCPU || a.modelo)}</h3><p className='text-sm text-gray-500'>{a.tipo} {a.subtipoImpresora ? '- '+a.subtipoImpresora : ''}</p></div>{a.centro && <span className='text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600'>{centros.find(c=>c.id===a.centro)?.nombre || 'N/A'}</span>}</div>
                  <div className='mt-2 text-sm text-indigo-600 border-t pt-2 font-bold flex justify-end'><span>Toca para ver detalles</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {centroActual && vista === 'dashboard' && (
          <div className='space-y-4'>
            <div className='flex bg-gray-200 p-1 rounded-xl'>
              <button onClick={() => { setCategoriaVista('computo'); setEstadoFiltro(null); setOficinaFiltro(null); setSubtipoFiltro('Todos'); }} className={'flex-1 p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ' + (categoriaVista === 'computo' ? 'bg-white text-blue-600 shadow' : 'text-gray-500')}><Laptop size={18} /> Cómputo ({activos.filter(a => a.centro === centroActual && !a.enAlmacen && TIPOS_COMPUTO.includes(getSubtipo(a))).length})</button>
              <button onClick={() => { setCategoriaVista('red'); setEstadoFiltro(null); setOficinaFiltro(null); setSubtipoFiltro('Todos'); }} className={'flex-1 p-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ' + (categoriaVista === 'red' ? 'bg-white text-blue-600 shadow' : 'text-gray-500')}><Printer size={18} /> Red y Periféricos ({activos.filter(a => a.centro === centroActual && !a.enAlmacen && TIPOS_RED.includes(getSubtipo(a))).length})</button>
            </div>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Resumen General</h2>
            <div className='grid grid-cols-2 gap-3'>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro(null); setSubtipoFiltro('Todos'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-500 text-left'><p className='text-gray-500 text-xs'>Total Equipos</p><p className='text-2xl font-bold text-gray-800'>{datosCentro.length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('Activo'); setSubtipoFiltro('Todos'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 text-left'><p className='text-gray-500 text-xs'>Activos</p><p className='text-2xl font-bold text-green-600'>{datosCentro.filter(a=>a.estado==='Activo').length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('Danado'); setSubtipoFiltro('Todos'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 text-left'><p className='text-gray-500 text-xs'>Danados</p><p className='text-2xl font-bold text-red-600'>{datosCentro.filter(a=>a.estado==='Danado').length}</p></button>
              <button onClick={() => { setOficinaFiltro(null); setEstadoFiltro('En Mantenimiento'); setSubtipoFiltro('Todos'); setVista('lista'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 text-left'><p className='text-gray-500 text-xs'>Mantenimiento</p><p className='text-2xl font-bold text-yellow-600'>{datosCentro.filter(a=>a.estado==='En Mantenimiento').length}</p></button>
            </div>
            <div className='flex justify-between items-center mt-4 mb-2'><h3 className='font-bold text-gray-700 flex items-center gap-2'><MapPin size={18} /> Oficinas por Piso</h3><button onClick={() => setVista('oficinas')} className='bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold'><Edit3 size={16} /> Gestionar</button></div>
            {pisosOrdenados.length === 0 ? <p className='text-sm text-gray-500 bg-white p-4 rounded-lg text-center'>No hay oficinas asignadas a pisos. Ve a Gestionar.</p> : (
              <div className='space-y-3'>
                {pisosOrdenados.map(p => { const equiposEnPiso = datosCentro.filter(a => (a.piso ? a.piso : 'Sin Piso') === p).length; const oficinasEnPiso = oficinasAgrupadas[p]; return (
                  <div key={p} className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                    <button onClick={() => setPisoExpandido(pisoExpandido === p ? null : p)} className='w-full p-4 flex justify-between items-center active:bg-gray-50'><span className='font-bold text-gray-800'>Piso {p}</span><div className='flex items-center gap-3'><span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold'>{equiposEnPiso} equipos</span><ChevronDown size={20} className={'text-gray-400 transition-transform ' + (pisoExpandido === p ? 'rotate-180' : '')} /></div></button>
                    {pisoExpandido === p && (<div className='p-3 pt-0 grid grid-cols-2 gap-3'>{oficinasEnPiso.length === 0 ? <p className='col-span-2 text-center text-xs text-gray-400 py-2'>No hay oficinas.</p> : oficinasEnPiso.map(o => { const count = datosCentro.filter(a => a.oficina === o.nombre).length; return (<button key={o.id} onClick={() => { setOficinaFiltro(o.nombre); setPisoFiltro(p === 'Sin Piso' ? '' : p); setEstadoFiltro(null); setSubtipoFiltro('Todos'); setVista('lista'); setBusqueda(''); }} className='bg-gray-50 p-3 rounded-lg border border-gray-200 text-left active:bg-gray-100 hover:border-blue-400 transition'><h4 className='font-bold text-gray-800 text-sm'>{o.nombre}</h4><p className='text-xs text-gray-500 mt-1'>{count} equipos</p></button>); })}</div>)}
                  </div>
                );})}
              </div>
            )}
          </div>
        )}

        {centroActual && vista === 'oficinas' && (
          <div>
            <button onClick={handleVolver} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver al Dashboard</button>
            <div className='bg-white p-4 rounded-xl shadow-sm mb-4'>
              <div className='flex justify-between items-center mb-4'><h2 className='font-bold text-lg text-gray-800 flex items-center gap-2'><Layers size={20} /> Pisos de {centros.find(c=>c.id===centroActual)?.nombre}</h2><button onClick={agregarPiso} className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-sm'><Plus size={18} /> Nuevo Piso</button></div>
              {pisosCentroActual.length === 0 ? <p className='text-gray-500 text-center py-4 text-sm'>No hay pisos creados en este centro.</p> : (
                <div className='flex flex-wrap gap-2'>{pisosCentroActual.map((p, index) => (<div key={index} className='flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200'><span className='font-bold text-gray-700 text-sm'>Piso {p}</span><button onClick={() => { if (confirm('Eliminar el piso ' + p + '?')) { const np = pisosCentroActual.filter((_, i) => i !== index); guardarPisos({...pisos, [centroActual]: np}); const no = oficinasCentro.map(o => o.piso === p ? {...o, piso: ''} : o); guardarOficinas({...oficinas, [centroActual]: no}); setMsg('Piso eliminado'); setTimeout(()=>setMsg(''), 2000); } }} className='text-red-500'><Trash2 size={14} /></button></div>))}</div>
              )}
            </div>
            <div className='bg-white p-4 rounded-xl shadow-sm'>
              <div className='flex justify-between items-center mb-4'><h2 className='font-bold text-lg text-gray-800'>Oficinas de {centros.find(c=>c.id===centroActual)?.nombre}</h2><button onClick={agregarOficina} className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 font-bold text-sm'><Plus size={18} /> Nueva Oficina</button></div>
              {oficinasCentro.length === 0 ? <p className='text-gray-500 text-center py-8 text-sm'>Aun no hay oficinas creadas.</p> : (
                <div className='space-y-3'>{oficinasCentro.map((o, index) => (<div key={o.id} className='flex justify-between items-center bg-gray-50 p-4 rounded-lg border'><div><p className='font-bold text-gray-800'>{index + 1}. {o.nombre}</p><p className='text-xs text-gray-500'>{datosCentro.filter(a => a.oficina === o.nombre).length} equipos | Piso: {o.piso || 'No asignado'}</p></div><div className='flex gap-2'><button onClick={() => { const nuevo = prompt('Editar nombre:', o.nombre); if (nuevo && nuevo.trim()) { const act = oficinasCentro; act[index].nombre = nuevo.trim(); guardarOficinas({...oficinas, [centroActual]: act}); setMsg('Actualizado'); setTimeout(()=>setMsg(''), 2000); } }} className='bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold'>Editar</button><button onClick={() => { if (confirm('Eliminar ' + o.nombre + '?')) { const act = oficinasCentro; act.splice(index, 1); guardarOficinas({...oficinas, [centroActual]: act}); setMsg('Eliminada'); setTimeout(()=>setMsg(''), 2000); } }} className='bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-bold'>Borrar</button></div></div>))}</div>
              )}
            </div>
          </div>
        )}

        {centroActual && vista === 'lista' && (
          <div>
            {(estadoFiltro || oficinaFiltro) && (<div className='bg-blue-50 p-3 rounded-xl mb-4 flex justify-between items-center border border-blue-200'><div><p className='text-xs text-blue-600 font-bold'>FILTRANDO POR:</p><p className='text-sm font-bold text-gray-800'>{estadoFiltro ? 'Estado: ' + estadoFiltro : 'Oficina: ' + oficinaFiltro} {pisoFiltro && pisoFiltro !== 'Todos' ? '| Piso: ' + pisoFiltro : ''}</p></div><button onClick={() => { setEstadoFiltro(null); setOficinaFiltro(null); setPisoFiltro('Todos'); setBusqueda(''); setSubtipoFiltro('Todos'); }} className='text-red-500 font-bold text-sm'>LIMPIAR</button></div>)}
            <div className='flex gap-2 mb-4 overflow-x-auto pb-2'>
              <button onClick={() => setSubtipoFiltro('Todos')} className={'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ' + (subtipoFiltro === 'Todos' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border')}>Todos</button>
              {categoriaVista === 'computo' ? (TIPOS_COMPUTO.map(s => (<button key={s} onClick={() => setSubtipoFiltro(s)} className={'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ' + (subtipoFiltro === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border')}>{s}</button>))) : (TIPOS_RED.map(s => (<button key={s} onClick={() => setSubtipoFiltro(s)} className={'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ' + (subtipoFiltro === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border')}>{s}</button>)))}
            </div>
            {oficinaFiltro && pisosDisponibles.length > 0 && (<div className='flex gap-2 mb-4 overflow-x-auto pb-2'>{pisosDisponibles.map(p => (<button key={p} onClick={() => setPisoFiltro(p)} className={'px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ' + (pisoFiltro === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border')}>{p === 'Todos' ? 'Todos' : 'Piso ' + p}</button>))}</div>)}
            <div className='flex gap-2 mb-4'><div className='flex-1 relative'><Search className='absolute left-3 top-3.5 text-gray-400' size={18} /><input placeholder='Buscar equipo...' value={busqueda} onChange={e => setBusqueda(e.target.value)} className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm' /></div><button onClick={limpiarFormulario} className='bg-blue-600 text-white px-4 rounded-xl flex items-center gap-2 shadow-sm'><Plus size={20} /> Nuevo</button></div>
            <div className='space-y-3'>
              {activosFiltrados.length === 0 ? <p className='text-center text-gray-500 mt-10'>Sin activos.</p> : 
              activosFiltrados.map(a => (
                <div key={a.id} onClick={() => { setEditando(a); setVista('detalles'); }} className='bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-400 active:bg-gray-50'>
                  <div className='flex justify-between items-start'><div><p className='text-xs text-blue-600 font-bold'>Nro. {a.numero}</p><h3 className='font-bold text-gray-800'>{a.nombreEquipo || (a.marcaCPU || a.marca) + ' ' + (a.modeloCPU || a.modelo)}</h3><p className='text-sm text-gray-500'>{a.tipo} {a.subtipoImpresora ? '- '+a.subtipoImpresora : ''}</p></div><div className='text-right'><span className={'text-xs font-bold px-2 py-1 rounded-full ' + (a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{a.estado}</span></div></div>
                  <div className='mt-2 text-sm text-gray-600 border-t pt-2 flex justify-between'><span>{a.personaAsignada ? 'Asignado: ' + a.personaAsignada : 'En Stock'}</span><span>{a.oficina || '-'} {a.piso ? '- Piso ' + a.piso : ''}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vista === 'detalles' && editando && (
          <div className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
            <div className='flex justify-between items-center border-b pb-2'><h2 className='font-bold text-lg text-gray-800'>Ficha del Activo</h2><span className='text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-800'>Nro. {editando.numero}</span></div>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div><p className='text-gray-400 text-xs'>Tipo</p><p className='font-bold text-gray-700'>{editando.tipo || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Nombre Equipo</p><p className='font-bold text-gray-700'>{editando.nombreEquipo || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Marca</p><p className='font-bold text-gray-700'>{editando.marca || editando.marcaCPU || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Modelo</p><p className='font-bold text-gray-700'>{editando.modelo || editando.modeloCPU || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Código AF</p><p className='font-bold text-gray-700'>{editando.codigoActivo || editando.codigoActivoCPU || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Serie</p><p className='font-bold text-gray-700'>{editando.numeroSerie || editando.numeroSerieCPU || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Procesador</p><p className='font-bold text-gray-700'>{editando.procesador || '-'} {editando.generacion ? '('+editando.generacion+')' : ''}</p></div>
              <div><p className='text-gray-400 text-xs'>RAM</p><p className='font-bold text-gray-700'>{editando.ram || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>Disco 1</p><p className='font-bold text-gray-700'>{editando.tipoDisco} {editando.capacidadDisco}</p></div>
              <div><p className='text-gray-400 text-xs'>Disco 2</p><p className='font-bold text-gray-700'>{editando.tipoDisco2} {editando.capacidadDisco2}</p></div>
              <div><p className='text-gray-400 text-xs'>Estado</p><p className='font-bold text-gray-700'>{editando.estado || '-'}</p></div>
              <div><p className='text-gray-400 text-xs'>En Almacén</p><p className='font-bold text-gray-700'>{editando.enAlmacen ? 'SÍ' : 'NO'}</p></div>
            </div>
            {!editando.enAlmacen && (<div className='bg-gray-50 p-3 rounded-lg space-y-1 text-sm'><h3 className='font-bold text-gray-700 border-b pb-1 mb-2'>Ubicación y Asignación</h3><p><span className='text-gray-400'>Oficina:</span> {editando.oficina || '-'} (Piso {editando.piso || '-'})</p><p><span className='text-gray-400'>Asignado a:</span> {editando.personaAsignada || '-'}</p><p><span className='text-gray-400'>Cargo:</span> {editando.cargo || '-'}</p><p><span className='text-gray-400'>Fecha:</span> {editando.fechaAsignacion || '-'}</p></div>)}
            {(editando.fotoEquipo || editando.fotoSerie) && (<div className='grid grid-cols-2 gap-4'>{editando.fotoEquipo && <div><p className='text-xs text-gray-400 mb-1'>Foto Equipo</p><img src={editando.fotoEquipo} className='w-full h-32 object-cover rounded-lg border' /></div>}{editando.fotoSerie && <div><p className='text-xs text-gray-400 mb-1'>Foto Serie</p><img src={editando.fotoSerie} className='w-full h-32 object-cover rounded-lg border' /></div>}</div>)}
            <div className='bg-gray-50 p-3 rounded-lg'><h3 className='font-bold text-gray-700 border-b pb-1 mb-2 text-sm'>Bitácora / Historial</h3><div className='space-y-2 max-h-40 overflow-y-auto'>{(editando.historial || []).length === 0 ? <p className='text-xs text-gray-400 text-center py-2'>Sin movimientos.</p> : (editando.historial || []).slice().reverse().map((h, i) => (<div key={i} className='text-xs bg-white p-2 rounded border-l-4 border-blue-400 shadow-sm'><p className='font-bold text-gray-500'>[{h.fecha}]</p><p className='text-gray-700 mt-1'>{h.nota}</p></div>))}</div></div>
            <div className='flex gap-3 pt-2'><button onClick={() => setVista('formulario')} className='flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2'><Edit3 size={20} /> Editar Equipo</button><button onClick={handleVolver} className='bg-gray-200 text-gray-600 px-4 rounded-lg font-bold'><ArrowLeft size={20} /></button></div>
          </div>
        )}

        {centroActual && vista === 'reporte' && (
          <div className='space-y-4'>
            <div className='bg-white p-4 rounded-xl shadow-sm'><h2 className='font-bold text-gray-800 mb-3'>1. Selecciona Equipos a Incluir:</h2><div className='grid grid-cols-2 gap-2'>{SUBTIPOS_REPORTE.map(cat => (<label key={cat} className={'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ' + (catsReporte.includes(cat) ? 'bg-indigo-50 border-indigo-500 text-indigo-800 font-medium' : 'bg-gray-50 border-gray-200')}><input type='checkbox' checked={catsReporte.includes(cat)} onChange={() => handleCatReporte(cat)} className='accent-indigo-600' />{cat}</label>))}</div></div>
            <div className='bg-white p-4 rounded-xl shadow-sm'>
              <div className='flex justify-between items-center mb-3'><h2 className='font-bold text-gray-800'>2. Selecciona Columnas (y Orden):</h2><div className='flex gap-2'><button onClick={seleccionarTodosCampos} className='flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold'><CheckSquare size={14} /> Todos</button><button onClick={limpiarCampos} className='flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold'><Square size={14} /> Limpiar</button></div></div>
              <div className='grid grid-cols-2 gap-2'>
                {CAMPOS.map((c, index) => { const isSelected = camposSeleccionados.includes(c.key); const colorClass = COLORES_CHECKS[index % COLORES_CHECKS.length]; return (
                  <label key={c.key} className={'flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-all ' + (isSelected ? `bg-gray-50 border-gray-300 font-bold ${colorClass}` : 'bg-gray-50 border-gray-200 text-gray-500')}>
                    <input type='checkbox' checked={isSelected} onChange={() => handleCheck(c.key)} className='w-4 h-4 accent-blue-600' />
                    <span className='flex-1 truncate'>{c.label}</span>
                    {isSelected && <span className='ml-auto text-xs font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded-full'>{ordenCols[c.key]}</span>}
                  </label>
                );})}
              </div>
            </div>
            {camposSeleccionados.length > 0 && catsReporte.length > 0 && (
              <div className='bg-white p-4 rounded-xl shadow-sm overflow-x-auto'>
                <h3 className='font-bold text-gray-800 mb-3 text-sm'>Vista Previa del Reporte:</h3>
                {catsReporte.map(cat => { const datosCat = activos.filter(a => a.centro === centroActual && !a.enAlmacen && getSubtipo(a) === cat); if (datosCat.length === 0) return null; return (
                  <div key={cat} className='mb-6'>
                    <h4 className='font-bold text-blue-800 text-sm mb-2 border-b pb-1'>{cat} ({datosCat.length})</h4>
                    <table className='w-full text-xs text-left border-collapse'>
                      <thead><tr className='bg-blue-800 text-white'>{[...camposSeleccionados].sort((a, b) => (ordenCols[a] || 0) - (ordenCols[b] || 0)).map(k => <th key={k} className='p-2 border border-blue-700 whitespace-nowrap'>{CAMPOS.find(c=>c.key===k)?.label || k}</th>)}</tr></thead>
                      <tbody>{datosCat.slice(0, 3).map((a, i) => (<tr key={a.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>{[...camposSeleccionados].sort((a, b) => (ordenCols[a] || 0) - (ordenCols[b] || 0)).map(k => <td key={k} className='p-2 border border-gray-200 whitespace-nowrap'>{getValor(a, k)}</td>)}</tr>))}</tbody>
                    </table>
                    {datosCat.length > 3 && <p className='text-center text-xs text-gray-400 mt-1'>+ {datosCat.length - 3} registros más...</p>}
                  </div>
                );})}
              </div>
            )}
            <div className='grid grid-cols-2 gap-4'><button onClick={exportarCSV} disabled={cargando || camposSeleccionados.length === 0 || catsReporte.length === 0} className='bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50'><Download size={20} /> Excel</button><button onClick={exportarPDF} disabled={cargando || camposSeleccionados.length === 0 || catsReporte.length === 0} className='bg-red-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50'><FileText size={20} /> PDF</button></div>
          </div>
        )}

        {vista === 'formulario' && <FormularioActivo activo={editando} guardarDatos={guardarDatos} setVista={setVista} handleVolver={handleVolver} getNextNumber={getNextNumber} centroActual={centroActual} oficinas={oficinas} centros={centros} setMsg={setMsg} guardarArchivoNativo={guardarArchivoNativo} escanearParaCampo={escanearParaCampo} />}
        {vista === 'config' && <ConfigVista setVista={setVista} setMsg={setMsg} setActivos={setActivos} setCentros={setCentros} setOficinas={setOficinas} setPisos={setPisos} setCustomPass={setCustomPass} setLogo={setLogo} guardarArchivoNativo={guardarArchivoNativo} />}
      </div>

      {centroActual && vista !== 'formulario' && vista !== 'detalles' && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
          <button onClick={() => setVista('dashboard')} className={'flex flex-col items-center text-xs ' + (vista === 'dashboard' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Inicio</span></button>
          <button onClick={() => {setVista('lista'); setEstadoFiltro(null); setOficinaFiltro(null); setPisoFiltro('Todos'); setSubtipoFiltro('Todos');}} className={'flex flex-col items-center text-xs ' + (vista === 'lista' ? 'text-blue-600' : 'text-gray-400')}><Search size={24} /><span>Inventario</span></button>
          <button onClick={() => setVista('reporte')} className={'flex flex-col items-center text-xs ' + (vista === 'reporte' ? 'text-blue-600' : 'text-gray-400')}><FileText size={24} /><span>Reportes</span></button>
        </div>
      )}
    </div>
  );
}

function ConfigVista({ setVista, setMsg, setActivos, setCentros, setOficinas, setPisos, setCustomPass, setLogo, guardarArchivoNativo }) {
  const [nueva, setNueva] = useState('');
  const h = (e) => { e.preventDefault(); if (nueva.length < 4) { alert('Minimo 4 caracteres'); return; } setCustomPass(nueva); localStorage.setItem('app_pass_v74', nueva); setMsg('Contrasena actualizada'); setTimeout(() => setMsg(''), 3000); setVista('hub'); };
  const handleLogo = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { const base64 = event.target.result; localStorage.setItem('logo_empresa_v74', base64); setLogo(base64); setMsg('Logo actualizado'); setTimeout(() => setMsg(''), 3000); }; reader.readAsDataURL(file); };
  const exportarRespaldo = () => { const respaldo = { activos: JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'), centros: JSON.parse(localStorage.getItem('mis_centros_v74') || '[]'), oficinas: JSON.parse(localStorage.getItem('mis_oficinas_v74') || '{}'), pisos: JSON.parse(localStorage.getItem('mis_pisos_v74') || '{}'), pass: localStorage.getItem('app_pass_v74'), logo: localStorage.getItem('logo_empresa_v74') }; const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' }); guardarArchivoNativo(blob, 'respaldo_activos.json'); };
  const importarRespaldo = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = JSON.parse(event.target.result); if (data.activos) { localStorage.setItem('activos_fijos_v74', JSON.stringify(data.activos)); setActivos(data.activos); } if (data.centros) { localStorage.setItem('mis_centros_v74', JSON.stringify(data.centros)); setCentros(data.centros); } if (data.oficinas) { localStorage.setItem('mis_oficinas_v74', JSON.stringify(data.oficinas)); setOficinas(data.oficinas); } if (data.pisos) { localStorage.setItem('mis_pisos_v74', JSON.stringify(data.pisos)); setPisos(data.pisos); } if (data.pass) { localStorage.setItem('app_pass_v74', data.pass); setCustomPass(data.pass); } if (data.logo) { localStorage.setItem('logo_empresa_v74', data.logo); setLogo(data.logo); } setMsg('Respaldo restaurado'); setTimeout(()=>setMsg(''), 3000); setVista('hub'); } catch (err) { alert('Error: Archivo invalido.'); } }; reader.readAsText(file); };
  return (
    <div className='bg-white p-6 rounded-xl shadow-sm space-y-6'>
      <button onClick={() => setVista('hub')} className='flex items-center text-blue-600 font-bold mb-2'><ArrowLeft size={20} /> Volver</button>
      <div className='border-b pb-6'><h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'><ImageIcon size={24} /> Logo de Empresa</h2><label className='bg-blue-50 text-blue-700 border-2 border-dashed border-blue-200 p-6 rounded-xl font-bold flex flex-col items-center gap-2 cursor-pointer'><Upload size={32} /><span>Seleccionar Logo</span><input type='file' accept='image/*' onChange={handleLogo} className='hidden' /></label></div>
      <div><h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'><Key size={24} /> Cambiar Contrasena</h2><form onSubmit={h} className='space-y-4'><input type='password' value={nueva} onChange={e => setNueva(e.target.value)} required className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50' placeholder='Nueva contrasena' /><button type='submit' className='w-full bg-blue-600 text-white p-3 rounded-lg font-bold'>Guardar</button></form></div>
      <div className='border-t pt-6'><h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'><Save size={24} /> Respaldo de Datos</h2><div className='grid grid-cols-2 gap-4'><button onClick={exportarRespaldo} className='bg-green-600 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2'><Download size={24} /> Exportar</button><label className='bg-yellow-500 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 cursor-pointer'><Upload size={24} /> Importar<input type='file' accept='.json' onChange={importarRespaldo} className='hidden' /></label></div></div>
    </div>
  );
}

function FormularioActivo({ activo, guardarDatos, setVista, handleVolver, getNextNumber, centroActual, oficinas, centros, setMsg, guardarArchivoNativo, escanearParaCampo }) {
  const esAlmacen = !centroActual; 
  const [form, setForm] = useState(activo || { id: Date.now().toString(), centro: centroActual, numero: getNextNumber(), tipo: 'Laptop', subtipoImpresora: 'Impresora Normal', nombreEquipo: '', marca: '', modelo: '', codigoActivo: '', numeroSerie: '', procesador: '', generacion: '', ram: '', tipoDisco: 'SSD M.2', capacidadDisco: '', tipoDisco2: 'Ninguno', capacidadDisco2: '', sistemaOperativo: '', mac: '', ip: '', estado: 'Activo', enAlmacen: esAlmacen, oficina: '', piso: '', cargo: '', numeroEmpleado: '', personaAsignada: '', nombreResponsable: '', fechaAsignacion: '', marcaCPU: '', modeloCPU: '', codigoActivoCPU: '', numeroSerieCPU: '', marcaMonitor: '', modeloMonitor: '', codigoActivoMonitor: '', numeroSerieMonitor: '', conexionImpresora: 'En Red', notas: '', fotoEquipo: '', fotoSerie: '', historial: [] });
  const [verBitacora, setVerBitacora] = useState(false);
  const [errores, setErrores] = useState({});

  const oficinasDestino = oficinas[form.centro] || [];

  const validarUnico = (campo, valor) => {
    if (!valor) { setErrores(prev => { const n = {...prev}; delete n[campo]; return n; }); return true; }
    const existe = activos.some(a => a.id !== form.id && a[campo] === valor);
    if (existe) { setErrores(prev => ({ ...prev, [campo]: true })); setMsg('¡Atención! Este código/serie ya existe.'); setTimeout(()=>setMsg(''), 3000); } 
    else { setErrores(prev => { const n = {...prev}; delete n[campo]; return n; }); }
    return !existe;
  };

  const h = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    let newForm = { ...form, [e.target.name]: val };
    if (e.target.name === 'oficina') { const o = oficinasDestino.find(o => o.nombre === val); if (o) newForm.piso = o.piso || ''; }
    if (e.target.name === 'enAlmacen' && val === true) { newForm = { ...newForm, personaAsignada: '', cargo: '', numeroEmpleado: '', nombreResponsable: '', oficina: '', piso: '', fechaAsignacion: '' }; setMsg('Enviado a Almacén.'); setTimeout(()=>setMsg(''), 3000); }
    setForm(newForm);
  };

  const parseGeneracion = (procesador) => {
    if (!procesador) return '';
    const limpio = procesador.toLowerCase().replace(/\s+/g, '');
    const matchIntel = limpio.match(/i\d+-(\d{3,5})/);
    if (matchIntel) {
      const numStr = matchIntel[1]; const firstTwo = parseInt(numStr.substring(0, 2)); let genNum;
      if (firstTwo >= 10 && firstTwo <= 14) genNum = firstTwo; else genNum = parseInt(numStr[0]);
      const ordinales = ['', '1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na', '10ma', '11va', '12va', '13va', '14va'];
      return ordinales[genNum] || `${genNum}va`;
    }
    const matchRyzen = limpio.match(/ryzen\d*(\d{4})/);
    if (matchRyzen) {
      const numStr = matchRyzen[1]; const firstTwo = parseInt(numStr.substring(0, 2)); let genNum;
      if (firstTwo >= 10 && firstTwo <= 14) genNum = firstTwo; else genNum = parseInt(numStr[0]);
      const ordinales = ['', '1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va', '9na', '10ma', '11va', '12va', '13va', '14va'];
      return ordinales[genNum] || `${genNum}va`;
    }
    return '';
  };

  const handleProcesador = (e) => setForm({ ...form, procesador: e.target.value, generacion: parseGeneracion(e.target.value) });
  const formatMemory = (campo) => { let val = (form[campo] || '').toString().trim(); if (!val) return; const num = parseFloat(val.replace(/[^0-9.]/g, '')); if (!isNaN(num) && num > 0) { if (num >= 1000) setForm({ ...form, [campo]: `${(num / 1000).toFixed(1).replace('.0', '')} TB` }); else setForm({ ...form, [campo]: `${num} GB` }); } };
  const tomarFoto = async (campo) => { try { const image = await Camera.getPhoto({ quality: 30, allowEditing: false, resultType: CameraResultType.Base64, source: CameraSource.Camera }); setForm({ ...form, [campo]: 'data:image/jpeg;base64,' + image.base64String }); setMsg('Foto capturada'); setTimeout(()=>setMsg(''), 2000); } catch (e) { setMsg('Cancelado'); setTimeout(()=>setMsg(''), 2000); } };
  const eliminarFoto = (campo) => { setForm({ ...form, [campo]: '' }); setMsg('Foto eliminada'); setTimeout(()=>setMsg(''), 1500); };

  const generarDatosQR = (f) => { let t = '=== ACTIVO FIJO ===\nNro: ' + f.numero + '\nTipo: ' + f.tipo + '\n'; if (f.nombreEquipo) t += 'Nombre: ' + f.nombreEquipo + '\n'; if (f.marca) t += 'Marca: ' + f.marca + '\n'; if (f.numeroSerie) t += 'Serie: ' + f.numeroSerie + '\n'; if (f.codigoActivo) t += 'Cod AF: ' + f.codigoActivo + '\n'; t += 'Estado: ' + f.estado + '\n'; if (f.enAlmacen) t += 'Ubicacion: ALMACEN\n'; else { if (f.personaAsignada) t += 'Asignado a: ' + f.personaAsignada + '\n'; if (f.oficina) t += 'Oficina: ' + f.oficina + '\n'; } return t + '===================\nID_APP:' + f.id; };
  const compartirQR = async () => { try { const canvas = document.querySelector('#qr-canvas-container canvas'); if (!canvas) return; setMsg('Preparando QR...'); const base64 = canvas.toDataURL('image/png').split(',')[1]; await Filesystem.writeFile({ path: `QR_${form.numero}.png`, data: base64, directory: Directory.Cache }); const uriResult = await Filesystem.getUri({ path: `QR_${form.numero}.png`, directory: Directory.Cache }); await Share.share({ url: uriResult.uri, dialogTitle: 'Compartir Código QR' }); setMsg('Listo.'); setTimeout(() => setMsg(''), 3000); } catch (e) { setMsg('Error.'); setTimeout(() => setMsg(''), 3000); } };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    const camposAValidar = ['codigoActivo', 'numeroSerie', 'codigoActivoCPU', 'numeroSerieCPU', 'numeroSerieMonitor'];
    for (const c of camposAValidar) { if (form[c] && activos.some(a => a.id !== form.id && a[c] === form[c])) { setErrores(prev => ({ ...prev, [c]: true })); alert('No se puede guardar. Hay códigos o series repetidas.'); return; } }
    const datos = JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'); 
    let f = { ...form }; const hoy = new Date().toLocaleDateString();
    if (activo) { let logs = []; if (activo.personaAsignada !== f.personaAsignada && f.personaAsignada) logs.push('Asignado a ' + f.personaAsignada); if (activo.estado !== f.estado) logs.push('Estado: ' + f.estado); if (activo.oficina !== f.oficina && f.oficina) logs.push('Oficina: ' + f.oficina); if (activo.enAlmacen !== f.enAlmacen) logs.push(f.enAlmacen ? 'Enviado a Almacén' : 'Sacado de Almacén'); if (logs.length > 0) f.historial = [...(activo.historial || []), ...logs.map(n => ({ fecha: hoy, nota: n }))]; guardarDatos(datos.map(a => a.id === activo.id ? f : a)); } 
    else { f.historial = [{ fecha: hoy, nota: 'Equipo registrado' }]; guardarDatos([...datos, f]); }
    handleVolver(); 
  };
  const handleEliminar = () => { if (confirm('Eliminar?')) { const d = JSON.parse(localStorage.getItem('activos_fijos_v74') || '[]'); guardarDatos(d.filter(a => a.id !== form.id)); handleVolver(); } };

  const OficinaSelect = ({ req }) => (<div><label className='block text-xs font-medium text-gray-700 mb-1'>Oficina</label><select name='oficina' value={form.oficina||''} onChange={h} required={req} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option value='' disabled>Seleccionar...</option>{oficinasDestino.map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}</select></div>);
  const PisoInput = ({ req }) => (<div><label className='block text-xs font-medium text-gray-700 mb-1'>Piso</label><input name='piso' value={form.piso||''} readOnly className='w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100 text-sm' /></div>);

  const esTipoRed = ['Impresora', 'Impresora Multifuncional', 'Scanner', 'Switch'].includes(form.tipo);
  const esTipoUnificado = ['Laptop', 'Computadora All in One'].includes(form.tipo);

  return (
    <div>
      <button onClick={handleVolver} className='flex items-center text-blue-600 font-bold mb-4'><ArrowLeft size={20} /> Volver</button>
      <form onSubmit={handleSubmit} className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
        <h2 className='font-bold text-lg text-gray-800 border-b pb-2'>{activo ? 'Editar Nro. ' + form.numero : 'Nuevo Registro'}</h2>
        {esAlmacen && !form.enAlmacen && (<div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400'><label className='block text-xs font-bold text-blue-600 mb-1'>ASIGNAR A MULTICENTRO</label><select name='centro' value={form.centro||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option value='' disabled>Seleccionar...</option>{centros.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>)}
        <div className='grid grid-cols-2 gap-4'>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>Nro. REGISTRO</label><input name='numero' value={form.numero} readOnly className='w-full p-3 border border-gray-200 rounded-lg bg-blue-50 text-blue-800 font-bold' /></div>
          <div><label className='block text-xs font-bold text-gray-500 mb-1'>TIPO EQUIPO</label><select name='tipo' value={form.tipo} onChange={h} className='w-full p-3 border border-gray-300 rounded-lg bg-gray-50'><option>Laptop</option><option>Computadora de Escritorio</option><option>Computadora All in One</option><option>Impresora</option><option>Impresora Multifuncional</option><option>Scanner</option><option>Switch</option></select></div>
        </div>

        {esTipoUnificado && (
          <>
          <div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'>
            <p className='text-xs font-bold text-blue-600'>DATOS {form.tipo === 'Laptop' ? 'LAPTOP' : 'ALL IN ONE'}</p>
            <div className='grid grid-cols-2 gap-3'>
              <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Maquina</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div className='relative'><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF</label><div className='flex gap-1'><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} onBlur={(e)=>validarUnico('codigoActivo', e.target.value)} className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.codigoActivo ? 'border-red-500 bg-red-50' : 'border-gray-300')} /><button type='button' onClick={() => escanearParaCampo('codigoActivo')} className='bg-gray-200 p-2.5 rounded-lg'><Barcode size={18} className='text-gray-700' /></button></div>{errores.codigoActivo && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Numero de Serie</label><div className='flex gap-1'><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerie', e.target.value)} required className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.numeroSerie ? 'border-red-500 bg-red-50' : 'border-gray-300')} /><button type='button' onClick={() => escanearParaCampo('numeroSerie')} className='bg-gray-200 p-2.5 rounded-lg'><Barcode size={18} className='text-gray-700' /></button></div>{errores.numeroSerie && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
            </div>
          </div>
          <CamposSpecs form={form} setForm={setForm} handleProcesador={handleProcesador} formatMemory={formatMemory} />
          <CamposUbicacion form={form} h={h} OficinaSelect={OficinaSelect} PisoInput={PisoInput} />
          </>
        )}

        {form.tipo === 'Computadora de Escritorio' && (
          <>
          <div className='bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 space-y-3'>
            <p className='text-xs font-bold text-blue-600'>DATOS CPU</p>
            <div className='grid grid-cols-2 gap-3'>
              <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Nombre Equipo</label><input name='nombreEquipo' value={form.nombreEquipo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca CPU</label><input name='marcaCPU' value={form.marcaCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo CPU</label><input name='modeloCPU' value={form.modeloCPU||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div className='relative'><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF CPU</label><div className='flex gap-1'><input name='codigoActivoCPU' value={form.codigoActivoCPU||''} onChange={h} onBlur={(e)=>validarUnico('codigoActivoCPU', e.target.value)} className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.codigoActivoCPU ? 'border-red-500 bg-red-50' : 'border-gray-300')} /><button type='button' onClick={() => escanearParaCampo('codigoActivoCPU')} className='bg-gray-200 p-2.5 rounded-lg'><Barcode size={18} className='text-gray-700' /></button></div>{errores.codigoActivoCPU && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie CPU</label><div className='flex gap-1'><input name='numeroSerieCPU' value={form.numeroSerieCPU||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerieCPU', e.target.value)} required className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.numeroSerieCPU ? 'border-red-500 bg-red-50' : 'border-gray-300')} /><button type='button' onClick={() => escanearParaCampo('numeroSerieCPU')} className='bg-gray-200 p-2.5 rounded-lg'><Barcode size={18} className='text-gray-700' /></button></div>{errores.numeroSerieCPU && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
            </div>
          </div>
          <div className='bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 space-y-3'>
            <p className='text-xs font-bold text-yellow-700'>DATOS MONITOR</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca Monitor</label><input name='marcaMonitor' value={form.marcaMonitor||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo Monitor</label><input name='modeloMonitor' value={form.modeloMonitor||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie Monitor</label><input name='numeroSerieMonitor' value={form.numeroSerieMonitor||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerieMonitor', e.target.value)} className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.numeroSerieMonitor ? 'border-red-500 bg-red-50' : 'border-gray-300')} />{errores.numeroSerieMonitor && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF Monitor</label><input name='codigoActivoMonitor' value={form.codigoActivoMonitor||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
            </div>
          </div>
          <CamposSpecs form={form} setForm={setForm} handleProcesador={handleProcesador} formatMemory={formatMemory} />
          <CamposUbicacion form={form} h={h} OficinaSelect={OficinaSelect} PisoInput={PisoInput} />
          </>
        )}

        {esTipoRed && (
          <div className='bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400 space-y-3'>
            <p className='text-xs font-bold text-orange-600'>DATOS {form.tipo.toUpperCase()}</p>
            <div className='grid grid-cols-2 gap-3'>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Marca</label><input name='marca' value={form.marca||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Modelo</label><input name='modelo' value={form.modelo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
              <div><label className='block text-xs font-medium text-gray-700 mb-1'>Serie</label><input name='numeroSerie' value={form.numeroSerie||''} onChange={h} onBlur={(e)=>validarUnico('numeroSerie', e.target.value)} required className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.numeroSerie ? 'border-red-500 bg-red-50' : 'border-gray-300')} />{errores.numeroSerie && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              <div className='relative'><label className='block text-xs font-medium text-gray-700 mb-1'>Codigo AF</label><div className='flex gap-1'><input name='codigoActivo' value={form.codigoActivo||''} onChange={h} onBlur={(e)=>validarUnico('codigoActivo', e.target.value)} className={'w-full p-2.5 border rounded-lg bg-white text-sm ' + (errores.codigoActivo ? 'border-red-500 bg-red-50' : 'border-gray-300')} /><button type='button' onClick={() => escanearParaCampo('codigoActivo')} className='bg-gray-200 p-2.5 rounded-lg'><Barcode size={18} className='text-gray-700' /></button></div>{errores.codigoActivo && <p className='text-xs text-red-500 mt-1'>¡Repetido!</p>}</div>
              {form.tipo !== 'Switch' && <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Conexion</label><select name='conexionImpresora' value={form.conexionImpresora||'En Red'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>En Red</option><option>Por USB</option></select></div>}
              {(form.tipo === 'Switch' || form.conexionImpresora === 'En Red') && (<><div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div><div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div></>)}
              <OficinaSelect req={true} /><PisoInput req={true} />
              <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Asignacion</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
            </div>
          </div>
        )}

        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Notas</label><textarea name='notas' value={form.notas||''} onChange={h} rows='2' className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' placeholder='Observaciones...'></textarea></div>
        {activo && (<div className='bg-white p-4 rounded-xl shadow-sm flex flex-col items-center gap-3 border border-gray-200'><h3 className='font-bold text-gray-700 flex items-center gap-2'><QrCode size={20} /> Código QR del Activo</h3><div id='qr-canvas-container' className='p-4 bg-white border-2 border-gray-100 rounded-lg'><QRCodeCanvas value={generarDatosQR(form)} size={180} level='M' /></div><button type='button' onClick={compartirQR} className='w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm'><Share2 size={18} /> Compartir QR</button></div>)}
        <div className='bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3'><p className='text-xs font-bold text-gray-600'>EVIDENCIA FOTOGRÁFICA (OPCIONAL)</p><div className='grid grid-cols-2 gap-4'><div className='text-center'>{form.fotoEquipo ? (<div className='relative'><img src={form.fotoEquipo} alt='Foto Equipo' className='w-full h-32 object-cover rounded-lg border' /><button type='button' onClick={() => eliminarFoto('fotoEquipo')} className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md'><X size={14} /></button></div>) : (<button type='button' onClick={() => tomarFoto('fotoEquipo')} className='w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 active:bg-gray-100'><CameraIcon size={24} /><span className='text-xs mt-1 font-bold'>Foto del Equipo</span></button>)}</div><div className='text-center'>{form.fotoSerie ? (<div className='relative'><img src={form.fotoSerie} alt='Foto Serie' className='w-full h-32 object-cover rounded-lg border' /><button type='button' onClick={() => eliminarFoto('fotoSerie')} className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md'><X size={14} /></button></div>) : (<button type='button' onClick={() => tomarFoto('fotoSerie')} className='w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 active:bg-gray-100'><CameraIcon size={24} /><span className='text-xs mt-1 font-bold'>Foto N° de Serie</span></button>)}</div></div></div>
        {activo && (<div className='bg-gray-50 p-3 rounded-lg border border-gray-200'><button type='button' onClick={() => setVerBitacora(!verBitacora)} className='w-full flex justify-between items-center font-bold text-gray-700'><span className='flex items-center gap-2'><History size={18} /> Ver Bitácora ({(form.historial || []).length})</span><ChevronDown size={18} className={verBitacora ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>{verBitacora && (<div className='mt-3 space-y-2 max-h-48 overflow-y-auto'>{(form.historial || []).length === 0 ? <p className='text-xs text-gray-400 text-center py-2'>Sin movimientos.</p> : (form.historial || []).slice().reverse().map((h, i) => (<div key={i} className='text-xs bg-white p-2 rounded border-l-4 border-blue-400 shadow-sm'><p className='font-bold text-gray-500'>[{h.fecha}]</p><p className='text-gray-700 mt-1'>{h.nota}</p></div>))}</div>)}</div>)}
        <div className='flex gap-3 pt-2'><button type='submit' className='flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2'><Save size={20} /> Guardar</button>{activo && <button type='button' onClick={handleEliminar} className='bg-red-100 text-red-600 px-4 rounded-lg font-bold'><Trash2 size={20} /></button>}</div>
      </form>
    </div>
  );
}

function CamposSpecs({ form, setForm, handleProcesador, formatMemory }) {
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className='bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400 space-y-3'>
      <p className='text-xs font-bold text-purple-600'>ESPECIFICACIONES</p>
      <div className='grid grid-cols-2 gap-3'>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Procesador</label><input name='procesador' value={form.procesador||''} onChange={handleProcesador} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>Generacion</label><input name='generacion' value={form.generacion||''} readOnly className='w-full p-2.5 border border-gray-300 rounded-lg bg-gray-100 text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>RAM</label><input name='ram' value={form.ram||''} onChange={h} onBlur={() => formatMemory('ram')} placeholder='Ej: 8' className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>S.O.</label><input name='sistemaOperativo' value={form.sistemaOperativo||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>MAC</label><input name='mac' value={form.mac||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><label className='block text-xs font-medium text-gray-700 mb-1'>IP</label><input name='ip' value={form.ip||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
      </div>
      <div className='border-t border-purple-200 pt-3 mt-2 grid grid-cols-2 gap-3'>
        <div><p className='text-xs font-bold text-purple-800 mb-1'>DISCO 1</p><select name='tipoDisco' value={form.tipoDisco||'SSD M.2'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm mb-1'><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select><input name='capacidadDisco' value={form.capacidadDisco||''} onChange={h} onBlur={() => formatMemory('capacidadDisco')} placeholder='Ej: 256' className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
        <div><p className='text-xs font-bold text-purple-800 mb-1'>DISCO 2</p><select name='tipoDisco2' value={form.tipoDisco2||'Ninguno'} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm mb-1'><option>Ninguno</option><option>SSD M.2</option><option>SSD SATA</option><option>HDD</option><option>M.2 NVMe</option></select><input name='capacidadDisco2' value={form.capacidadDisco2||''} onChange={h} onBlur={() => formatMemory('capacidadDisco2')} disabled={form.tipoDisco2==='Ninguno'} placeholder='Ej: 512' className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
      </div>
    </div>
  );
}

function CamposUbicacion({ form, h, OficinaSelect, PisoInput }) {
  return (
    <div className='bg-green-50 p-3 rounded-lg border-l-4 border-green-400 space-y-3'>
      <p className='text-xs font-bold text-green-700'>UBICACION Y ASIGNACION</p>
      <label className='flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-indigo-200 cursor-pointer'><input type='checkbox' name='enAlmacen' checked={form.enAlmacen || false} onChange={h} className='w-5 h-5 accent-indigo-600' /><div><span className='font-bold text-indigo-700'>Marcar como 'En Almacen'</span><p className='text-xs text-gray-500'>Quita la asignacion del equipo.</p></div></label>
      {!form.enAlmacen ? (
        <div className='grid grid-cols-2 gap-3'>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Estado</label><select name='estado' value={form.estado} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm'><option>Activo</option><option>En Mantenimiento</option><option>Danado</option></select></div>
          <PisoInput req={true} /><OficinaSelect req={true} />
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Nro. Empleado</label><input name='numeroEmpleado' value={form.numeroEmpleado||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Cargo</label><input name='cargo' value={form.cargo||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Persona Asignada</label><input name='personaAsignada' value={form.personaAsignada||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div><label className='block text-xs font-medium text-gray-700 mb-1'>Responsable</label><input name='nombreResponsable' value={form.nombreResponsable||''} onChange={h} required className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
          <div className='col-span-2'><label className='block text-xs font-medium text-gray-700 mb-1'>Fecha Asignacion</label><input type='date' name='fechaAsignacion' value={form.fechaAsignacion||''} onChange={h} className='w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm' /></div>
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
