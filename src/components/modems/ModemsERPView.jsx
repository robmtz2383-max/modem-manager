import { useState } from 'react';
import TiendaSection from './TiendaSection';

export default function ModemsERPView({
  modems,
  onEdit,
  onDelete,
  onVerFotos
}) {
  const [tiendaAbierta, setTiendaAbierta] = useState(null);

  const modemsPorTienda = modems.reduce((acc, m) => {
    acc[m.tienda] = acc[m.tienda] || [];
    acc[m.tienda].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(modemsPorTienda).map(([tienda, lista]) => (
        <TiendaSection
          key={tienda}
          tienda={tienda}
          modems={lista}
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
