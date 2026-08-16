import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAcademic } from "../context/AcademicContext";
import { toast } from "sonner";

export const DemoToolbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, resetDemo } = useAcademic();
  const [showTips, setShowTips] = useState(false);

  const pendingCount = transactions.filter((t) => t.estatus === "Pendiente (En Fila)").length;

  const currentPath = location.pathname;

  function handleReset() {
    resetDemo();
    toast.success("Estado de la simulación reiniciado con éxito", {
      description: "Las materias, transacciones y cupos han vuelto a sus valores iniciales.",
    });
  }

  return (
    <>
      {/* Floating Demo Control Bar */}
      <aside aria-label="Panel de control de simulación" className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/60 text-xs transition-all duration-300">
        <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">Demo Video</span>
        </div>

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

        {/* Tips Helper Toggle */}
        <button
          onClick={() => setShowTips(!showTips)}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            showTips
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
          title="Ver casos de prueba para el video"
        >
          💡
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 transition-colors cursor-pointer"
          title="Reiniciar datos de prueba"
        >
          🔄
        </button>
      </aside>

      {/* Test Cases Guidance Modal / Popover */}
      {showTips && (
        <div className="fixed bottom-18 right-4 z-40 bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-2xl border border-slate-700 max-w-sm w-[90vw] text-xs animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
              <span>🎬</span> Casos de Prueba para el Video
            </h4>
            <button
              onClick={() => setShowTips(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="p-2 bg-slate-800/80 rounded-lg border-l-3 border-rose-500">
              <strong className="text-rose-300 block mb-0.5">1. Demostrar Cruce de Horario:</strong>
              <p className="text-slate-300 text-[11px]">
                En Altas, intenta inscribir <strong>Bases de Datos Relacionales</strong> (Lu-Mi-Vi 10:00). El sistema detectará que se empalma con <strong>Sistemas Operativos</strong>.
              </p>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg border-l-3 border-amber-500">
              <strong className="text-amber-300 block mb-0.5">2. Demostrar Cupo Agotado:</strong>
              <p className="text-slate-300 text-[11px]">
                Verás que <strong>Redes de Computadoras</strong> tiene 0 cupos disponibles (25/25) y aparece bloqueada.
              </p>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg border-l-3 border-emerald-500">
              <strong className="text-emerald-300 block mb-0.5">3. Alta Exitosa + Aprobación:</strong>
              <p className="text-slate-300 text-[11px]">
                Solicita <strong>Microcontroladores y Microprocesadores</strong> (Dr. Adrián Sánchez). Ve al Admin, autorízala, y regresa al Alumno para ver cómo se añade a la Malla Semanal.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
