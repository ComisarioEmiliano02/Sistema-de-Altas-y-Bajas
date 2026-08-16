import React from "react";
import { useNavigate, useLocation } from "react-router";
import { useAcademic } from "../context/AcademicContext";
import { toast } from "sonner";

export const DemoToolbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, resetDemo } = useAcademic();

  const pendingCount = transactions.filter((t) => t.estatus === "Pendiente (En Fila)").length;

  const currentPath = location.pathname;

  function handleReset() {
    resetDemo();
    toast.success("Estado del sistema reiniciado con éxito", {
      description: "Las materias, transacciones y cupos han vuelto a sus valores iniciales.",
    });
  }

  return (
    <aside
      aria-label="Panel de navegación rápida"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/60 text-xs transition-all duration-300"
    >
      {/* Role Switcher */}
      <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
        <button
          onClick={() => navigate("/estudiante")}
          className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            currentPath === "/estudiante"
              ? "bg-[#004A98] text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-700/60"
          }`}
        >
          <span>👨‍🎓</span>
          <span className="hidden sm:inline">Alumno</span>
        </button>

        <button
          onClick={() => navigate("/admin")}
          className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
            currentPath === "/admin"
              ? "bg-[#71A031] text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-700/60"
          }`}
        >
          <span>🛡️</span>
          <span className="hidden sm:inline">Admin</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-900 rounded-full font-black text-[10px] animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate("/")}
          className={`px-2 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition-all cursor-pointer ${
            currentPath === "/" ? "bg-slate-700 text-white" : ""
          }`}
          title="Ir a Login"
        >
          🔑
        </button>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-colors cursor-pointer"
        title="Reiniciar datos de prueba"
      >
        🔄
      </button>
    </aside>
  );
};
