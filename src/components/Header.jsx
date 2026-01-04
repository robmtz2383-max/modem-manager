export default function Header() {
  return (
    <header className="
      h-14 flex items-center justify-between
      px-4 md:px-6
      border-b border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800
    ">
      <h1 className="text-lg font-semibold tracking-tight">
        Modem Manager
      </h1>

      <ThemeToggle />
    </header>
  );
}
