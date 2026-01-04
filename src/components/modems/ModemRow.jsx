export default function ModemRow({ modem, onEdit, onDelete }) {
  return (
    <tr className="border-t hover:bg-slate-50">
      <td className="p-3">{modem.serie}</td>
      <td className="p-3">{modem.modelo}</td>
      <td className="p-3">{modem.proveedor}</td>
      <td className="p-3">{modem.estado}</td>
      <td className="p-3 text-right">
        <button
          onClick={() => onEdit(modem)}
          className="text-indigo-600 hover:underline mr-3"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(modem.id)}
          className="text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}
