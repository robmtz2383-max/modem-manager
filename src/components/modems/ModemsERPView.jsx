import { useState, useMemo } from 'react';
import TiendaSection from './TiendaSection';

export default function ModemsERPView({
  modems = [],
  onEdit,
  onDelete,
  onVerFotos
}) {
  const [tiendaAbierta, setTiendaAbierta] = useState(null);

  const modemsPorTienda = useMemo(() => {
    return modems.reduce((acc, m) => {
      const tiendaKey = m.tienda || 'Sin tienda';
      acc[tiendaKey] = acc[tiendaKey] || [];
      acc[tiendaKey].push(m);
      return acc;
    }, {});
  }, [modems]);

  const tiendasOrdenadas = Object.entries(modemsPorTienda)
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      {tiendasOrdenadas.length === 0 && (
        <p className="text-center text-slate-500 py-8">
          No hay módems registrados
        </p>
      )}

      {tiendasOrdenadas.map(([tienda, lista]) => (
        <TiendaSection
          key={tienda}
          tienda={tienda}
          modems={lista}
          total={lista.length}
          abierta={tiendaAbierta === tienda}
          onToggle={() =>
            setTiendaAbierta(tiendaAbierta === tienda ? null : tienda)
          }
          onEdit={onEdit}
          onDelete={onDelete}
          onVerFotos={onVerFotos}
        />
      ))}
    </div>
  );
}
