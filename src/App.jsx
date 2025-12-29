import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Plus, Save, Edit2, X, LogOut, Users, Search, TrendingUp, Clock, Key, Building2, Briefcase, Download } from 'lucide-react';

const FIREBASE_URL = 'https://gestor-modems-default-rtdb.firebaseio.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [loginMode, setLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ usuario: '', contraseña: '' });
  const [showScanner, setShowScanner] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
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

  const startScanner = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(videoStream => {
      setStream(videoStream);
      setShowScanner(true);
      setTimeout(() => {
        const video = document.getElementById('scanner-video');
        if (video) {
          video.srcObject = videoStream;
          video.play();
          scanBarcode(video);
        }
      }, 100);
    }).catch(() => {
      alert('Permiso de cámara denegado');
    });
  };

  const scanBarcode = (video) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const scan = () => {
      if (!showScanner) return;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        setFormData(prev => ({ ...prev, serie: code.data }));
        stopScanner();
        alert('Código escaneado: ' + code.data);
      } else {
        requestAnimationFrame(scan);
      }
    };
    
    scan();
  };

  const stopScanner = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setShowScanner(false);
  };

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(videoStream => {
      setStream(videoStream);
      setShowCamera(true);
      setTimeout(() => {
        const video = document.getElementById('camera-video');
        if (video) {
          video.srcObject = videoStream;
          video.play();
        }
      }, 100);
    }).catch(() => {
      alert('Permiso de cámara denegado');
    });
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    
    if (formData.fotos.length < 3) {
      setFormData(prev => ({ ...prev, fotos: [...prev.fotos, photoData] }));
    } else {
      alert('Máximo 3 fotos');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setShowCamera(false);
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

  const generatePDFByTienda = async (tiendaNombre) => {
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const tiendaModems = modems.filter(m => m.tienda === tiendaNombre);
      
      if (tiendaModems.length === 0) {
        alert('No hay módems en esta tienda');
        return;
      }

      let yPos = 20;
      
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Reporte de Módems', 105, yPos, { align: 'center' });
      yPos += 10;
      
      pdf.setFontSize(14);
      pdf.text('Tienda: ' + tiendaNombre, 105, yPos, { align: 'center' });
      yPos += 5;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('Fecha: ' + new Date().toLocaleDateString('es-MX'), 105, yPos, { align: 'center' });
      yPos += 15;

      for (let i = 0; i < tiendaModems.length; i++) {
        const modem = tiendaModems[i];
        
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Proveedor: ' + modem.proveedor, 15, yPos);
        yPos += 7;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text('Serie: ' + modem.serie, 15, yPos);
        yPos += 5;
        
        if (modem.modelo) {
          pdf.text('Modelo: ' + modem.modelo, 15, yPos);
          yPos += 5;
        }
        
        yPos += 5;

        if (modem.fotos && modem.fotos.length > 0) {
          const imgWidth = 50;
          const imgHeight = 50;
          let xPos = 15;
          
          for (let j = 0; j < modem.fotos.length; j++) {
            if (xPos + imgWidth > 195) {
              xPos = 15;
              yPos += imgHeight + 5;
              
              if (yPos + imgHeight > 270) {
                pdf.addPage();
                yPos = 20;
              }
            }
            
            try {
              pdf.addImage(modem.fotos[j], 'JPEG', xPos, yPos, imgWidth, imgHeight);
              xPos += imgWidth + 5;
            } catch (e) {
              console.error('Error al agregar imagen:', e);
            }
          }
          
          yPos += imgHeight + 10;
        }

        pdf.setDrawColor(200);
        pdf.line(15, yPos, 195, yPos);
        yPos += 10;
      }

      pdf.setFontSize(8);
      pdf.setTextColor(128);
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.text('Página ' + i + ' de ' + totalPages, 105, 285, { align: 'center' });
        pdf.text('Total de módems: ' + tiendaModems.length, 105, 290, { align: 'center' });
      }

      pdf.save('Reporte_' + tiendaNombre.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.pdf');
      addHist('Generar PDF', 'Tienda: ' + tiendaNombre);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar PDF. Asegúrate de que jsPDF esté cargado.');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-white">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border-4 border-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Gestor de Módems</h1>
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
                  <div key={t.id} className="flex justify-between items-center bg-white p-3 rounded border border-orange-200">
                    <div><p className="font-semibold">{t.nombre}</p><p className="text-sm text-gray-600">{t.asesor}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => generatePDFByTienda(t.nombre)} className="text-green-600 hover:text-green-800" title="Generar PDF"><Download size={18} /></button>
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border-2 border-blue-200 shadow-xl">
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
              {showCamera && (
                <div className="mb-4 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl">
                  <video id="camera-video" className="w-full h-64 bg-black rounded-xl mb-3" />
                  <div className="flex gap-3">
                    <button onClick={capturePhoto} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg">📸 Capturar</button>
                    <button onClick={stopCamera} className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg">Cerrar</button>
                  </div>
                </div>
              )}
              
              <div className="mb-4 flex flex-wrap gap-4">
                {formData.fotos.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={f} alt="foto" className="w-32 h-32 object-cover rounded-xl border-4 border-blue-200 shadow-lg group-hover:scale-105 transition-transform" />
                    <button onClick={() => removeImg(i)} className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"><X size={16} /></button>
                  </div>
                ))}
                {formData.fotos.length < 3 && (
                  <>
                    <button onClick={startCamera} className="w-32 h-32 flex flex-col items-center justify-center border-4 border-dashed border-blue-400 rounded-xl cursor-pointer hover:border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 hover:scale-105 transition-all shadow-lg">
                      <Camera size={32} className="text-blue-500 mb-2" />
                      <span className="text-xs text-blue-600 font-bold">Tomar foto</span>
                    </button>
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
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay módems</p>
                </div>
              ) : (
                filtered.map(m => (
                  <div key={m.id} className="bg-gradient-to-br from-white to-blue-50 border-4 border-blue-200 rounded-2xl p-5 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                    <h3 className="text-xl font-extrabold text-blue-700 mb-2">{m.tienda}</h3>
                    <h4 className="font-bold text-gray-800 mb-2 text-lg">{m.proveedor}</h4>
                    <div className="bg-white rounded-lg p-3 mb-3 border-2 border-blue-100">
                      <p className="text-sm text-gray-700 mb-1"><span className="font-bold text-blue-600">Serie:</span> {m.serie}</p>
                      {m.modelo && <p className="text-sm text-gray-700"><span className="font-bold text-blue-600">Modelo:</span> {m.modelo}</p>}
                    </div>
                    {m.fotos && m.fotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {m.fotos.map((f, i) => <img key={i} src={f} alt="foto" className="w-full h-24 object-cover rounded-lg border-2 border-blue-200 shadow-md hover:scale-105 transition-transform" />)}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => editModem(m)} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Edit2 size={16} />Editar</button>
                      <button onClick={() => delModem(m.id)} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"><Trash2 size={16} />Eliminar</button>
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