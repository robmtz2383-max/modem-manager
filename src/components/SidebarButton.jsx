export default function SidebarButton({ icon, label }) {
  return (
    <button className="
      w-full flex items-center gap-3 px-3 py-2 rounded-lg
      text-slate-600 dark:text-slate-300
      hover:bg-slate-100 dark:hover:bg-slate-800
      hover:text-slate-900 dark:hover:text-white
      transition
    ">
      {icon}
      <span>{label}</span>
    </button>
  );
}
