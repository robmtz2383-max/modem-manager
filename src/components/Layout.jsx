import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col
      bg-slate-100 dark:bg-slate-900
      text-slate-800 dark:text-slate-200">

      <Header />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

    </div>
  );
}
