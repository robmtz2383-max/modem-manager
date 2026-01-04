export default function PreviewFotosModal({
  tienda,
  modems = [],
  onClose,
  onSelectImage
}) {
  if (!tienda) return null;

  const fotos = modems
    .filter(m => m.tienda === tienda && m.fotos?.length)
    .flatMap(m =>
      m.fotos.map((url, i) => ({
        key: `${m.id}-${i}`,
        url
      }))
    );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6"
        onClick={e => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-slate-800">
            Fotos – {tienda}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {fotos.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Esta tienda no tiene fotos
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
            {fotos.map(f => (
              <img
                key={f.key}
                src={f.url}
                alt={`Foto módem – ${tienda}`}
                onClick={() => onSelectImage(f.url)}
                className="w-full h-32 object-cover rounded cursor-pointer
                           hover:shadow-md transition"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
