import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Plus, Save, Edit2, X, LogOut, Users, Search, TrendingUp, Clock, Key, Building2, Briefcase, Download } from 'lucide-react';

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

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { if (user) { loadModems(); loadTiendas(); loadProveedores(); loadHistorial(); } }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  }, [user]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const fetch_get = async (path) => {
    try {
      const r = await fetch(`${FIREBASE_URL}/${path}.json`);
      return r.ok ? await r.json() : null;
    } catch { return null; }
  };

  const fetch_set = async (path, data) => {
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
    const d = await fetch_get('users');
    setUsers(d ? Object.values(d) : []);
  };

  const saveUsers = async (list) => {
    const obj = {};
    list.forEach((u, i) => { obj[`u${i}`] = u; });
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
      const d = await fetch_get(`modems/${user.id}`);
      setModems(d ? Object.values(d) : []);
      setStatus('✓ Conectado');
    } catch { setStatus('Error'); }
  };

  const loadHistorial = async () => {
    const d = await fetch_get(`historial/${user.id}`);
    if (d) setHistorial(Array.isArray(d) ? d : Object.values(d));
  };

  const addHist = async (accion, detalles) => {
    const h = { id: `h${Date.now()}`, usuario: user.usuario, accion, detalles, fecha: new Date().toLocaleString('es-MX') };
    const lista = [h, ...historial].slice(0, 100);
    await fetch_set(`historial/${user.id}`, lista);
    setHistorial(lista);
  };

  const handleLogin = () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa los campos');
    const u = users.find(x => x.usuario === loginData.usuario && x.contraseña === loginData.contraseña);
    if (u) {
      setUser(u);
      setLoginData({ usuario: '', contraseña: '' });
    } else alert('Datos incorrectos');
  };

  const handleRegister = async () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa los campos');
    if (users.some(x => x.usuario === loginData.usuario)) return alert('Usuario existe');
    const u = { id: `u${Date.now()}`, usuario: loginData.usuario, contraseña: loginData.contraseña, esAdmin: users.length === 0 };
    const ok = await saveUsers([...users, u]);
    if (ok) {
      if (u.esAdmin) setUser(u);
      else alert('Registrado');
      setLoginData({ usuario: '', contraseña: '' });
    }
  };

  const logout = () => setUser(null);

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

  const addTienda = async () => {
    if (!newTienda.nombre) return alert('Completa el nombre');
    const t = { id: `t${Date.now()}`, nombre: newTienda.nombre, asesor: newTienda.asesor || 'Sin asignar' };
    const ok = await saveTiendas([...tiendas, t]);
    if (ok) { setNewTienda({ nombre: '', asesor: '' }); await addHist('Crear tienda', t.nombre); }
  };

  const editTienda = async () => {
    const updated = tiendas.map(x => x.id === editTId ? { ...newTienda, id: editTId } : x);
    const ok = await saveTiendas(updated);
    if (ok) { setEditTId(null); setNewTienda({ nombre: '', asesor: '' }); await addHist('Editar tienda', newTienda.nombre); }
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

  const addProveedor = async () => {
    if (!newProveedor.nombre) return alert('Completa el nombre');
    const p = { id: `p${Date.now()}`, nombre: newProveedor.nombre };
    const ok = await saveProveedores([...proveedores, p]);
    if (ok) { setNewProveedor({ nombre: '' }); await addHist('Crear proveedor', p.nombre); }
  };

  const editProveedor = async () => {
    const updated = proveedores.map(x => x.id === editPId ? { ...newProveedor, id: editPId } : x);
    const ok = await saveProveedores(updated);
    if (ok) { setEditPId(null); setNewProveedor({ nombre: '' }); await addHist('Editar proveedor', newProveedor.nombre); }
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

  const addModem = async () => {
    if (!formData.tienda || !formData.proveedor || !formData.serie) return alert('Campos requeridos');
    const m = { ...formData, id: editId || `m${Date.now()}` };
    const lista = editId ? modems.map(x => x.id === editId ? m : x) : [...modems, m];
    const obj = {};
    lista.forEach((x, i) => { obj[`m${i}`] = x; });
    const ok = await fetch_set(`modems/${user.id}`, obj);
    if (ok) {
      setModems(lista);
      await addHist(editId ? 'Editar' : 'Crear', `${formData.tienda} - ${formData.serie}`);
      setFormData({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
      setShowForm(false);
      setEditId(null);
    }
  };

  const delModem = (id) => {
    setConfirmMsg('¿Eliminar?');
    setConfirmAction(() => async () => {
      const m = modems.find(x => x.id === id);
      const lista = modems.filter(x => x.id !== id);
      const obj = {};
      lista.forEach((x, i) => { obj[`m${i}`] = x; });
      const ok = await fetch_set(`modems/${user.id}`, obj);
      if (ok) { setModems(lista); await addHist('Eliminar módem', `${m.tienda} - ${m.serie}`); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const editModem = (m) => {
    setFormData({ tienda: m.tienda, proveedor: m.proveedor, serie: m.serie, modelo: m.modelo, fotos: m.fotos });
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

  const filtered = modems.filter(m => {
    const s = search.toLowerCase();
    const match = m.tienda.toLowerCase().includes(s) || m.proveedor.toLowerCase().includes(s) || m.serie.toLowerCase().includes(s);
    return match && (!filterT || m.tienda === filterT) && (!filterP || m.proveedor === filterP);
  });

  const tiendasList = tiendas.map(t => t.nombre);
  const proveedoresList = proveedores.map(p => p.nombre);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">Gestor v3.0</h1>
          <p className="text-center text-gray-600 mb-6">Firebase</p>
          {loginMode ? (
            <div className="space-y-4">
              <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Iniciar Sesión</button>
              <button onClick={() => setLoginMode(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">Crear Cuenta</button>
            </div>
          ) : (
            <div className="space-y-4">
              <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
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
              <p className="text-sm text-gray-600 mt-1">{status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"><Key size={20} /></button>
              <button onClick={logout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"><LogOut size={20} /></button>
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
            <div className="bg-orange-50 p-6 rounded-lg mb-6 border-2 border-orange-200">
              <h2 className="text-xl font-semibold mb-4">Tiendas</h2>
              <input type="text" value={newTienda.nombre} onChange={(e) => setNewTienda({...newTienda, nombre: e.target.value})} placeholder="Nombre" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="text" value={newTienda.asesor} onChange={(e) => setNewTienda({...newTienda, asesor: e.target.value})} placeholder="Asesor TI" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3" />
              <div className="flex gap-2 mb-4">
                <button onClick={editTId ? editTienda : addTienda} className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg">Guardar</button>
                <button onClick={() => {setEditTId(null); setNewTienda({nombre: '', asesor: ''});}} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {tiendas.map(t => (
                  <div key={t.id} className="flex justify-between bg-white p-3 rounded border border-orange-200">
                    <div><p className="font-semibold">{t.nombre}</p><p className="text-sm text-gray-600">{t.asesor}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => {setNewTienda(t); setEditTId(t.id);}} className="text-blue-600"><Edit2 size={18} /></button>
                      <button onClick={() => delTienda(t.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowTiendas(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showProveedores && user.esAdmin && (
            <div className="bg-cyan-50 p-6 rounded-lg mb-6 border-2 border-cyan-200">
              <h2 className="text-xl font-semibold mb-4">Proveedores</h2>
              <input type="text" value={newProveedor.nombre} onChange={(e) => setNewProveedor({nombre: e.target.value})} placeholder="Nombre" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3" />
              <div className="flex gap-2 mb-4">
                <button onClick={editPId ? editProveedor : addProveedor} className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg">Guardar</button>
                <button onClick={() => {setEditPId(null); setNewProveedor({nombre: ''});}} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {proveedores.map(p => (
                  <div key={p.id} className="flex justify-between bg-white p-3 rounded border border-cyan-200">
                    <p className="font-semibold">{p.nombre}</p>
                    <div className="flex gap-2">
                      <button onClick={() => {setNewProveedor(p); setEditPId(p.id);}} className="text-blue-600"><Edit2 size={18} /></button>
                      <button onClick={() => delProveedor(p.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowProveedores(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cerrar</button>
            </div>
          )}

          {showUsers && user.esAdmin && (
            <div className="bg-amber-50 p-6 rounded-lg mb-6 border-2 border-amber-200">
              <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
              <input type="text" value={newUser.usuario} onChange={(e) => setNewUser({...newUser, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="password" value={newUser.contraseña} onChange={(e) => setNewUser({...newUser, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3" />
              <label className="flex items-center gap-2 mb-3"><input type="checkbox" checked={newUser.esAdmin} onChange={(e) => setNewUser({...newUser, esAdmin: e.target.checked})} className="w-4 h-4" />Admin</label>
              <button onClick={async () => {
                if (!newUser.usuario || !newUser.contraseña) return alert('Completa los campos');
                if (users.some(x => x.usuario === newUser.usuario)) return alert('Usuario existe');
                const u = { id: `u${Date.now()}`, usuario: newUser.usuario, contraseña: newUser.contraseña, esAdmin: newUser.esAdmin };
                const ok = await saveUsers([...users, u]);
                if (ok) { setNewUser({usuario: '', contraseña: '', esAdmin: false}); alert('Creado'); await addHist('Crear usuario', u.usuario); }
              }} className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg mb-4">Crear</button>
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between bg-white p-3 rounded border border-amber-200">
                    <div className="flex gap-2"><span>{u.usuario}</span>{u.esAdmin && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">ADMIN</span>}</div>
                    {user.id !== u.id && <button onClick={() => {setConfirmMsg('¿Eliminar usuario?'); setConfirmAction(() => async () => {const ok = await saveUsers(users.filter(x => x.id !== u.id)); if (ok) { setShowConfirm(false); }}); setShowConfirm(true);}} className="text-red-600"><Trash2 size={18} /></button>}
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
                    <button onClick={() => setShowTiendas(true)} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg"><Building2 size={20} />Tiendas</button>
                    <button onClick={() => setShowProveedores(true)} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg"><Briefcase size={20} />Proveedores</button>
                    <button onClick={() => setShowUsers(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg"><Users size={20} />Usuarios</button>
                  </>
                )}
                <button onClick={() => setShowStats(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"><TrendingUp size={20} />Estadísticas</button>
                <button onClick={() => setShowHistorial(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg"><Clock size={20} />Historial</button>
                <button onClick={exportData} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg"><Download size={20} /></button>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"><Plus size={20} />Nuevo</button>
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
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">{editId ? 'Editar' : 'Nuevo'} Módem</h2>
              <select value={formData.tienda} onChange={(e) => setFormData({...formData, tienda: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                <option value="">Seleccionar Tienda</option>
                {tiendasList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={formData.proveedor} onChange={(e) => setFormData({...formData, proveedor: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                <option value="">Seleccionar Proveedor</option>
                {proveedoresList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="text" value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})} placeholder="Serie *" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2" />
              <input type="text" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} placeholder="Modelo" className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4" />
              <div className="mb-4 flex flex-wrap gap-4">
                {formData.fotos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={f} alt="foto" className="w-32 h-32 object-cover rounded border-2 border-gray-300" />
                    <button onClick={() => removeImg(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={16} /></button>
                  </div>
                ))}
                {formData.fotos.length < 3 && (
                  <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                    <Camera size={32} className="text-gray-400" />
                    <input type="file" accept="image/*" onChange={uploadImg} className="hidden" multiple />
                  </label>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={addModem} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg"><Save size={20} />Guardar</button>
                <button onClick={() => {setShowForm(false); setEditId(null); setFormData({tienda: '', proveedor: '', serie: '', modelo: '', fotos: []});}} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancelar</button>
              </div>
            </div>
          )}

          {!showForm && !showStats && !showHistorial && !showTiendas && !showProveedores && !showProfile && !showUsers && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay módems</p>
                </div>
              ) : (
                filtered.map(m => (
                  <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md">
                    <h3 className="text-lg font-semibold text-blue-700 mb-1">{m.tienda}</h3>
                    <h4 className="font-semibold text-gray-800 mb-1">{m.proveedor}</h4>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Serie:</span> {m.serie}</p>
                    {m.modelo && <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Modelo:</span> {m.modelo}</p>}
                    {m.fotos && m.fotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {m.fotos.map((f, i) => <img key={i} src={f} alt="foto" className="w-full h-20 object-cover rounded border border-gray-200" />)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => editModem(m)} className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 text-sm"><Edit2 size={16} />Editar</button>
                      <button onClick={() => delModem(m.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 text-sm"><Trash2 size={16} />Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}