import { Home, BarChart, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen border-r border-slate-200 bg-white p-4">
      
      <nav className="space-y-1">
        
        <button className="
          flex items-center gap-3 w-full
          px-3 py-2 rounded-lg
          bg-slate-100
          text-slate-700
          hover:bg-indigo-50 hover:text-indigo-700
          transition
        ">
          <Home size={18} />
          Inicio
        </button>

        <button className="
          flex items-center gap-3 w-full
          px-3 py-2 rounded-lg
          bg-transparent
          text-slate-600
          hover:bg-indigo-50 hover:text-indigo-700
          transition
        ">
          <BarChart size={18} />
          Estadísticas
        </button>

        <button className="
          flex items-center gap-3 w-full
          px-3 py-2 rounded-lg
          bg-transparent
          text-slate-600
          hover:bg-indigo-50 hover:text-indigo-700
          transition
        ">
          <Settings size={18} />
          Configuración
        </button>

      </nav>
    </aside>
  );
}
