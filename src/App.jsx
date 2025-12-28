import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, LogOut, Users, TrendingUp, Clock, Key, Building2, Download, Briefcase } from 'lucide-react';

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
  const [status, setStatus] = useState('Cargando...');
  const [showExportPDF, setShowExportPDF] = useState(false);
  const [selectedTiendaPDF, setSelectedTiendaPDF] = useState('');

  useEffect(() => { loadUsers(); checkSession(); }, []);
  useEffect(() => { if (user) { loadAll(); } }, [user]);

  const loadAll = () => {
    loadModems();
    loadTiendas();
    loadProveedores();
    loadHistorial();
  };

  const checkSession = async () => {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes('session=')) {
        const sessionId = hash.split('session=')[1];
        const d = await fetchGet(`sessions/${sessionId}`);
        if (d && d.usuario) setUser(d);
      }
    } catch (e) { console.error(e); }
  };

  const fetchGet = async (path) => {
    try {
      const r = await fetch(`${FIREBASE_URL}/${path}.json`);
      return r.ok ? await r.json() : null;
    } catch { return null; }
  };

  const fetchSet = async (path, data) => {
    try {
      const r = await fetch(`${FIREBASE_URL}/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return r.ok;
    } catch { return false; }
  };

  const loadUsers = async () => {
    const d = await fetchGet('users');
    setUsers(d ? Object.values(d) : []);
  };

  const saveUsers = async (list) => {
    const obj = {};
    list.forEach((u, i) => { obj[`u${i}`] = u; });
    const ok = await fetchSet('users', obj);
    if (ok) setUsers(list);
    return ok;
  };

  const loadTiendas = async () => {
    const d = await fetchGet('tiendas');
    setTiendas(d ? Object.values(d) : []);
  };

  const saveTiendas = async (list) => {
    const ok = await fetchSet('tiendas', list);
    if (ok) setTiendas(list);
    return ok;
  };

  const loadProveedores = async () => {
    const d = await fetchGet('proveedores');
    setProveedores(d ? Object.values(d) : []);
  };

  const saveProveedores = async (list) => {
    const ok = await fetchSet('proveedores', list);
    if (ok) setProveedores(list);
    return ok;
  };

  const loadModems = async () => {
    try {
      const d = await fetchGet(`modems/${user.id}`);
      setModems(d ? Object.values(d) : []);
      setStatus('✓ Conectado');
    } catch { setStatus('Error'); }
  };

  const loadHistorial = async () => {
    const d = await fetchGet(`historial/${user.id}`);
    if (d) setHistorial(Array.isArray(d) ? d : Object.values(d));
  };

  const addHist = (accion, detalles) => {
    const h = { id: `h${Date.now()}`, usuario: user.usuario, accion, detalles, fecha: new Date().toLocaleString('es-MX') };
    const lista = [h, ...historial].slice(0, 100);
    fetchSet(`historial/${user.id}`, lista).then(ok => { if (ok) setHistorial(lista); });
  };

  const handleLogin = async () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa los campos');
    const u = users.find(x => x.usuario === loginData.usuario && x.contraseña === loginData.contraseña);
    if (u) {
      setUser(u);
      const sessionId = `session_${Date.now()}`;
      await fetchSet(`sessions/${sessionId}`, u);
      window.location.hash = `session=${sessionId}`;
      setLoginData({ usuario: '', contraseña: '' });
    } else alert('Usuario o contraseña incorrectos');
  };

  const handleRegister = async () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa los campos');
    if (users.some(x => x.usuario === loginData.usuario)) return alert('Usuario existe');
    const u = { id: `u${Date.now()}`, usuario: loginData.usuario, contraseña: loginData.contraseña, esAdmin: users.length === 0 };
    const ok = await saveUsers([...users, u]);
    if (ok) {
      if (u.esAdmin) {
        setUser(u);
        const sessionId = `session_${Date.now()}`;
        await fetchSet(`sessions/${sessionId}`, u);
        window.location.hash = `session=${sessionId}`;
      } else alert('Registrado');
      setLoginData({ usuario: '', contraseña: '' });
    }
  };

  const logout = () => { setUser(null); window.location.hash = ''; };

  const updatePass = async () => {
    if (!passData.actual || !passData.nueva || !passData.confirmar) return alert('Completa campos');
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

  const addModem = () => {
    if (!formData.tienda || !formData.proveedor || !formData.serie) return alert('Completa campos');
    const m = { ...formData, id: editId || `m${Date.now()}` };
    const lista = editId ? modems.map(x => x.id === editId ? m : x) : [...modems, m];
    const obj = {};
    lista.forEach((x, i) => { obj[`m${i}`] = x; });
    fetchSet(`modems/${user.id}`, obj).then(ok => {
      if (ok) {
        setModems(lista);
        addHist(editId ? 'Editar' : 'Crear', `${formData.tienda} - ${formData.serie}`);
        setFormData({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
        setShowForm(false);
        setEditId(null);
      }
    });
  };

  const delModem = (id) => {
    const m = modems.find(x => x.id === id);
    setConfirmMsg(`¿Eliminar "${m.serie}"?`);
    setConfirmAction(() => async () => {
      const lista = modems.filter(x => x.id !== id);
      const obj = {};
      lista.forEach((x, i) => { obj[`m${i}`] = x; });
      const ok = await fetchSet(`modems/${user.id}`, obj);
      if (ok) { setModems(lista); addHist('Eliminar', `${m.tienda} - ${m.serie}`); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const editModem = (m) => {
    setFormData({ tienda: m.tienda, proveedor: m.proveedor, serie: m.serie, modelo: m.modelo || '', fotos: m.fotos || [] });
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
      a.download = `modems_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Error'); }
  };

  const exportPDF = async () => {
    try {
      const modemsToExport = selectedTiendaPDF 
        ? modems.filter(m => m.tienda === selectedTiendaPDF)
        : modems;

      if (modemsToExport.length === 0) {
        alert('No hay módems para exportar');
        return;
      }

      // Crear HTML para el PDF
      const fecha = new Date().toLocaleDateString('es-MX');
      const titulo = selectedTiendaPDF 
        ? `Módems - ${selectedTiendaPDF}` 
        : 'Todos los Módems';

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
            .modem-body { display: flex; gap: 15px; }
            .modem-info { flex: 1; }
            .modem-info p { margin: 5px 0; }
            .modem-info strong { color: #1e40af; }
            .fotos { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
            .foto { width: 150px; height: 150px; object-fit: cover; border: 2px solid #ddd; border-radius: 5px; }
            .no-fotos { color: #999; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>${titulo}</h1>
          <p class="info">Generado: ${fecha} | Total: ${modemsToExport.length} módems</p>
      `;

      for (const m of modemsToExport) {
        html += `
          <div class="modem">
            <div class="modem-header">
              <h2 style="margin: 0;">${m.serie}</h2>
            </div>
            <div class="modem-body">
              <div class="modem-info">
                <p><strong>Tienda:</strong> ${m.tienda}</p>
                <p><strong>Proveedor:</strong> ${m.proveedor}</p>
                <p><strong>Modelo:</strong> ${m.modelo || 'No especificado'}</p>
              </div>
            </div>
        `;

        if (m.fotos && m.fotos.length > 0) {
          html += '<div class="fotos">';
          m.fotos.forEach(foto => {
            html += `<img src="${foto}" class="foto" alt="Foto del módem" />`;
          });
          html += '</div>';
        } else {
          html += '<p class="no-fotos">Sin fotos</p>';
        }

        html += '</div>';
      }

      html += `
        </body>
        </html>
      `;

      // Crear blob y descargar
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `modems_${selectedTiendaPDF || 'todos'}_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);

      setShowExportPDF(false);
      alert('Archivo HTML generado. Ábrelo en tu navegador y usa Ctrl+P o Cmd+P para imprimir a PDF');
    } catch (err) {
      console.error(err);
      alert('Error al generar el archivo');
    }
  };

  const filtered = modems.filter(m => {
    const s = search.toLowerCase();
    const match = m.tienda.toLowerCase().includes(s) || m.proveedor.toLowerCase().includes(s) || m.serie.toLowerCase().includes(s) || (m.modelo && m.modelo.toLowerCase().includes(s));
    return match && (!filterT || m.tienda === filterT) && (!filterP || m.proveedor === filterP);
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">Gestor v3.0</h1>
          <p className="text-center text-gray-600 mb-6">Firebase</p>
          {loginMode ? (
            <div className="space-y-4">
              <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border rounded-lg" />
              <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Contraseña" className="w-full px-4 py-2 border rounded-lg" />
              <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Iniciar Sesión</button>
              <button onClick={() => setLoginMode(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">Crear Cuenta</button>
            </div>
          ) : (
            <div className="space-y-4">
              <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border rounded-lg" />
              <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border rounded-lg" />
              <button onClick={handleRegister} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">Registrarse</button>
              <button onClick={() => setLoginMode(true)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">Volver</button>
              {users.length === 0 && <p className="text-center text-green-600 text-sm">✓ Serás ADMIN</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">Gestor de Módems v3.0</h1>
              <p className="text-sm text-gray-600 mt-1">{status} - Usuario: {user.usuario} {user.esAdmin && '(Admin)'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowProfile(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"><Key size={20} /></button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"><LogOut size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {user.esAdmin && <button onClick={() => setShowTiendas(true)} className="bg-orange-100 p-4 rounded-lg hover:bg-orange-200"><Building2 className="mx-auto mb-2" /><p className="text-sm font-semibold">Tiendas</p></button>}
            {user.esAdmin && <button onClick={() => setShowProveedores(true)} className="bg-cyan-100 p-4 rounded-lg hover:bg-cyan-200"><Briefcase className="mx-auto mb-2" /><p className="text-sm font-semibold">Proveedores</p></button>}
            {user.esAdmin && <button onClick={() => setShowUsers(true)} className="bg-amber-100 p-4 rounded-lg hover:bg-amber-200"><Users className="mx-auto mb-2" /><p className="text-sm font-semibold">Usuarios</p></button>}
            <button onClick={() => setShowStats(true)} className="bg-green-100 p-4 rounded-lg hover:bg-green-200"><TrendingUp className="mx-auto mb-2" /><p className="text-sm font-semibold">Stats</p></button>
            <button onClick={() => setShowHistorial(true)} className="bg-purple-100 p-4 rounded-lg hover:bg-purple-200"><Clock className="mx-auto mb-2" /><p className="text-sm font-semibold">Historial</p></button>
            <button onClick={() => setShowExportPDF(true)} className="bg-red-100 p-4 rounded-lg hover:bg-red-200"><Download className="mx-auto mb-2" /><p className="text-sm font-semibold">PDF</p></button>
            <button onClick={exportData} className="bg-blue-100 p-4 rounded-lg hover:bg-blue-200"><Download className="mx-auto mb-2" /><p className="text-sm font-semibold">JSON</p></button>
          </div>

          {showProfile && (
            <div className="bg-indigo-50 p-6 rounded-lg mb-6 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold mb-4">Perfil</h2>
              <p className="text-sm mb-3"><strong>Usuario:</strong> {user.usuario}</p>
              <p className="text-sm mb-4"><strong>Rol:</strong> {user.esAdmin ? 'Admin' : 'Usuario'}</p>
              <input type="password" value={passData.actual} onChange={(e) => setPassData({...passData, actual: e.target.value})} placeholder="Contraseña actual" className="w-full px-4 py-2 border rounded-lg mb-2" />
              <input type="password" value={passData.nueva} onChange={(e) => setPassData({...passData, nueva: e.target.value})} placeholder="Nueva" className="w-full px-4 py-2 border rounded-lg mb-2" />
              <input type="password" value={passData.confirmar} onChange={(e) => setPassData({...passData, confirmar: e.target.value})} placeholder="Confirmar" className="w-full px-4 py-2 border rounded-lg mb-3" />
              <div className="flex gap-3">
                <button onClick={updatePass} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg">Actualizar</button>
                <button onClick={() => setShowProfile(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cerrar</button>
              </div>
            </div>
          )}

          {showStats && (
            <div className="bg-green-50 p-6 rounded-lg mb-6 border-2 border-green-200">
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded border"><p className="text-sm">Módems</p><p className="text-3xl font-bold text-green-600">{modems.length}</p></div>
                <div className="bg-white p-4 rounded border"><p className="text-sm">Tiendas</p><p className="text-3xl font-bold text-blue-600">{tiendas.length}</p></div>
                <div className="bg-white p-4 rounded border"><p className="text-sm">Proveedores</p><p className="text-3xl font-bold text-purple-600">{proveedores.length}</p></div>
              </div>
              <button onClick={() => setShowStats(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showHistorial && (
            <div className="bg-purple-50 p-6 rounded-lg mb-6 border-2 border-purple-200 max-h-96 overflow-auto">
              <h2 className="text-xl font-semibold mb-4">Historial</h2>
              <div className="space-y-2 mb-4">
                {historial.length === 0 ? <p className="text-gray-500 text-center py-4">No hay historial</p> : historial.map(h => (
                  <div key={h.id} className="bg-white p-3 rounded border">
                    <p className="font-semibold text-purple-700">{h.accion}</p>
                    <p className="text-sm text-gray-600">{h.detalles}</p>
                    <span className="text-xs text-gray-500">{h.fecha}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHistorial(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showExportPDF && (
            <div className="bg-red-50 p-6 rounded-lg mb-6 border-2 border-red-200">
              <h2 className="text-xl font-semibold mb-4">Exportar a PDF</h2>
              <p className="text-sm text-gray-600 mb-4">Selecciona una tienda específica o exporta todos los módems con sus fotos</p>
              <select 
                value={selectedTiendaPDF} 
                onChange={(e) => setSelectedTiendaPDF(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg mb-4"
              >
                <option value="">📋 Todos los módems ({modems.length})</option>
                {tiendas.map(t => {
                  const count = modems.filter(m => m.tienda === t.nombre).length;
                  return <option key={t.id} value={t.nombre}>🏪 {t.nombre} ({count} módems)</option>;
                })}
              </select>
              <div className="flex gap-3">
                <button onClick={exportPDF} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Generar PDF</button>
                <button onClick={() => {setShowExportPDF(false); setSelectedTiendaPDF('');}} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
              </div>
            </div>
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">{confirmMsg}</h3>
                <div className="flex gap-3">
                  <button onClick={() => confirmAction && confirmAction()} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg">Confirmar</button>
                  <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
              <h2 className="text-xl font-semibold mb-4">{editId ? 'Editar' : 'Nuevo'} Módem</h2>
              <div className="relative mb-2">
                <input 
                  type="text" 
                  value={formData.tienda} 
                  onChange={(e) => setFormData({...formData, tienda: e.target.value})} 
                  placeholder="Tienda (escribe para buscar)" 
                  list="tiendas-list"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <datalist id="tiendas-list">
                  {tiendas.map(t => <option key={t.id} value={t.nombre} />)}
                </datalist>
              </div>
              <div className="relative mb-2">
                <input 
                  type="text" 
                  value={formData.proveedor} 
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})} 
                  placeholder="Proveedor (escribe para buscar)" 
                  list="proveedores-list"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <datalist id="proveedores-list">
                  {proveedores.map(p => <option key={p.id} value={p.nombre} />)}
                </datalist>
              </div>
              <input type="text" value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})} placeholder="Serie" className="w-full px-4 py-2 border rounded-lg mb-2" />
              <input type="text" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} placeholder="Modelo (opcional)" className="w-full px-4 py-2 border rounded-lg mb-3" />
              <input type="file" accept="image/*" multiple onChange={uploadImg} className="w-full mb-3" />
              <div className="flex gap-2 mb-4">
                {formData.fotos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={f} alt="" className="w-20 h-20 object-cover rounded" />
                    <button onClick={() => removeImg(i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={addModem} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg">Guardar</button>
                <button onClick={() => {setShowForm(false); setEditId(null); setFormData({tienda: '', proveedor: '', serie: '', modelo: '', fotos: []});}} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="flex-1 px-4 py-2 border rounded-lg" />
            <select value={filterT} onChange={(e) => setFilterT(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="">Todas</option>
              {tiendas.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
            </select>
            <select value={filterP} onChange={(e) => setFilterP(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="">Todos</option>
              {proveedores.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
            </select>
            <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">+ Nuevo</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => (
              <div key={m.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg">{m.serie}</p>
                    <p className="text-sm text-gray-600">{m.modelo || 'Sin modelo'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editModem(m)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                    <button onClick={() => delModem(m.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </div>
                </div>
                <p className="text-sm mb-1"><strong>Tienda:</strong> {m.tienda}</p>
                <p className="text-sm mb-3"><strong>Proveedor:</strong> {m.proveedor}</p>
                {m.fotos && m.fotos.length > 0 && (
                  <div className="flex gap-2">
                    {m.fotos.map((f, i) => <img key={i} src={f} alt="" className="w-16 h-16 object-cover rounded" />)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No hay módems</p>}
        </div>
      </div>
    </div>
  );
}