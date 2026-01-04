export default function PreviewImageModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <img
        src={image}
        className="max-h-[90vh] max-w-[90vw] rounded"
      />
      <button
        onClick={onClose}
        className="fixed top-6 right-6 text-white text-2xl"
      >
        ✕
      </button>
    </div>
  );
}
