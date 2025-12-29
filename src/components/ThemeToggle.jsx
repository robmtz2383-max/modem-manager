import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700"
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block text-white" />
    </button>
  );
}
