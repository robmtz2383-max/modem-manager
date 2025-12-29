import { Home, BarChart, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen border-r
      bg-white dark:bg-slate-900 dark:border-slate-700 p-4">

      <nav className="space-y-2">
        <button className="flex items-center gap-2 p-2 rounded-lg
          hover:bg-indigo-100 dark:hover:bg-slate-800 w-full">
          <Home size={18} /> Inicio
        </button>

        <button className="flex items-center gap-2 p-2 rounded-lg
          hover:bg-indigo-100 dark:hover:bg-slate-800 w-full">
          <BarChart size={18} /> Estadísticas
        </button>

        <button className="flex items-center gap-2 p-2 rounded-lg
          hover:bg-indigo-100 dark:hover:bg-slate-800 w-full">
          <Settings size={18} /> Configuración
        </button>
      </nav>
    </aside>
  );
}
