import Layout from './components/Layout';
import TiendasView from './components/tiendas/TiendasView';
import PreviewFotosModal from './components/modals/PreviewFotosModal';
import PreviewImageModal from './components/modals/PreviewImageModal';
import ModemsERPView from './components/modems/ModemsERPView';

{!showForm && !showStats && !showHistorial && !showTiendas && !showProveedores && !showProfile && !showUsers && (
  <ModemsERPView
    modems={filtered}
    onEdit={editModem}
    onDelete={delModem}
    onVerFotos={setPreviewTienda}
  />
)}


function App() {
  const [previewTienda, setPreviewTienda] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [busquedaTienda, setBusquedaTienda] = useState('');
  
  return (
    <Layout>
      <>
        {showTiendas && (
          <TiendasView
            tiendas={tiendas}
            user={user}
            busqueda={busquedaTienda}
            setBusqueda={setBusquedaTienda}
            onEdit={t => { setNewTienda(t); setEditTId(t.id); }}
            onDelete={delTienda}
            onClose={() => setShowTiendas(false)}
          />
        )}

        {/* MODALES */}
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
      </>
    </Layout>
  );
}
export default App;