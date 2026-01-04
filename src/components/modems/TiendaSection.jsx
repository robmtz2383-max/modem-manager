import ModemRow from './ModemRow';

export default function TiendaSection({
  tienda,
  modems,
  abierta,
  onToggle,
  onEdit,
  onDelete,
  onVerFotos
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 bg-slate-50 border-b">
        <div>
          <h3 className="font-semibold text-slate-800">{tienda}</h3>
          <p className="text-sm text-slate-500">
            {modems.length} módem{modems.length !== 1 && 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onVerFotos(tienda)}
            className="text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-100 px-3 py-1.5 rounded-md"
          >
            🖼️ Ver fotos
          </button>

          <button onClick={onToggle}>
            {abierta ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* TABLA */}
      {abierta && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 text-left">Serie</th>
                <th className="p-3 text-left">Modelo</th>
                <th className="p-3 text-left">Proveedor</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modems.map(m => (
                <ModemRow
                  key={m.id}
                  modem={m}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
