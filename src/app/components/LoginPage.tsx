import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function LoginPage() {
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleMatricula(e: React.ChangeEvent<HTMLInputElement>) {
    setMatricula(e.target.value.replace(/[^0-9]/g, "").slice(0, 8));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matricula.length < 8) {
      toast.error("Formato de matrícula inválido", {
        description: "La matrícula debe contener exactamente 8 números después del prefijo 'S'.",
      });
      return;
    }

    if (matricula === "00000000") {
      toast.success("Sesión iniciada como Administrador", {
        description: "Bienvenido a la Secretaría Académica FIEE.",
      });
      navigate("/admin");
    } else {
      toast.success("Sesión iniciada correctamente", {
        description: `Bienvenido al portal escolar, Emiliano Figueroa (S${matricula}).`,
      });
      navigate("/estudiante");
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Column: Login Form Panel */}
      <div className="w-full lg:w-[480px] min-h-screen flex flex-col justify-between p-8 sm:p-12 shadow-2xl z-10 bg-white">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-[#004A98] text-white rounded-xl flex items-center justify-center font-black font-mono text-base shadow-md shadow-blue-500/20">
              UV
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#004A98] leading-none">
                Sistema de <span className="text-[#71A031]">Altas y Bajas</span>
              </h1>
              <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Universidad Veracruzana • Portal Académico
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa tus credenciales institucionales para gestionar altas, bajas y consultar tu horario.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Matrícula Institucional
              </label>
              <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-slate-50">
                <span className="bg-slate-200/80 text-slate-700 font-bold px-3.5 flex items-center text-sm border-r border-slate-300 font-mono">
                  S
                </span>
                <input
                  type="text"
                  value={matricula}
                  onChange={handleMatricula}
                  placeholder="Ej. 20004603"
                  maxLength={8}
                  required
                  className="w-full px-3.5 py-3 text-sm bg-transparent outline-none font-medium text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña (Portal MiUV)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-slate-900 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#004A98] hover:bg-[#002B5E] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              <span>Ingresar al Sistema</span>
              <span>➔</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="pt-6 text-center text-xs text-slate-400 border-t border-slate-100 mt-6">
          <p>
            Facultad de Ingeniería Eléctrica y Electrónica (FIEE)
            <br />
            <span className="font-semibold text-slate-500">Universidad Veracruzana • 2026</span>
          </p>
        </div>
      </div>

      {/* Right Column: Institutional Showcase & Announcements */}
      <div className="flex-1 bg-gradient-to-br from-[#001D40] via-[#002B5E] to-[#004A98] p-8 sm:p-16 flex flex-col justify-center text-white relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#71A031]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl mx-auto space-y-8 relative z-10">
          <div>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-[#88B24B] inline-block mb-3">
              Período Escolar Feb – Jul 2026
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Portal Institucional de <br />
              <span className="text-[#88B24B]">Altas y Bajas en Línea</span>
            </h2>
            <p className="text-white/80 text-sm mt-3 leading-relaxed">
              Módulo digital para la gestión y dictamen en tiempo real de Experiencias Educativas con validación automatizada de aforos y compatibilidad horaria.
            </p>
          </div>

          {/* Announcement Cards */}
          <div className="space-y-3.5">
            {[
              {
                icon: "📅",
                title: "Ventanilla Digital Habilitada",
                text: "El sistema efectúa validaciones lógicas automáticas sobre cupos y cruces de horario al momento de emitir tu solicitud.",
              },
              {
                icon: "👨‍🏫",
                title: "Asesoría y Tutoría Académica",
                text: "Recuerda consultar con tu Tutor Académico antes de solicitar modificaciones a tu carga crediticia.",
              },
              {
                icon: "📄",
                title: "Acuse con Validez Oficial y QR",
                text: "Cada trámite genera un folio y sello digital que puedes consultar e imprimir desde tu panel de usuario.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-4 rounded-2xl transition-all duration-300 flex items-start gap-4"
              >
                <span className="text-2xl p-2.5 bg-white/10 rounded-xl shrink-0">{card.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-sm">{card.title}</h3>
                  <p className="text-white/75 text-xs mt-0.5 leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
