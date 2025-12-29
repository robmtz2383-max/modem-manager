import Header from "./Header";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
<div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200"></div>
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
