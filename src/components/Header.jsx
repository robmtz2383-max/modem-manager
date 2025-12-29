import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b
      bg-white dark:bg-slate-900 dark:border-slate-700">
      
      <h1 className="text-3xl font-semibold text-slate-800">
        Modem Manager
      </h1>

      <ThemeToggle />
    </header>
  );
}
