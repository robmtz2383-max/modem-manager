export default function PreviewFotosModal({
  tienda,
  modems,
  onClose,
  onSelectImage
}) {
  if (!tienda) return null;

  const fotos = modems
    .filter(m => m.tienda === tienda && m.fotos?.length)
    .flatMap(m => m.fotos);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Fotos – {tienda}
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {fotos.length === 0 ? (
          <p className="text-center text-slate-500">
            Esta tienda no tiene fotos
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
            {fotos.map((f, i) => (
              <img
                key={i}
                src={f}
                onClick={() => onSelectImage(f)}
                className="w-full h-32 object-cover rounded cursor-pointer"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
