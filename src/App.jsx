import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Plus, Save, Edit2, X, Upload, Download, Settings, Cloud, LogOut, Users, AlertCircle } from 'lucide-react';

const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI'; // Cambiar después
const GOOGLE_REDIRECT_URI = window.location.origin;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export default function ModemManager() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginMode, setLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ usuario: '', contraseña: '' });
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({ usuario: '', contraseña: '', esAdmin: false });

  const [modems, setModems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tienda: '',
    proveedor: '',
    serie: '',
    modelo: '',
    fotos: []
  });

  const [storageConfig, setStorageConfig] = useState({
    tipo: 'local', // 'local' o 'googledrive'
    googleAccessToken: null,
    googleFolderId: null
  });

  const [syncStatus, setSyncStatus] = useState('Desconectado');
  const [users, setUsers] = useState([]);
  const [googleUser, setGoogleUser] = useState(null);

  useEffect(() => {
    loadUsers();
    initGoogleAPI();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadStorageConfig();
      loadModems();
    }
  }, [currentUser]);

  // ===== GOOGLE DRIVE =====

  const initGoogleAPI = async () => {
    // Cargar la librería de Google API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  const loginWithGoogle = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(SCOPES)}`;
    
    window.location.href = authUrl;
  };

  const handleGoogleCallback = () => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      setStorageConfig(prev => ({ ...prev, googleAccessToken: token }));
      setSyncStatus('✓ Conectado a Google Drive');
      createGoogleDriveFolder(token);
    }
  };

  const createGoogleDriveFolder = async (token) => {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'ModemManager',
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      const data = await response.json();
      if (data.id) {
        setStorageConfig(prev => ({ ...prev, googleFolderId: data.id }));
        setSyncStatus('✓ Carpeta creada en Google Drive');
      }
    } catch (error) {
      console.log('Error creando carpeta:', error);
    }
  };

  const saveToGoogleDrive = async (modemsData) => {
    if (!storageConfig.googleAccessToken || !storageConfig.googleFolderId) {
      alert('Configura Google Drive primero');
      return;
    }

    try {
      const fileContent = JSON.stringify(modemsData, null, 2);
      const metadata = {
        name: `modems_${currentUser.id}.json`,
        mimeType: 'application/json',
        parents: [storageConfig.googleFolderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storageConfig.googleAccessToken}`
        },
        body: form
      });

      if (response.ok) {
        setSyncStatus('✓ Sincronizado con Google Drive');
      }
    } catch (error) {
      console.log('Error guardando en Google Drive:', error);
      setSyncStatus('Error al sincronizar');
    }
  };

  const loadFromGoogleDrive = async () => {
    if (!storageConfig.googleAccessToken || !storageConfig.googleFolderId) {
      setSyncStatus('Google Drive no configurado');
      return;
    }

    try {
      const query = `'${storageConfig.googleFolderId}' in parents and name='modems_${currentUser.id}.json'`;
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name)`, {
        headers: {
          'Authorization': `Bearer ${storageConfig.googleAccessToken}`
        }
      });

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        const fileId = data.files[0].id;
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: {
            'Authorization': `Bearer ${storageConfig.googleAccessToken}`
          }
        });

        const modemsData = await fileResponse.json();
        setModems(modemsData);
        setSyncStatus('✓ Conectado a Google Drive');
      } else {
        setModems([]);
        setSyncStatus('✓ Conectado a Google Drive (sin datos)');
      }
    } catch (error) {
      console.log('Error cargando de Google Drive:', error);
      setSyncStatus('Error en Google Drive');
    }
  };

  // ===== USUARIOS =====

  const loadUsers = async () => {
    try {
      const result = await window.storage.get('users:all', true);
      if (result) {
        setUsers(JSON.parse(result.value));
      }
    } catch {
      setUsers([]);
    }
  };

  const saveUsers = async (usersList) => {
    try {
      await window.storage.set('users:all', JSON.stringify(usersList), true);
      setUsers(usersList);
    } catch {
      alert('Error al guardar usuarios');
    }
  };

  const handleLogin = () => {
    if (!loginData.usuario || !loginData.contraseña) {
      alert('Completa usuario y contraseña');
      return;
    }

    const user = users.find(u => u.usuario === loginData.usuario && u.contraseña === loginData.contraseña);
    if (user) {
      setCurrentUser(user);
      setLoginData({ usuario: '', contraseña: '' });
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleRegister = async () => {
    if (!loginData.usuario || !loginData.contraseña) {
      alert('Completa usuario y contraseña');
      return;
    }

    if (users.some(u => u.usuario === loginData.usuario)) {
      alert('El usuario ya existe');
      return;
    }

    const newUser = {
      id: `user:${Date.now()}`,
      usuario: loginData.usuario,
      contraseña: loginData.contraseña,
      esAdmin: users.length === 0
    };

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    
    if (newUser.esAdmin) {
      setCurrentUser(newUser);
    } else {
      alert('Usuario registrado. Espera a que un admin lo apruebe.');
    }
    setLoginData({ usuario: '', contraseña: '' });
    setLoginMode(true);
  };

  const createUserAsAdmin = async () => {
    if (!newUserData.usuario || !newUserData.contraseña) {
      alert('Completa usuario y contraseña');
      return;
    }

    if (users.some(u => u.usuario === newUserData.usuario)) {
      alert('El usuario ya existe');
      return;
    }

    const newUser = {
      id: `user:${Date.now()}`,
      usuario: newUserData.usuario,
      contraseña: newUserData.contraseña,
      esAdmin: newUserData.esAdmin
    };

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
    setNewUserData({ usuario: '', contraseña: '', esAdmin: false });
    setShowUserForm(false);
    alert(`Usuario "${newUser.usuario}" creado exitosamente`);
  };

  const deleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro?')) {
      const updated = users.filter(u => u.id !== userId);
      await saveUsers(updated);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ===== CONFIGURACIÓN =====

  const loadStorageConfig = async () => {
    try {
      const result = await window.storage.get(`storage:${currentUser.id}`, true);
      if (result) {
        setStorageConfig(JSON.parse(result.value));
      }
    } catch {
      console.log('Sin config');
    }
  };

  const saveStorageConfig = async () => {
    try {
      await window.storage.set(`storage:${currentUser.id}`, JSON.stringify(storageConfig), true);
      setShowSettings(false);
      alert('Configuración guardada');
    } catch {
      alert('Error al guardar');
    }
  };

  // ===== MÓDEMS =====

  const loadModems = async () => {
    if (storageConfig.tipo === 'googledrive') {
      await loadFromGoogleDrive();
    } else {
      try {
        const keys = await window.storage.list(`modems:${currentUser.id}:`, true);
        if (keys && keys.keys) {
          const modemsData = await Promise.all(
            keys.keys.map(async (key) => {
              try {
                const result = await window.storage.get(key, true);
                return result ? { id: key, ...JSON.parse(result.value) } : null;
              } catch {
                return null;
              }
            })
          );
          setModems(modemsData.filter(m => m !== null));
          setSyncStatus('✓ Almacenamiento Local');
        }
      } catch {
        setSyncStatus('Error');
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.fotos.length + files.length > 3) {
      alert('Máximo 3 fotos');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          fotos: [...prev.fotos, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.tienda || !formData.proveedor || !formData.serie) {
      alert('Campos obligatorios incompletos');
      return;
    }

    try {
      const newModemsData = editingId
        ? modems.map(m => m.id === editingId ? { ...formData, id: editingId } : m)
        : [...modems, { ...formData, id: `modems:${currentUser.id}:${Date.now()}` }];

      if (storageConfig.tipo === 'googledrive') {
        await saveToGoogleDrive(newModemsData);
      } else {
        for (const modem of newModemsData) {
          await window.storage.set(modem.id, JSON.stringify(modem), true);
        }
      }

      setModems(newModemsData);
      setFormData({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
      setShowForm(false);
      setEditingId(null);
    } catch {
      alert('Error al guardar');
    }
  };

  const deleteModem = async (id) => {
    if (window.confirm('¿Eliminar?')) {
      try {
        const newModemsData = modems.filter(m => m.id !== id);
        
        if (storageConfig.tipo === 'googledrive') {
          await saveToGoogleDrive(newModemsData);
        } else {
          await window.storage.delete(id, true);
        }
        
        setModems(newModemsData);
      } catch {
        alert('Error al eliminar');
      }
    }
  };

  const editModem = (modem) => {
    setFormData({
      tienda: modem.tienda,
      proveedor: modem.proveedor,
      serie: modem.serie,
      modelo: modem.modelo,
      fotos: modem.fotos
    });
    setEditingId(modem.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setFormData({ tienda: '', proveedor: '', serie: '', modelo: '', fotos: [] });
    setShowForm(false);
    setEditingId(null);
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(modems, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modems_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al exportar');
    }
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) {
          alert('Formato inválido');
          return;
        }

        const newModemsData = [...modems, ...importedData];
        
        if (storageConfig.tipo === 'googledrive') {
          await saveToGoogleDrive(newModemsData);
        } else {
          for (const modem of newModemsData) {
            await window.storage.set(modem.id, JSON.stringify(modem), true);
          }
        }
        
        setModems(newModemsData);
        alert(`${importedData.length} módems importados`);
      } catch {
        alert('Error al importar');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Gestor de Módems</h1>
          <p className="text-center text-gray-600 mb-6">Sistema Seguro</p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setLoginMode(true)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                loginMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setLoginMode(false)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                !loginMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={loginData.usuario}
              onChange={(e) => setLoginData({...loginData, usuario: e.target.value})}
              placeholder="Usuario"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={loginData.contraseña}
              onChange={(e) => setLoginData({...loginData, contraseña: e.target.value})}
              placeholder="Contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={loginMode ? handleLogin : handleRegister}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              {loginMode ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </div>

          {users.length === 0 && !loginMode && (
            <p className="text-center text-green-600 text-sm mt-4">✓ Serás ADMIN</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestor de Módems</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600">{syncStatus}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  currentUser.esAdmin
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {currentUser.esAdmin ? '👑 ADMIN' : 'Usuario'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">{currentUser.usuario}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {!showForm && !showSettings && !showUserForm && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {currentUser.esAdmin && (
                <button
                  onClick={() => setShowUserForm(true)}
                  className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                >
                  <Users size={20} />
                  Usuarios
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download size={20} />
              </button>
              <label className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer">
                <Upload size={20} />
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                Nuevo
              </button>
            </div>
          )}

          {showUserForm && currentUser.esAdmin && (
            <div className="bg-amber-50 p-6 rounded-lg mb-6 border-2 border-amber-200">
              <h2 className="text-xl font-semibold mb-4">Crear Usuario</h2>
              <div className="space-y-4 max-w-md mb-4">
                <input
                  type="text"
                  value={newUserData.usuario}
                  onChange={(e) => setNewUserData({...newUserData, usuario: e.target.value})}
                  placeholder="Usuario"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="password"
                  value={newUserData.contraseña}
                  onChange={(e) => setNewUserData({...newUserData, contraseña: e.target.value})}
                  placeholder="Contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newUserData.esAdmin}
                    onChange={(e) => setNewUserData({...newUserData, esAdmin: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Admin
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={createUserAsAdmin}
                    className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowUserForm(false);
                      setNewUserData({ usuario: '', contraseña: '', esAdmin: false });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-300">
                <h3 className="font-semibold mb-3">Usuarios</h3>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded border border-amber-200">
                      <div className="flex gap-2">
                        <span>{user.usuario}</span>
                        {user.esAdmin && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">ADMIN</span>}
                      </div>
                      {currentUser.id !== user.id && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showSettings && currentUser.esAdmin && (
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
              <h2 className="text-xl font-semibold mb-4">Almacenamiento</h2>
              
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 flex gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-2">⚠️ Configuración de Google Drive</p>
                  <p className="mb-2">Para usar Google Drive, necesitas:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crear un proyecto en <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Cloud Console</a></li>
                    <li>Obtener un CLIENT_ID de OAuth 2.0</li>
                    <li>Reemplazar <code className="bg-white px-2 py-1 rounded">TU_CLIENT_ID_AQUI</code> en el código</li>
                    <li>Desplegar la app en Vercel o Netlify</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={storageConfig.tipo === 'local'}
                    onChange={() => setStorageConfig({...storageConfig, tipo: 'local'})}
                  />
                  Almacenamiento Local
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={storageConfig.tipo === 'googledrive'}
                    onChange={() => setStorageConfig({...storageConfig, tipo: 'googledrive'})}
                  />
                  Google Drive
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={saveStorageConfig}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingId ? 'Editar' : 'Nuevo Módem'}
                </h2>
                <button onClick={cancelForm}>
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  value={formData.tienda}
                  onChange={(e) => setFormData({...formData, tienda: e.target.value})}
                  placeholder="Tienda"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  placeholder="Proveedor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.serie}
                  onChange={(e) => setFormData({...formData, serie: e.target.value})}
                  placeholder="Serie"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                  placeholder="Modelo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-4">
                  {formData.fotos.map((foto, i) => (
                    <div key={i} className="relative">
                      <img src={foto} alt="foto" className="w-32 h-32 object-cover rounded border-2 border-gray-300" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.fotos.length < 3 && (
                    <label className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer">
                      <Camera size={32} className="text-gray-400" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  <Save size={20} />
                  Guardar
                </button>
                <button
                  onClick={cancelForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay módems registrados</p>
              </div>
            ) : (
              modems.map((modem) => (
                <div key={modem.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-blue-700 mb-1">{modem.tienda}</h3>
                    <h4 className="font-semibold text-gray-800 mb-1">{modem.proveedor}</h4>
                    <p className="text-sm text-gray-600"><span className="font-medium">Serie:</span> {modem.serie}</p>
                    {modem.modelo && <p className="text-sm text-gray-600"><span className="font-medium">Modelo:</span> {modem.modelo}</p>}
                  </div>

                  {modem.fotos && modem.fotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {modem.fotos.map((foto, i) => (
                        <img key={i} src={foto} alt="foto" className="w-full h-20 object-cover rounded border border-gray-200" />
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => editModem(modem)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 text-sm"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteModem(modem.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 text-sm"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}