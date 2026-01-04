export default function TiendasView({
  tiendas,
  user,
  busqueda,
  setBusqueda,
  onAdd,
  onEdit,
  onDelete,
  onClose
}) {
  if (!user.esAdmin) return null;

  const tiendasFiltradas = tiendas.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">

      <h2 className="text-2xl font-bold mb-4">Tiendas</h2>

      <input
        type="text"
        placeholder="Buscar tienda..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded mb-4"
      />

      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {tiendasFiltradas.map(t => (
          <div
            key={t.id}
            className="flex justify-between items-center p-4 border rounded"
          >
            <div>
              <p className="font-semibold">{t.nombre}</p>
              <p className="text-sm text-slate-500">{t.asesor}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => onEdit(t)}>✏️</button>
              <button onClick={() => onDelete(t.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onClose} className="bg-slate-200 px-6 py-2 rounded">
        Cerrar
      </button>
    </div>
  );
}
