import { Edit2, Trash2 } from 'lucide-react';

export default function ModemCard({ modem, onEdit, onDelete }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold text-indigo-600 mb-1">{modem.tienda}</h3>
      <p className="text-sm text-slate-700">{modem.proveedor}</p>

      <div className="mt-3 text-sm">
        <p><strong>Serie:</strong> {modem.serie}</p>
        {modem.modelo && <p><strong>Modelo:</strong> {modem.modelo}</p>}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onEdit} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <Edit2 size={16} /> Editar
        </button>
        <button onClick={onDelete} className="btn-danger flex-1 flex items-center justify-center gap-2">
          <Trash2 size={16} /> Eliminar
        </button>
      </div>
    </div>
  );
}
