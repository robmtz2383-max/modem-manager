import { useState, useEffect } from 'react';

import Layout from './components/Layout';
import TiendasView from './components/tiendas/TiendasView';
import ModemsERPView from './components/modems/ModemsERPView';
import PreviewFotosModal from './components/modals/PreviewFotosModal';
import PreviewImageModal from './components/modals/PreviewImageModal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [previewTienda, setPreviewTienda] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [busquedaTienda, setBusquedaTienda] = useState('');

  // estados de vistas
  const [showForm] = useState(false);
  const [showStats] = useState(false);
  const [showHistorial] = useState(false);
  const [showTiendas] = useState(false);
  const [showProveedores] = useState(false);
  const [showProfile] = useState(false);
  const [showUsers] = useState(false);

console.log('DATA FIRESTORE:', data);


useEffect(() => {
  const loadModems = async () => {
    try {
      const snap = await getDocs(collection(db, 'modems'));
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setModems(data);
      setFiltered(data);

      console.log('✅ Módems cargados:', data.length);
    } catch (e) {
      console.error('❌ Error cargando módems:', e);
    }
  };

  loadModems();
}, []);



  // 🔴 DATOS MOCK TEMPORALES (EVITA BLANCO)
  const [modems, setModems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const tiendas = [];
  const user = { esAdmin: true };

if (!Array.isArray(filtered)) {
  return <div>Error: datos no válidos</div>;
}


  return (
    <Layout>
      {/* VISTA PRINCIPAL */}
      {!showForm &&
        !showStats &&
        !showHistorial &&
        !showTiendas &&
        !showProveedores &&
        !showProfile &&
        !showUsers && (
    
          <ModemsERPView
            modems={filtered}
            onEdit={() => {}}
            onDelete={() => {}}
            onVerFotos={setPreviewTienda}
          />
        )}

      {showTiendas && (
        <TiendasView
          tiendas={tiendas}
          user={user}
          busqueda={busquedaTienda}
          setBusqueda={setBusquedaTienda}
          onEdit={() => {}}
          onDelete={() => {}}
          onClose={() => {}}
        />
      )}

      <PreviewFotosModal
        tienda={previewTienda}
        modems={modems}
        onClose={() => setPreviewTienda(null)}
        onSelectImage={setPreviewImage}
      />

      <PreviewImageModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </Layout>
  );
}
