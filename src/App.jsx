import { useState } from 'react';

import Layout from './components/Layout';
import TiendasView from './components/tiendas/TiendasView';
import ModemsERPView from './components/modems/ModemsERPView';
import PreviewFotosModal from './components/modals/PreviewFotosModal';
import PreviewImageModal from './components/modals/PreviewImageModal';

export default function App() {
  const [previewTienda, setPreviewTienda] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [busquedaTienda, setBusquedaTienda] = useState('');

  // ⚠️ Estos estados DEBEN existir
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showTiendas, setShowTiendas] = useState(false);
  const [showProveedores, setShowProveedores] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  return (
    <Layout>

      {/* ✅ VISTA PRINCIPAL ERP */}
      {!showForm &&
        !showStats &&
        !showHistorial &&
        !showTiendas &&
        !showProveedores &&
        !showProfile &&
        !showUsers && (
          <ModemsERPView
            modems={filtered}
            onEdit={editModem}
            onDelete={delModem}
            onVerFotos={setPreviewTienda}
          />
        )}

      {/* 🏬 TIENDAS */}
      {showTiendas && (
        <TiendasView
          tiendas={tiendas}
          user={user}
          busqueda={busquedaTienda}
          setBusqueda={setBusquedaTienda}
          onEdit={t => {
            setNewTienda(t);
            setEditTId(t.id);
          }}
          onDelete={delTienda}
          onClose={() => setShowTiendas(false)}
        />
      )}

      {/* 🖼 MODALES */}
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
