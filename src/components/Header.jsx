import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b
  bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">

  <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        Modem Manager
      </h1>

      <ThemeToggle />
    </header>
  );
}
