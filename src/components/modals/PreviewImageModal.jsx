import { useEffect } from 'react';

export default function PreviewImageModal({ image, onClose }) {
  if (!image) return null;

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={image}
        alt="Vista completa"
        onClick={e => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded shadow-2xl"
      />

      <button
        onClick={onClose}
        className="fixed top-6 right-6 text-white text-2xl
                   hover:text-slate-300 transition"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
}
