import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Save, Edit2, X, LogOut, Users, Search, TrendingUp, Clock, Key, Building2, Briefcase, Download, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import EmptyState from './components/EmptyState';
import ModemCard from './components/ModemCard';
import Layout from './components/Layout';


const FIREBASE_URL = 'https://gestor-modems-default-rtdb.firebaseio.com';

export default function App() {
  
  const [user, setUser] = useState(null);
  const [loginMode, setLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ usuario: '', contraseña: '' });
  const [users, setUsers] = useState([]);
  const [modems, setModems] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showTiendas, setShowTiendas] = useState(false);
  const [showProveedores, setShowProveedores] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [formData, setFormData] = useState({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
  const [newTienda, setNewTienda] = useState({ nombre: '', asesor: '' });
  const [newProveedor, setNewProveedor] = useState({ nombre: '' });
  const [newUser, setNewUser] = useState({ usuario: '', contraseña: '', esAdmin: false });
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' });
  const [search, setSearch] = useState('');
  const [filterT, setFilterT] = useState('');
  const [filterP, setFilterP] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTId, setEditTId] = useState(null);
  const [editPId, setEditPId] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => { 
    loadUsers();
    checkSessionAsync();
  }, []);

  const checkSessionAsync = async () => {
    try {
      const sessionId = window.location.hash.split('session=')[1];
      if (sessionId) {
        const d = await fetch_get('sessions/' + sessionId);
        if (d) setUser(d);
      }
    } catch { }
  };

  useEffect(() => { 
    if (user) { 
      loadModems(); 
      loadTiendas(); 
      loadProveedores(); 
      loadHistorial(); 
    } 
  }, [user]);

  const fetch_get = async (path) => {
    try {
      const r = await fetch(FIREBASE_URL + '/' + path + '.json');
      return r.ok ? await r.json() : null;
    } catch { return null; }
  };

  const fetch_set = async (path, data) => {
    try {
      const r = await fetch(FIREBASE_URL + '/' + path + '.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return r.ok;
    } catch { return false; }
  };

  const loadUsers = async () => {
    const d = await fetch_get('users');
    setUsers(d ? Object.values(d) : []);
  };

  const saveUsers = async (list) => {
    const obj = {};
    list.forEach((u, i) => { obj['u' + i] = u; });
    const ok = await fetch_set('users', obj);
    if (ok) setUsers(list);
    return ok;
  };

  const loadTiendas = async () => {
    const d = await fetch_get('tiendas');
    setTiendas(d ? Object.values(d) : []);
  };

  const saveTiendas = async (list) => {
    const ok = await fetch_set('tiendas', list);
    if (ok) setTiendas(list);
    return ok;
  };

  const loadProveedores = async () => {
    const d = await fetch_get('proveedores');
    setProveedores(d ? Object.values(d) : []);
  };

  const saveProveedores = async (list) => {
    const ok = await fetch_set('proveedores', list);
    if (ok) setProveedores(list);
    return ok;
  };

  const loadModems = async () => {
    try {
      const d = await fetch_get('modems/' + user.id);
      setModems(d ? Object.values(d) : []);
      setStatus('✓ Conectado');
    } catch { setStatus('Error'); }
  };

  const loadHistorial = async () => {
    const d = await fetch_get('historial/' + user.id);
    if (d) setHistorial(Array.isArray(d) ? d : Object.values(d));
  };

  const addHist = (accion, detalles) => {
    const h = { id: 'h' + Date.now(), usuario: user.usuario, accion, detalles, fecha: new Date().toLocaleString('es-MX') };
    const lista = [h, ...historial].slice(0, 100);
    fetch_set('historial/' + user.id, lista).then(ok => {
      if (ok) setHistorial(lista);
    });
  };

  const handleLogin = () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa los campos');
    const u = users.find(x => x.usuario === loginData.usuario && x.contraseña === loginData.contraseña);
    if (u) {
      setUser(u);
      const sessionId = 'session_' + Date.now();
      fetch_set('sessions/' + sessionId, u).then(() => {
        window.location.hash = 'session=' + sessionId;
        setLoginData({ usuario: '', contraseña: '' });
      });
    } else alert('Datos incorrectos');
  };

  const handleRegister = async () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa los campos');
    if (users.some(x => x.usuario === loginData.usuario)) return alert('Usuario existe');
    const u = { id: 'u' + Date.now(), usuario: loginData.usuario, contraseña: loginData.contraseña, esAdmin: users.length === 0 };
    const ok = await saveUsers([...users, u]);
    if (ok) {
      if (u.esAdmin) setUser(u);
      else alert('Registrado');
      setLoginData({ usuario: '', contraseña: '' });
    }
  };

  const logout = () => {
    setUser(null);
    window.location.hash = '';
  };

  const updatePass = async () => {
    if (!passData.actual || !passData.nueva || !passData.confirmar) return alert('Completa los campos');
    if (passData.actual !== user.contraseña) return alert('Contraseña incorrecta');
    if (passData.nueva !== passData.confirmar) return alert('No coinciden');
    const actualizado = { ...user, contraseña: passData.nueva };
    const ok = await saveUsers(users.map(x => x.id === user.id ? actualizado : x));
    if (ok) {
      setUser(actualizado);
      setShowProfile(false);
      setPassData({ actual: '', nueva: '', confirmar: '' });
      alert('Actualizado');
    }
  };

  const addTienda = () => {
    if (!newTienda.nombre) return alert('Completa el nombre');
    const t = { id: 't' + Date.now(), nombre: newTienda.nombre, asesor: newTienda.asesor || 'Sin asignar' };
    saveTiendas([...tiendas, t]).then(ok => {
      if (ok) { setNewTienda({ nombre: '', asesor: '' }); addHist('Crear tienda', t.nombre); }
    });
  };

  const editTienda = () => {
    const updated = tiendas.map(x => x.id === editTId ? { ...newTienda, id: editTId } : x);
    saveTiendas(updated).then(ok => {
      if (ok) { setEditTId(null); setNewTienda({ nombre: '', asesor: '' }); addHist('Editar tienda', newTienda.nombre); }
    });
  };

  const delTienda = (id) => {
    setConfirmMsg('¿Eliminar?');
    setConfirmAction(() => async () => {
      const t = tiendas.find(x => x.id === id);
      const ok = await saveTiendas(tiendas.filter(x => x.id !== id));
      if (ok) { await addHist('Eliminar tienda', t.nombre); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const addProveedor = () => {
    if (!newProveedor.nombre) return alert('Completa el nombre');
    const p = { id: 'p' + Date.now(), nombre: newProveedor.nombre };
    saveProveedores([...proveedores, p]).then(ok => {
      if (ok) { setNewProveedor({ nombre: '' }); addHist('Crear proveedor', p.nombre); }
    });
  };

  const editProveedor = () => {
    const updated = proveedores.map(x => x.id === editPId ? { ...newProveedor, id: editPId } : x);
    saveProveedores(updated).then(ok => {
      if (ok) { setEditPId(null); setNewProveedor({ nombre: '' }); addHist('Editar proveedor', newProveedor.nombre); }
    });
  };

  const delProveedor = (id) => {
    setConfirmMsg('¿Eliminar?');
    setConfirmAction(() => async () => {
      const p = proveedores.find(x => x.id === id);
      const ok = await saveProveedores(proveedores.filter(x => x.id !== id));
      if (ok) { await addHist('Eliminar proveedor', p.nombre); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const addModem = () => {
    if (!formData.tienda || !formData.proveedor || !formData.serie) return alert('Campos requeridos');
    const m = { ...formData, id: editId || 'm' + Date.now() };
    const lista = editId ? modems.map(x => x.id === editId ? m : x) : [...modems, m];
    const obj = {};
    lista.forEach((x, i) => { obj['m' + i] = x; });
    fetch_set('modems/' + user.id, obj).then(ok => {
      if (ok) {
        setModems(lista);
        addHist(editId ? 'Editar' : 'Crear', formData.tienda + ' - ' + formData.serie);
        setFormData({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
        setShowForm(false);
        setEditId(null);
      }
    });
  };

  const delModem = (id) => {
    setConfirmMsg('¿Eliminar?');
    setConfirmAction(() => async () => {
      const m = modems.find(x => x.id === id);
      const lista = modems.filter(x => x.id !== id);
      const obj = {};
      lista.forEach((x, i) => { obj['m' + i] = x; });
      const ok = await fetch_set('modems/' + user.id, obj);
      if (ok) { setModems(lista); await addHist('Eliminar módem', m.tienda + ' - ' + m.serie); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const editModem = (m) => {
    setFormData({ tienda: m.tienda, proveedor: m.proveedor, serie: m.serie, modelo: m.modelo, fotos: m.fotos || [] });
    setEditId(m.id);
    setShowForm(true);
  };

  const uploadImg = (e) => {
    const files = Array.from(e.target.files);
    if (formData.fotos.length + files.length > 3) return alert('Máximo 3');
    files.forEach(f => {
      const r = new FileReader();
      r.onload = (ev) => setFormData(p => ({ ...p, fotos: [...p.fotos, ev.target.result] }));
      r.readAsDataURL(f);
    });
  };

  const removeImg = (i) => setFormData(p => ({ ...p, fotos: p.fotos.filter((_, x) => x !== i) }));

  const exportData = () => {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(modems, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modems_' + new Date().toISOString().split('T')[0] + '.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Error'); }
  };

  const exportTiendasExcel = () => {
    try {
      const data = tiendas.map(t => ({
        'Nombre': t.nombre,
        'Asesor TI': t.asesor
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tiendas');
      
      XLSX.writeFile(wb, `Tiendas_${new Date().toISOString().split('T')[0]}.xlsx`);
      addHist('Exportar Excel', 'Tiendas exportadas');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar Excel');
    }
  };

  const importTiendasExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const nuevasTiendas = json.map(row => ({
          id: 't' + Date.now() + Math.random(),
          nombre: row['Nombre'] || row['nombre'] || '',
          asesor: row['Asesor TI'] || row['asesor'] || 'Sin asignar'
        }));
        
        if (nuevasTiendas.length === 0) {
          alert('No se encontraron datos válidos en el archivo');
          return;
        }
        
        saveTiendas([...tiendas, ...nuevasTiendas]).then(ok => {
          if (ok) {
            alert(`${nuevasTiendas.length} tiendas importadas correctamente`);
            addHist('Importar Excel', `${nuevasTiendas.length} tiendas`);
          }
        });
      } catch (error) {
        console.error('Error al importar:', error);
        alert('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const exportProveedoresExcel = () => {
    try {
      const data = proveedores.map(p => ({
        'Nombre': p.nombre
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
      
      XLSX.writeFile(wb, `Proveedores_${new Date().toISOString().split('T')[0]}.xlsx`);
      addHist('Exportar Excel', 'Proveedores exportados');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar Excel');
    }
  };

  const importProveedoresExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const nuevosProveedores = json.map(row => ({
          id: 'p' + Date.now() + Math.random(),
          nombre: row['Nombre'] || row['nombre'] || ''
        }));
        
        if (nuevosProveedores.length === 0) {
          alert('No se encontraron datos válidos en el archivo');
          return;
        }
        
        saveProveedores([...proveedores, ...nuevosProveedores]).then(ok => {
          if (ok) {
            alert(`${nuevosProveedores.length} proveedores importados correctamente`);
            addHist('Importar Excel', `${nuevosProveedores.length} proveedores`);
          }
        });
      } catch (error) {
        console.error('Error al importar:', error);
        alert('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };
    const generatePDFByTienda = async (tiendaNombre) => {
  try {
    const tiendaModems = modems.filter(m => m.tienda === tiendaNombre);
    
    if (tiendaModems.length === 0) {
      alert('No hay módems en esta tienda');
      return;
    }

    const fecha = new Date().toLocaleDateString('es-MX');
  
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2563eb; text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          .info { text-align: center; color: #666; margin-bottom: 20px; }
          .modem { 
            border: 2px solid #e5e7eb; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .modem-header { 
            background: #3b82f6; 
            color: white; 
            padding: 10px; 
            border-radius: 5px;
            margin-bottom: 10px;
          }
          .modem-info p { margin: 5px 0; }
          .modem-info strong { color: #1e40af; }
          .fotos { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
          .foto { width: 150px; height: 150px; object-fit: cover; border: 2px solid #ddd; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Módems - ${tiendaNombre}</h1>
        <p class="info">Generado: ${fecha} | Total: ${tiendaModems.length} módems</p>
    `;

    for (const m of tiendaModems) {
      html += `
        <div class="modem">
          <div class="modem-header">
            <h2 style="margin: 0;">${m.serie}</h2>
          </div>
          <div class="modem-info">
            <p><strong>Proveedor:</strong> ${m.proveedor}</p>
            <p><strong>Modelo:</strong> ${m.modelo || 'No especificado'}</p>
          </div>
      `;

      if (m.fotos && m.fotos.length > 0) {
        html += '<div class="fotos">';
        m.fotos.forEach(foto => {
          html += `<img src="${foto}" class="foto" alt="Foto" />`;
        });
        html += '</div>';
      }

      html += '</div>';
    }

    html += '</body></html>';

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${tiendaNombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Archivo generado. Ábrelo y usa Ctrl+P para imprimir a PDF');
    addHist('Generar PDF', 'Tienda: ' + tiendaNombre);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar archivo');
  }
}
  const filtered = modems.filter(m => {
    const s = search.toLowerCase();
    const match = m.tienda.toLowerCase().includes(s) || m.proveedor.toLowerCase().includes(s) || m.serie.toLowerCase().includes(s);
    return match && (!filterT || m.tienda === filterT) && (!filterP || m.proveedor === filterP);
  });

  const tiendasList = tiendas.map(t => t.nombre);
  const proveedoresList = proveedores.map(p => p.nombre);

  if (!user) {
    return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 w-full max-w-md">

          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mb-4">
              <Building2 size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">Gestor Módems</h1>
            <p className="text-gray-600 font-medium">v3.0 Profesional</p>
          </div>
          {loginMode ? (
            <div className="space-y-4">
              <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
              <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
              <button onClick={handleLogin} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">Iniciar Sesión</button>
              <button onClick={() => setLoginMode(false)} className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all">Crear Cuenta</button>
            </div>
          ) : (
            <div className="space-y-4">
              <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all" />
              <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all" />
              <button onClick={handleRegister} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">Registrarse</button>
              <button onClick={() => setLoginMode(true)} className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all">Volver</button>
              {users.length === 0 && <p className="text-center text-green-600 font-bold text-sm bg-green-50 py-2 rounded-lg">✓ Serás ADMINISTRADOR</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="app-container">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Gestor de Módems</h1>
              <p className="text-sm text-gray-600 mt-2 font-semibold">{status}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Key size={20} /></button>
              <button onClick={logout} className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><LogOut size={20} /></button>
            </div>
          </div>
    
          {showProfile && (
            <div className="bg-indigo-50 p-6 rounded-lg mb-6 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold mb-4">Perfil</h2>
              <p className="text-sm mb-3"><strong>Usuario:</strong> {user.usuario}</p>
              <p className="text-sm mb-4"><strong>Rol:</strong> {user.esAdmin ? 'Admin' : 'Usuario'}</p>
              <input type="password" value={passData.actual} onChange={(e) => setPassData({...passData, actual: e.target.value})} placeholder="Contraseña actual" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="password" value={passData.nueva} onChange={(e) => setPassData({...passData, nueva: e.target.value})} placeholder="Nueva" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="password" value={passData.confirmar} onChange={(e) => setPassData({...passData, confirmar: e.target.value})} placeholder="Confirmar" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3" />
              <div className="flex gap-3">
                <button onClick={updatePass} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg">Actualizar</button>
                <button onClick={() => setShowProfile(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cerrar</button>
              </div>
            </div>
          )}

          {showTiendas && user.esAdmin && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">

              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Tiendas</h2>
              
              <div className="flex gap-2 mb-4">
                <button onClick={exportTiendasExcel} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                  <FileSpreadsheet size={18} />Exportar Excel
                </button>
                <label className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <Upload size={18} />Importar Excel
                  <input type="file" accept=".xlsx,.xls" onChange={importTiendasExcel} className="hidden" />
                </label>
              </div>

              <input type="text" value={newTienda.nombre} onChange={(e) => setNewTienda({...newTienda, nombre: e.target.value})} placeholder="Nombre" className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl mb-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
              <input type="text" value={newTienda.asesor} onChange={(e) => setNewTienda({...newTienda, asesor: e.target.value})} placeholder="Asesor TI" className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl mb-3 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
              <div className="flex gap-2 mb-4">
                <button onClick={editTId ? editTienda : addTienda} className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">Guardar</button>
                <button onClick={() => {setEditTId(null); setNewTienda({nombre: '', asesor: ''});}} className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">Cancelar</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {tiendas.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-orange-200 shadow-md hover:shadow-lg transition-all">
                    <div><p className="font-bold text-lg">{t.nombre}</p><p className="text-sm text-gray-600">{t.asesor}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => generatePDFByTienda(t.nombre)} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all" title="Generar PDF"><Download size={18} /></button>
                      <button onClick={() => {setNewTienda(t); setEditTId(t.id);}} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => delTienda(t.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowTiendas(false)} className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">Cerrar</button>
            </div>
          )}

          {showProveedores && user.esAdmin && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl mb-6 border-4 border-cyan-300 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Proveedores</h2>
              
              <div className="flex gap-2 mb-4">
                <button onClick={exportProveedoresExcel} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                  <FileSpreadsheet size={18} />Exportar Excel
                </button>
                <label className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  <Upload size={18} />Importar Excel
                  <input type="file" accept=".xlsx,.xls" onChange={importProveedoresExcel} className="hidden" />
                </label>
              </div>

              <input type="text" value={newProveedor.nombre} onChange={(e) => setNewProveedor({nombre: e.target.value})} placeholder="Nombre" className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl mb-3 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all" />
              <div className="flex gap-2 mb-4">
                <button onClick={editPId ? editProveedor : addProveedor} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">Guardar</button>
                <button onClick={() => {setEditPId(null); setNewProveedor({nombre: ''});}} className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-4 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">Cancelar</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {proveedores.map(p => (
                  <div key={p.id} className="flex justify-between bg-white p-4 rounded-xl border-2 border-cyan-200 shadow-md hover:shadow-lg transition-all">
                    <p className="font-bold text-lg">{p.nombre}</p>
                    <div className="flex gap-2">
                      <button onClick={() => {setNewProveedor(p); setEditPId(p.id);}} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => delProveedor(p.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowProveedores(false)} className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">Cerrar</button>
            </div>
          )}

          {showUsers && user.esAdmin && (
            <div className="bg-amber-50 p-6 rounded-lg mb-6 border-2 border-amber-200">
              <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
              <input type="text" value={newUser.usuario} onChange={(e) => setNewUser({...newUser, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="password" value={newUser.contraseña} onChange={(e) => setNewUser({...newUser, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3" />
              <label className="flex items-center gap-2 mb-3"><input type="checkbox" checked={newUser.esAdmin} onChange={(e) => setNewUser({...newUser, esAdmin: e.target.checked})} className="w-4 h-4" />Admin</label>
              <button onClick={() => {
                if (!newUser.usuario || !newUser.contraseña) return alert('Completa los campos');
                if (users.some(x => x.usuario === newUser.usuario)) return alert('Usuario existe');
                const u = { id: 'u' + Date.now(), usuario: newUser.usuario, contraseña: newUser.contraseña, esAdmin: newUser.esAdmin };
                saveUsers([...users, u]).then(() => { 
                  setNewUser({usuario: '', contraseña: '', esAdmin: false}); 
                  alert('Creado'); 
                  addHist('Crear usuario', u.usuario);
                });
              }} className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg mb-4">Crear</button>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between bg-white p-3 rounded border border-amber-200">
                    <div className="flex gap-2"><span>{u.usuario}</span>{u.esAdmin && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">ADMIN</span>}</div>
                    {user.id !== u.id && <button onClick={() => {setConfirmMsg('¿Eliminar usuario?'); setConfirmAction(() => () => {saveUsers(users.filter(x => x.id !== u.id)).then(() => { setShowConfirm(false); })}); setShowConfirm(true);}} className="text-red-600"><Trash2 size={18} /></button>}
                  </div>
                ))}
              </div>
              <button onClick={() => setShowUsers(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showStats && (
            <div className="bg-green-50 p-6 rounded-lg mb-6 border-2 border-green-200">
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded border border-green-300"><p className="text-sm">Módems</p><p className="text-3xl font-bold text-green-600">{modems.length}</p></div>
                <div className="bg-white p-4 rounded border border-green-300"><p className="text-sm">Tiendas</p><p className="text-3xl font-bold text-blue-600">{tiendas.length}</p></div>
                <div className="bg-white p-4 rounded border border-green-300"><p className="text-sm">Proveedores</p><p className="text-3xl font-bold text-purple-600">{proveedores.length}</p></div>
              </div>
              <button onClick={() => setShowStats(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showHistorial && (
            <div className="bg-purple-50 p-6 rounded-lg mb-6 border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Historial</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                {historial.map(h => (
                  <div key={h.id} className="bg-white p-3 rounded border border-purple-200">
                    <p className="font-semibold text-purple-700">{h.accion}</p>
                    <p className="text-sm text-gray-600">{h.detalles}</p>
                    <span className="text-xs text-gray-500">{h.fecha}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHistorial(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <p className="text-gray-600 mb-6">{confirmMsg}</p>
                <div className="flex gap-3">
                  <button onClick={() => confirmAction && confirmAction()} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg">Eliminar</button>
                  <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {!showForm && !showStats && !showHistorial && !showTiendas && !showProveedores && !showProfile && !showUsers && (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {user.esAdmin && (
                  <>
                    <button onClick={() => setShowTiendas(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Building2 size={20} />Tiendas</button>
                    <button onClick={() => setShowProveedores(true)} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Briefcase size={20} />Proveedores</button>
                    <button onClick={() => setShowUsers(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Users size={20} />Usuarios</button>
                  </>
                )}
                <button onClick={() => setShowStats(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><TrendingUp size={20} />Estadísticas</button>
                <button onClick={() => setShowHistorial(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Clock size={20} />Historial</button>
                <button onClick={exportData} className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Download size={20} /></button>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Plus size={20} />Nuevo</button>
              </div>

              <div className="mb-6 flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <select value={filterT} onChange={(e) => setFilterT(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Todas las tiendas</option>
                  {tiendasList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterP} onChange={(e) => setFilterP(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Todos los proveedores</option>
                  {proveedoresList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}

          {showForm && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
 ">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{editId ? 'Editar' : 'Nuevo'} Módem</h2>
              <select value={formData.tienda} onChange={(e) => setFormData({...formData, tienda: e.target.value})} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl mb-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                <option value="">Seleccionar Tienda</option>
                {tiendasList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={formData.proveedor} onChange={(e) => setFormData({...formData, proveedor: e.target.value})} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl mb-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                <option value="">Seleccionar Proveedor</option>
                {proveedoresList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="text" value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})} placeholder="Número de Serie *" className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl mb-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
              <input type="text" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} placeholder="Modelo" className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl mb-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
              
              <h3 className="font-bold mb-3 text-lg">Fotos ({formData.fotos.length}/3)</h3>
              
              <div className="mb-4 flex flex-wrap gap-4">
                {formData.fotos.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={f} alt="foto" className="w-32 h-32 object-cover rounded-xl border-4 border-blue-200 shadow-lg group-hover:scale-105 transition-transform" />
                    <button onClick={() => removeImg(i)} className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"><X size={16} /></button>
                  </div>
                ))}
                {formData.fotos.length < 3 && (
                  <>
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-4 border-dashed border-purple-400 rounded-xl cursor-pointer hover:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 hover:scale-105 transition-all shadow-lg">
                      <Plus size={32} className="text-purple-500 mb-2" />
                      <span className="text-xs text-purple-600 font-bold">Subir archivo</span>
                      <input type="file" accept="image/*" onChange={uploadImg} className="hidden" multiple />
                    </label>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={addModem} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Save size={20} />Guardar</button>
                <button onClick={() => {setShowForm(false); setEditId(null); setFormData({tienda: '', proveedor: '', serie: '', modelo: '', fotos: []});}} className="bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">Cancelar</button>
              </div>
            </div>
          )}

          {!showForm && !showStats && !showHistorial && !showTiendas && !showProveedores && !showProfile && !showUsers && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.length === 0 ? (
                  <EmptyState text="No hay módems registrados" />
                  ) : (
                  filtered.map(m => (
                    <ModemCard
                      key={m.id}
                      modem={m}
                      onEdit={() => editModem(m)}
                      onDelete={() => delModem(m.id)}
                   />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
}