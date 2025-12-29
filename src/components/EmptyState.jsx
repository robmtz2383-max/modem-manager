import { Camera } from 'lucide-react';

export default function EmptyState({ text }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <Camera size={48} className="mx-auto mb-4" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
