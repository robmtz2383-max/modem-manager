import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="
      h-14 flex items-center justify-between px-6
      border-b border-slate-200
      bg-white
    ">
      
      <h1 className="text-lg font-semibold text-slate-800">
        Modem Manager
      </h1>

      <ThemeToggle />
    </header>
  );
}
