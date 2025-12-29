export default function Header() {
  return (
    <header className="
      h-14 flex items-center justify-between
      px-4 md:px-6
      border-b
      bg-white dark:bg-slate-900
      dark:border-slate-700">

      <h1 className="text-lg md:text-xl font-semibold">
        Modem Manager
      </h1>

      <ThemeToggle />
    </header>
  );
}
