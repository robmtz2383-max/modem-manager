import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Plus, Save, Edit2, X, Upload, Download, Settings, LogOut, Users, Search, TrendingUp, Clock, Key, Building2, Briefcase } from 'lucide-react';

const FIREBASE_URL = 'https://gestor-modems-default-rtdb.firebaseio.com';

export default function ModemManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginMode, setLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ usuario: '', contraseña: '' });
  const [modems, setModems] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [users, setUsers] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showTiendasModal, setShowTiendasModal] = useState(false);
  const [showProveedoresModal, setShowProveedoresModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTiendaId, setEditingTiendaId] = useState(null);
  const [editingProveedorId, setEditingProveedorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTienda, setFilterTienda] = useState('');
  const [filterProveedor, setFilterProveedor] = useState('');
  const [newTienda, setNewTienda] = useState({ nombre: '', asesor: '' });
  const [newProveedor, setNewProveedor] = useState({ nombre: '' });
  const [newUserData, setNewUserData] = useState({ usuario: '', contraseña: '', esAdmin: false });
  const [changePassData, setChangePassData] = useState({ actual: '', nueva: '', confirmar: '' });
  const [formData, setFormData] = useState({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
  const [syncStatus, setSyncStatus] = useState('Desconectado');

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { if (currentUser) { loadModems(); loadTiendas(); loadProveedores(); loadHistorial(); } }, [currentUser]);

  const firebaseGet = async (path) => {
    try {
      const response = await fetch(`${FIREBASE_URL}/${path}.json`);
      if (response.ok) return await response.json();
      return null;
    } catch { return null; }
  };

  const firebaseSet = async (path, data) => {
    try {
      const response = await fetch(`${FIREBASE_URL}/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch { return false; }
  };

  const addToHistorial = async (accion, detalles) => {
    const registro = { id: `h:${Date.now()}`, usuario: currentUser.usuario, accion, detalles, fecha: new Date().toLocaleString('es-MX') };
    const nuevo = [registro, ...historial].slice(0, 100);
    await firebaseSet(`historial/${currentUser.id}`, nuevo);
    setHistorial(nuevo);
  };

  const loadUsers = async () => {
    const data = await firebaseGet('users');
    setUsers(data ? Object.values(data) : []);
  };

  const saveUsers = async (list) => {
    const obj = {};
    list.forEach((u, i) => { obj[`u${i}`] = u; });
    const ok = await firebaseSet('users', obj);
    if (ok) setUsers(list);
    return ok;
  };

  const loadTiendas = async () => {
    const data = await firebaseGet('tiendas');
    setTiendas(data ? Object.values(data) : []);
  };

  const saveTiendas = async (list) => {
    const ok = await firebaseSet('tiendas', list);
    if (ok) setTiendas(list);
    return ok;
  };

  const loadProveedores = async () => {
    const data = await firebaseGet('proveedores');
    setProveedores(data ? Object.values(data) : []);
  };

  const saveProveedores = async (list) => {
    const ok = await firebaseSet('proveedores', list);
    if (ok) setProveedores(list);
    return ok;
  };

  const loadModems = async () => {
    try {
      const data = await firebaseGet(`modems/${currentUser.id}`);
      setModems(data ? Object.values(data) : []);
      setSyncStatus('✓ Conectado');
    } catch { setSyncStatus('Error'); }
  };

  const loadHistorial = async () => {
    const data = await firebaseGet(`historial/${currentUser.id}`);
    if (data) setHistorial(Array.isArray(data) ? data : Object.values(data));
  };

  const handleLogin = () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa usuario y contraseña');
    const user = users.find(u => u.usuario === loginData.usuario && u.contraseña === loginData.contraseña);
    if (user) {
      setCurrentUser(user);
      setLoginData({ usuario: '', contraseña: '' });
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleRegister = async () => {
    if (!loginData.usuario || !loginData.contraseña) return alert('Completa usuario y contraseña');
    if (users.some(u => u.usuario === loginData.usuario)) return alert('El usuario ya existe');
    const newUser = { id: `u:${Date.now()}`, usuario: loginData.usuario, contraseña: loginData.contraseña, esAdmin: users.length === 0 };
    const ok = await saveUsers([...users, newUser]);
    if (ok) {
      if (newUser.esAdmin) setCurrentUser(newUser);
      else alert('Usuario registrado');
      setLoginData({ usuario: '', contraseña: '' });
    }
  };

  const logout = () => setCurrentUser(null);

  const cambiarContraseña = async () => {
    if (!changePassData.actual || !changePassData.nueva) return alert('Completa los campos');
    if (changePassData.actual !== currentUser.contraseña) return alert('Contraseña incorrecta');
    if (changePassData.nueva !== changePassData.confirmar) return alert('Las contraseñas no coinciden');
    const actualizado = { ...currentUser, contraseña: changePassData.nueva };
    const ok = await saveUsers(users.map(u => u.id === currentUser.id ? actualizado : u));
    if (ok) {
      setCurrentUser(actualizado);
      setShowProfileModal(false);
      setChangePassData({ actual: '', nueva: '', confirmar: '' });
      alert('Contraseña actualizada');
      await addToHistorial('Cambio de contraseña', 'Actualizada');
    }
  };

  const addTienda = async () => {
    if (!newTienda.nombre) return alert('Completa el nombre');
    const t = { id: `t:${Date.now()}`, nombre: newTienda.nombre, asesor: newTienda.asesor || 'Sin asignar' };
    const ok = await saveTiendas([...tiendas, t]);
    if (ok) { setNewTienda({ nombre: '', asesor: '' }); await addToHistorial('Crear tienda', t.nombre); }
  };

  const editTienda = async () => {
    const updated = tiendas.map(t => t.id === editingTiendaId ? { ...newTienda, id: editingTiendaId } : t);
    const ok = await saveTiendas(updated);
    if (ok) { setEditingTiendaId(null); setNewTienda({ nombre: '', asesor: '' }); await addToHistorial('Editar tienda', newTienda.nombre); }
  };

  const deleteTienda = (id) => {
    setConfirmMessage('¿Eliminar esta tienda?');
    setConfirmAction(() => async () => {
      const t = tiendas.find(x => x.id === id);
      const ok = await saveTiendas(tiendas.filter(x => x.id !== id));
      if (ok) { await addToHistorial('Eliminar tienda', t.nombre); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const addProveedor = async () => {
    if (!newProveedor.nombre) return alert('Completa el nombre');
    const p = { id: `p:${Date.now()}`, nombre: newProveedor.nombre };
    const ok = await saveProveedores([...proveedores, p]);
    if (ok) { setNewProveedor({ nombre: '' }); await addToHistorial('Crear proveedor', p.nombre); }
  };

  const editProveedor = async () => {
    const updated = proveedores.map(p => p.id === editingProveedorId ? { ...newProveedor, id: editingProveedorId } : p);
    const ok = await saveProveedores(updated);
    if (ok) { setEditingProveedorId(null); setNewProveedor({ nombre: '' }); await addToHistorial('Editar proveedor', newProveedor.nombre); }
  };

  const deleteProveedor = (id) => {
    setConfirmMessage('¿Eliminar este proveedor?');
    setConfirmAction(() => async () => {
      const p = proveedores.find(x => x.id === id);
      const ok = await saveProveedores(proveedores.filter(x => x.id !== id));
      if (ok) { await addToHistorial('Eliminar proveedor', p.nombre); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const addModem = async () => {
    if (!formData.tienda || !formData.proveedor || !formData.serie) return alert('Campos requeridos');
    const m = { ...formData, id: editingId || `m:${Date.now()}` };
    const newList = editingId ? modems.map(x => x.id === editingId ? m : x) : [...modems, m];
    const obj = {};
    newList.forEach((x, i) => { obj[`m${i}`] = x; });
    const ok = await firebaseSet(`modems/${currentUser.id}`, obj);
    if (ok) {
      setModems(newList);
      const accion = editingId ? 'Editar' : 'Crear';
      await addToHistorial(`${accion} módem`, `${formData.tienda} - ${formData.serie}`);
      setFormData({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
      setShowForm(false);
      setEditingId(null);
    }
  };

  const deleteModem = (id) => {
    setConfirmMessage('¿Eliminar este módem?');
    setConfirmAction(() => async () => {
      const m = modems.find(x => x.id === id);
      const newList = modems.filter(x => x.id !== id);
      const obj = {};
      newList.forEach((x, i) => { obj[`m${i}`] = x; });
      const ok = await firebaseSet(`modems/${currentUser.id}`, obj);
      if (ok) { setModems(newList); await addToHistorial('Eliminar módem', `${m.tienda} - ${m.serie}`); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const editModem = (m) => {
    setFormData({ tienda: m.tienda, proveedor: m.proveedor, serie: m.serie, modelo: m.modelo, fotos: m.fotos });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.fotos.length + files.length > 3) return alert('Máximo 3 fotos');
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setFormData(p => ({ ...p, fotos: [...p.fotos, ev.target.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i) => setFormData(p => ({ ...p, fotos: p.fotos.filter((_, x) => x !== i) }));

  const exportData = () => {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(modems, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `modems_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { alert('Error'); }
  };

  const modemsFiltered = modems.filter(m => {
    const s = searchTerm.toLowerCase();
    const match = m.tienda.toLowerCase().includes(s) || m.proveedor.toLowerCase().includes(s) || m.serie.toLowerCase().includes(s);
    const tMatch = !filterTienda || m.tienda === filterTienda;
    const pMatch = !filterProveedor || m.proveedor === filterProveedor;
    return match && tMatch && pMatch;
  });

  const stats = {
    totalModems: modems.length,
    tiendas: tiendas.length,
    proveedores: proveedores.length
  };

  const tiendasList = tiendas.map(t => t.nombre);
  const proveedoresList = proveedores.map(p => p.nombre);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Gestor de Módems v3.0</h1>
          <p className="text-center text-gray-600 mb-6">Firebase</p>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setLoginMode(true)} className={`flex-1 py-2 rounded-lg font-semibold ${loginMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Iniciar</button>
            <button onClick={() => setLoginMode(false)} className={`flex-1 py-2 rounded-lg font-semibold ${!loginMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Registrarse</button>
          </div>
          <div className="space-y-4">
            <input type="text" value={loginData.usuario} onChange={(e) => setLoginData({...loginData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <input type="password" value={loginData.contraseña} onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <button onClick={loginMode ? handleLogin : handleRegister} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">{loginMode ? 'Iniciar' : 'Registrarse'}</button>
          </div>
          {users.length === 0 && !loginMode && <p className="text-center text-green-600 text-sm mt-4">✓ Serás ADMIN</p>}
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
              <p className="text-sm text-gray-600 mt-1">{syncStatus}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"><Key size={20} /></button>
              <button onClick={logout} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"><LogOut size={20} /></button>
            </div>
          </div>

          {showProfileModal && (
            <div className="bg-indigo-50 p-6 rounded-lg mb-6 border-2 border-indigo-200">
              <h2 className="text-xl font-semibold mb-4">Perfil</h2>
              <p className="text-sm mb-3"><strong>Usuario:</strong> {currentUser.usuario}</p>
              <p className="text-sm mb-4"><strong>Rol:</strong> {currentUser.esAdmin ? 'Admin' : 'Usuario'}</p>
              <div className="space-y-3">
                <input type="password" value={changePassData.actual} onChange={(e) => setChangePassData({...changePassData, actual: e.target.value})} placeholder="Contraseña actual" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="password" value={changePassData.nueva} onChange={(e) => setChangePassData({...changePassData, nueva: e.target.value})} placeholder="Nueva contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="password" value={changePassData.confirmar} onChange={(e) => setChangePassData({...changePassData, confirmar: e.target.value})} placeholder="Confirmar" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <div className="flex gap-3">
                  <button onClick={cambiarContraseña} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg">Actualizar</button>
                  <button onClick={() => setShowProfileModal(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cerrar</button>
                </div>
              </div>
            </div>
          )}

          {showTiendasModal && currentUser.esAdmin && (
            <div className="bg-orange-50 p-6 rounded-lg mb-6 border-2 border-orange-200">
              <h2 className="text-xl font-semibold mb-4">Tiendas</h2>
              <div className="space-y-3 max-w-md mb-4">
                <input type="text" value={newTienda.nombre} onChange={(e) => setNewTienda({...newTienda, nombre: e.target.value})} placeholder="Nombre" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="text" value={newTienda.asesor} onChange={(e) => setNewTienda({...newTienda, asesor: e.target.value})} placeholder="Asesor TI" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <div className="flex gap-2">
                  <button onClick={editingTiendaId ? editTienda : addTienda} className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg">Guardar</button>
                  <button onClick={() => {setEditingTiendaId(null); setNewTienda({nombre: '', asesor: ''});}} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tiendas.map(t => (
                  <div key={t.id} className="flex justify-between bg-white p-3 rounded border border-orange-200">
                    <div><p className="font-semibold">{t.nombre}</p><p className="text-sm text-gray-600">{t.asesor}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => {setNewTienda(t); setEditingTiendaId(t.id);}} className="text-blue-600"><Edit2 size={18} /></button>
                      <button onClick={() => deleteTienda(t.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowTiendasModal(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg mt-4">Cerrar</button>
            </div>
          )}

          {showProveedoresModal && currentUser.esAdmin && (
            <div className="bg-cyan-50 p-6 rounded-lg mb-6 border-2 border-cyan-200">
              <h2 className="text-xl font-semibold mb-4">Proveedores</h2>
              <div className="space-y-3 max-w-md mb-4">
                <input type="text" value={newProveedor.nombre} onChange={(e) => setNewProveedor({nombre: e.target.value})} placeholder="Nombre" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <div className="flex gap-2">
                  <button onClick={editingProveedorId ? editProveedor : addProveedor} className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg">Guardar</button>
                  <button onClick={() => {setEditingProveedorId(null); setNewProveedor({nombre: ''});}} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {proveedores.map(p => (
                  <div key={p.id} className="flex justify-between bg-white p-3 rounded border border-cyan-200">
                    <p className="font-semibold">{p.nombre}</p>
                    <div className="flex gap-2">
                      <button onClick={() => {setNewProveedor(p); setEditingProveedorId(p.id);}} className="text-blue-600"><Edit2 size={18} /></button>
                      <button onClick={() => deleteProveedor(p.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowProveedoresModal(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg mt-4">Cerrar</button>
            </div>
          )}

          {showUserForm && currentUser.esAdmin && (
            <div className="bg-amber-50 p-6 rounded-lg mb-6 border-2 border-amber-200">
              <h2 className="text-xl font-semibold mb-4">Crear Usuario</h2>
              <div className="space-y-3 max-w-md mb-4">
                <input type="text" value={newUserData.usuario} onChange={(e) => setNewUserData({...newUserData, usuario: e.target.value})} placeholder="Usuario" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="password" value={newUserData.contraseña} onChange={(e) => setNewUserData({...newUserData, contraseña: e.target.value})} placeholder="Contraseña" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <label className="flex items-center gap-2"><input type="checkbox" checked={newUserData.esAdmin} onChange={(e) => setNewUserData({...newUserData, esAdmin: e.target.checked})} className="w-4 h-4" />Admin</label>
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (!newUserData.usuario || !newUserData.contraseña) return alert('Completa los campos');
                    if (users.some(u => u.usuario === newUserData.usuario)) return alert('Usuario existe');
                    const u = { id: `u:${Date.now()}`, usuario: newUserData.usuario, contraseña: newUserData.contraseña, esAdmin: newUserData.esAdmin };
                    const ok = await saveUsers([...users, u]);
                    if (ok) { setNewUserData({usuario: '', contraseña: '', esAdmin: false}); setShowUserForm(false); alert('Usuario creado'); await addToHistorial('Crear usuario', u.usuario); }
                  }} className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg">Crear</button>
                  <button onClick={() => setShowUserForm(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cerrar</button>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.map(u => (
                  <div key={u.id} className="flex justify-between bg-white p-3 rounded border border-amber-200">
                    <div className="flex gap-2"><span>{u.usuario}</span>{u.esAdmin && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">ADMIN</span>}</div>
                    {currentUser.id !== u.id && <button onClick={() => {setConfirmMessage('¿Eliminar usuario?'); setConfirmAction(() => async () => {const ok = await saveUsers(users.filter(x => x.id !== u.id)); if (ok) { setShowConfirm(false); }}); setShowConfirm(true);}} className="text-red-600"><Trash2 size={18} /></button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showStats && (
            <div className="bg-green-50 p-6 rounded-lg mb-6 border-2 border-green-200">
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border border-green-300"><p className="text-sm">Módems</p><p className="text-3xl font-bold text-green-600">{stats.totalModems}</p></div>
                <div className="bg-white p-4 rounded border border-green-300"><p className="text-sm">Tiendas</p><p className="text-3xl font-bold text-blue-600">{stats.tiendas}</p></div>
                <div className="bg-white p-4 rounded border border-green-300"><p className="text-sm">Proveedores</p><p className="text-3xl font-bold text-purple-600">{stats.proveedores}</p></div>
              </div>
              <button onClick={() => setShowStats(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg mt-4">Cerrar</button>
            </div>
          )}

          {showHistorial && (
            <div className="bg-purple-50 p-6 rounded-lg mb-6 border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Historial</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {historial.map(r => (
                  <div key={r.id} className="bg-white p-3 rounded border border-purple-200">
                    <p className="font-semibold text-purple-700">{r.accion}</p>
                    <p className="text-sm text-gray-600">{r.detalles}</p>
                    <span className="text-xs text-gray-500">{r.fecha}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowHistorial(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg mt-4">Cerrar</button>
            </div>
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Confirmación</h2>
                <p className="text-gray-600 mb-6">{confirmMessage}</p>
                <div className="flex gap-3">
                  <button onClick={() => confirmAction && confirmAction()} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg">Eliminar</button>
                  <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {!showForm && !showStats && !showHistorial && !showTiendasModal && !showProveedoresModal && !showProfileModal && !showUserForm && (
            <>
              <div className="flex gap-2 mb-6 flex-wrap">
                {currentUser.esAdmin && (
                  <>
                    <button onClick={() => setShowTiendasModal(true)} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg"><Building2 size={20} />Tiendas</button>
                    <button onClick={() => setShowProveedoresModal(true)} className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg"><Briefcase size={20} />Proveedores</button>
                    <button onClick={() => setShowUserForm(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg"><Users size={20} />Usuarios</button>
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
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <select value={filterTienda} onChange={(e) => setFilterTienda(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Todas las tiendas</option>
                  {tiendasList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterProveedor} onChange={(e) => setFilterProveedor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Todos los proveedores</option>
                  {proveedoresList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}

          {showForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar' : 'Nuevo'} Módem</h2>
              <div className="space-y-4 mb-4">
                <select value={formData.tienda} onChange={(e) => setFormData({...formData, tienda: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Seleccionar Tienda</option>
                  {tiendasList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={formData.proveedor} onChange={(e) => setFormData({...formData, proveedor: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Seleccionar Proveedor</option>
                  {proveedoresList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="text" value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})} placeholder="Serie *" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <input type="text" value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} placeholder="Modelo" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="mb-4 flex flex-wrap gap-4">
                {formData.fotos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={f} alt="foto" className="w-32 h-32 object-cover rounded border-2 border-gray-300" />
                    <button onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={16} /></button>
                  </div>
                ))}
                {formData.fotos.length < 3 && (
                  <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                    <Camera size={32} className="text-gray-400" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
                  </label>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={addModem} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"><Save size={20} />Guardar</button>
                <button onClick={() => {setShowForm(false); setEditingId(null); setFormData({tienda: '', proveedor: '', serie: '', modelo: '', fotos: []});}} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancelar</button>
              </div>
            </div>
          )}

          {!showForm && !showStats && !showHistorial && !showTiendasModal && !showProveedoresModal && !showProfileModal && !showUserForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modemsFiltered.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay módems</p>
                </div>
              ) : (
                modemsFiltered.map(m => (
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
                      <button onClick={() => deleteModem(m.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 text-sm"><Trash2 size={16} />Eliminar</button>
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