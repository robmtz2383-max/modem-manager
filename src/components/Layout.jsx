export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {children}
    </div>
  );
}
