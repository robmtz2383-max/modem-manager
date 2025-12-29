import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b
      bg-white dark:bg-slate-900 dark:border-slate-700">
      
      <h1 className="font-bold text-indigo-600 dark:text-indigo-400">
        Modem Manager
      </h1>

      <ThemeToggle />
    </header>
  );
}
