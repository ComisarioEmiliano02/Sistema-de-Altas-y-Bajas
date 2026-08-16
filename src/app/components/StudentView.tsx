import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAcademic, CatalogSubject, EnrolledSubject } from "../context/AcademicContext";
import { WeeklyScheduleGrid } from "./WeeklyScheduleGrid";
import { OfficialReceiptModal } from "./OfficialReceiptModal";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { toast } from "sonner";

type Tab = "tab-inicio" | "tab-bajas" | "tab-altas" | "tab-horario";

export function StudentView() {
  const {
    student,
    enrolledSubjects,
    catalog,
    transactions,
    selectedReceiptTransaction,
    setSelectedReceiptTransaction,
    requestAlta,
    requestBaja,
    checkConflictForCandidate,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<Tab>("tab-inicio");
  const [searchFilter, setSearchFilter] = useState("");
  const navigate = useNavigate();

  // Modal State for Confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "BAJA" | "ALTA" | "RECHAZAR_ADMIN";
    title: string;
    subjectName: string;
    nrc: string;
    details: string;
    credits: number;
    candidateObj?: CatalogSubject | EnrolledSubject;
  }>({
    isOpen: false,
    type: "ALTA",
    title: "",
    subjectName: "",
    nrc: "",
    details: "",
    credits: 0,
  });

  const totalCredits = enrolledSubjects.reduce((acc, s) => acc + (s.credits || 0), 0);
  const pendingTransactions = transactions.filter((t) => t.estatus === "Pendiente (En Fila)");

  // Handle Initiating Baja
  function promptBaja(subject: EnrolledSubject) {
    if (student.bajasRemaining <= 0) {
      toast.error("Límite de bajas alcanzado", {
        description: "No tienes bajas disponibles para este periodo escolar.",
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: "BAJA",
      title: "Confirmación de Solicitud de Baja",
      subjectName: subject.name,
      nrc: subject.nrc,
      details: `${subject.schedule} (${subject.classroom}) • ${subject.teacher}`,
      credits: subject.credits,
      candidateObj: subject,
    });
  }

  // Handle Initiating Alta
  function promptAlta(subject: CatalogSubject) {
    // Check conflict
    const conflict = checkConflictForCandidate(subject.schedule);
    if (conflict.hasConflict) {
      toast.error("Cruce de horario detectado", {
        description: `Esta materia se empalma con ${conflict.conflictingSubjectName} (${conflict.conflictingSchedule}).`,
      });
      return;
    }

    const available = subject.maxCapacity - subject.enrolledCount;
    if (available <= 0) {
      toast.error("Cupo agotado", {
        description: "No quedan lugares disponibles en este grupo (NRC).",
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: "ALTA",
      title: "Confirmar Solicitud de Alta",
      subjectName: subject.name,
      nrc: subject.nrc,
      details: `${subject.schedule} (${subject.classroom}) • ${subject.teacher}`,
      credits: subject.credits,
      candidateObj: subject,
    });
  }

  // Execute confirmed action
  function handleConfirmAction() {
    if (confirmModal.type === "BAJA") {
      const result = requestBaja(confirmModal.nrc);
      if (result.success) {
        toast.success(`Solicitud de Baja generada (${result.folio})`, {
          description: "Tu solicitud ha sido enviada a la Secretaría Académica para su dictamen.",
        });
      } else {
        toast.error("Error en la solicitud", { description: result.error });
      }
    } else if (confirmModal.type === "ALTA") {
      const result = requestAlta(confirmModal.nrc);
      if (result.success) {
        toast.success(`Solicitud de Alta generada (${result.folio})`, {
          description: "Tu solicitud ha sido enviada a la Secretaría Académica para su autorización.",
        });
      } else {
        toast.error("Error en la solicitud", { description: result.error });
      }
    }

    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }

  // Filter Catalog
  const filteredCatalog = catalog.filter((c) => {
    const q = searchFilter.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.nrc.includes(q) ||
      c.teacher.toLowerCase().includes(q) ||
      c.schedule.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans pb-20">
      {/* Top University Header */}
      <header className="bg-[#004A98] text-white px-6 md:px-12 py-3.5 border-b-4 border-[#71A031] shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center font-bold font-mono text-sm border border-white/20">
              UV
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">
                Sistema de <span className="text-[#88B24B]">Altas y Bajas</span>
              </h1>
              <span className="text-[11px] text-white/80 tracking-wide block">
                Sistema Integral de Gestión de Altas y Bajas • Ventanilla Virtual Feb–Jul 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-white leading-tight">{student.name}</div>
              <div className="text-white/70 font-mono text-[11px]">Matrícula: {student.matricula}</div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🚪</span> Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-header Tabs */}
      <div className="bg-[#002B5E] px-6 md:px-12 shadow-inner sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1 py-1">
          {[
            { id: "tab-inicio", label: "Panel General", icon: "📊" },
            { id: "tab-altas", label: "Trámite de Altas", icon: "➕" },
            { id: "tab-bajas", label: "Trámite de Bajas", icon: "➖" },
            { id: "tab-horario", label: "Horario Semanal", icon: "📅" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              className={`px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border-b-3 cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#71A031] text-white border-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.id === "tab-inicio" && pendingTransactions.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full font-black text-[10px]">
                  {pendingTransactions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: PANEL GENERAL / EXPEDIENTE                                         */}
        {/* ========================================================================= */}
        {activeTab === "tab-inicio" && (
          <div className="space-y-6">
            {/* Top Info Grid: Profile Card + KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expediente Académico</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">
                      {student.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20 shrink-0">
                      EF
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{student.name}</h3>
                      <p className="text-xs font-mono font-bold text-blue-700 mt-0.5">{student.matricula}</p>
                      <p className="text-xs text-slate-500">{student.career}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Facultad</span>
                      <span className="font-semibold text-slate-700">FIEE - UV</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Nivel / Semestre</span>
                      <span className="font-semibold text-slate-700">{student.semester}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tutor Asignado:</span>
                  <span className="font-semibold text-slate-800">Dr. Adrián Sánchez</span>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* KPI 1: Bajas */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-[#71A031] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Bajas Disponibles</span>
                      <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm">📉</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{student.bajasRemaining}</span>
                      <span className="text-xs text-slate-500 font-semibold">de {student.maxBajas} permitidas</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    Movimientos reglamentarios restantes para el ciclo escolar Feb–Jul 2026.
                  </p>
                </div>

                {/* KPI 2: Creditos */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-blue-600 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Créditos Inscritos</span>
                      <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">📚</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-700">{totalCredits}</span>
                      <span className="text-xs text-slate-500 font-semibold">({enrolledSubjects.length} EE cargadas)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    Acumulado en trayectoria: <strong>{student.creditsEarned + totalCredits}</strong> créditos.
                  </p>
                </div>

                {/* KPI 3: Trámites en Proceso */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Trámites en Proceso</span>
                      <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm">⏳</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-600">{pendingTransactions.length}</span>
                      <span className="text-xs text-slate-500 font-semibold">solicitud(es)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    En fila de validación ante la Secretaría Académica.
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper: Trámite Lifecycle */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Flujo del Proceso Institucional de Ventanilla
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">Período Ordinario Activo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { step: "1", title: "Solicitud del Alumno", desc: "Selección de NRC y validación de cruces/cupo", status: "completed" },
                  { step: "2", title: "Generación de Folio", desc: "Emisión de Acuse Digital Oficial con QR", status: "completed" },
                  { step: "3", title: "Dictamen Secretaría", desc: "Revisión y autorización por el Administrador", status: pendingTransactions.length > 0 ? "current" : "completed" },
                  { step: "4", title: "Aplicación en Horario", desc: "Impacto automático en Kardex y Aforos de BD", status: "completed" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        s.status === "completed"
                          ? "bg-emerald-500 text-white"
                          : s.status === "current"
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {s.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction History Table with Receipt Link */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Historial de Transacciones (Trazabilidad)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registro de solicitudes emitidas durante el presente periodo de altas y bajas.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                  {transactions.length} Movimientos Registrados
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-3 px-4">Folio Oficial</th>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Experiencia Educativa (NRC)</th>
                      <th className="py-3 px-4">Estatus</th>
                      <th className="py-3 px-4 text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No has generado solicitudes en este periodo.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => (
                        <tr key={t.folio} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{t.folio}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {t.fecha} <span className="text-slate-400 text-[10px] block">{t.hora}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${
                                t.tipo === "ALTA"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {t.tipo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">{t.subjectName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">NRC: {t.nrc} • {t.teacher}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5 ${
                                t.estatus === "Aprobada"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : t.estatus === "Rechazada"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {t.estatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedReceiptTransaction(t)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-[#004A98] text-slate-700 hover:text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Ver Acuse Oficial con código QR"
                            >
                              <span>📄</span> Acuse QR
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Schedule in Home Tab */}
            <WeeklyScheduleGrid enrolledSubjects={enrolledSubjects} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRÁMITE DE ALTAS (Catálogo con validación de Cruce de Horario)      */}
        {/* ========================================================================= */}
        {activeTab === "tab-altas" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Catálogo de Oferta Institucional (Altas)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    El sistema valida en tiempo real la <strong>disponibilidad de cupos</strong> y la <strong>compatibilidad horaria</strong> para evitar empalmes en tu horario.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-72 relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Buscar materia, catedrático o NRC..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>
              </div>

              {/* Validation Rules Guidance Banner */}
              <div className="mb-5 p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <span><strong>Cupo Disponible:</strong> Puedes solicitar alta de inmediato.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <span><strong>Cruce de Horario:</strong> Empalma con otra materia inscrita.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                  <span><strong>Cupo Agotado:</strong> Grupo lleno (0 disponibles).</span>
                </div>
              </div>

              {/* Catalog Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-3 px-3.5">NRC</th>
                      <th className="py-3 px-3.5">Experiencia Educativa</th>
                      <th className="py-3 px-3.5">Catedrático</th>
                      <th className="py-3 px-3.5">Horario / Aula</th>
                      <th className="py-3 px-3.5">Aforo / Cupo</th>
                      <th className="py-3 px-3.5">Estado de Validación</th>
                      <th className="py-3 px-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCatalog.map((cat) => {
                      const isAlreadyEnrolled = enrolledSubjects.some((s) => s.nrc === cat.nrc);
                      const isPending = transactions.some((t) => t.nrc === cat.nrc && t.estatus === "Pendiente (En Fila)");
                      const available = cat.maxCapacity - cat.enrolledCount;
                      const hasCapacity = available > 0;
                      const conflict = checkConflictForCandidate(cat.schedule);

                      let statusBadge = null;
                      let canRequest = false;
                      let blockReason = "";

                      if (isAlreadyEnrolled) {
                        statusBadge = (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold text-[11px] border border-slate-300">
                            ✔ Materia Inscrita
                          </span>
                        );
                        blockReason = "Ya inscrita en tu horario";
                      } else if (isPending) {
                        statusBadge = (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-bold text-[11px] border border-amber-300 animate-pulse">
                            ⏳ Solicitud en Fila
                          </span>
                        );
                        blockReason = "En espera de dictamen";
                      } else if (conflict.hasConflict) {
                        statusBadge = (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-bold text-[11px] border border-amber-300 inline-block">
                              ⚠️ Cruce de Horario
                            </span>
                            <span className="block text-[10px] text-amber-800 font-medium">
                              Empalma con: {conflict.conflictingSubjectName}
                            </span>
                          </div>
                        );
                        blockReason = `Conflicto con ${conflict.conflictingSubjectName}`;
                      } else if (!hasCapacity) {
                        statusBadge = (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md font-bold text-[11px] border border-rose-300">
                            🚫 Cupo Agotado
                          </span>
                        );
                        blockReason = "Aforo máximo alcanzado";
                      } else {
                        canRequest = true;
                        statusBadge = (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[11px] border border-emerald-300">
                            🟢 Cupo Disponible ({available})
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={cat.nrc}
                          className={`hover:bg-slate-50 transition-colors ${
                            !canRequest ? "bg-slate-50/40 text-slate-500" : "bg-white"
                          }`}
                        >
                          <td className="py-3.5 px-3.5 font-mono font-bold text-blue-700">{cat.nrc}</td>
                          <td className="py-3.5 px-3.5">
                            <span className="font-bold text-slate-900 block">{cat.name}</span>
                            <span className="text-[10px] text-slate-400">{cat.credits} Créditos</span>
                          </td>
                          <td className="py-3.5 px-3.5 font-medium text-slate-700">{cat.teacher}</td>
                          <td className="py-3.5 px-3.5">
                            <span className="font-semibold text-slate-800 block">{cat.schedule}</span>
                            <span className="text-[10px] text-slate-500">{cat.classroom}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    available <= 0
                                      ? "bg-rose-500"
                                      : available <= 5
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${(cat.enrolledCount / cat.maxCapacity) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-mono font-bold text-[11px] text-slate-700">
                                {available} / {cat.maxCapacity}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">{statusBadge}</td>
                          <td className="py-3.5 px-3.5 text-right">
                            {canRequest ? (
                              <button
                                onClick={() => promptAlta(cat)}
                                className="px-4 py-2 bg-[#71A031] hover:bg-[#5e8827] text-white rounded-xl font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 ml-auto"
                              >
                                <span>➕</span> Solicitar Alta
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 bg-slate-200 text-slate-400 rounded-xl font-bold text-xs cursor-not-allowed ml-auto block"
                                title={blockReason}
                              >
                                Bloqueado
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TRÁMITE DE BAJAS (Materias Inscritas Actualmente)                  */}
        {/* ========================================================================= */}
        {activeTab === "tab-bajas" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Trámite de Bajas de Experiencias Educativas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecciona la materia que deseas dar de baja de tu horario. Cuentas con{" "}
                    <strong className="text-blue-700">{student.bajasRemaining} bajas disponibles</strong> de {student.maxBajas}.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
                  ⚠️ Acción irreversible tras autorización
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-3 px-4">NRC</th>
                      <th className="py-3 px-4">Experiencia Educativa</th>
                      <th className="py-3 px-4">Catedrático Asignado</th>
                      <th className="py-3 px-4">Horario / Aula</th>
                      <th className="py-3 px-4">Créditos</th>
                      <th className="py-3 px-4 text-right">Acción Operativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrolledSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                          No cuentas con materias inscritas actualmente.
                        </td>
                      </tr>
                    ) : (
                      enrolledSubjects.map((sub) => {
                        const isPendingBaja = transactions.some(
                          (t) => t.nrc === sub.nrc && t.tipo === "BAJA" && t.estatus === "Pendiente (En Fila)"
                        );

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-mono font-bold text-blue-700">{sub.nrc}</td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-900 block text-sm">{sub.name}</span>
                              <span className="text-[10px] text-slate-500">Área Disciplinar FIEE</span>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-700">{sub.teacher}</td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-slate-800 block">{sub.schedule}</span>
                              <span className="text-[10px] text-slate-500">{sub.classroom}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800">{sub.credits} Créditos</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {isPendingBaja ? (
                                <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs inline-block animate-pulse">
                                  ⏳ Baja en Proceso
                                </span>
                              ) : (
                                <button
                                  onClick={() => promptBaja(sub)}
                                  className="px-4 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs hover:shadow-sm"
                                >
                                  Solicitar Baja
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HORARIO SEMANAL                                                    */}
        {/* ========================================================================= */}
        {activeTab === "tab-horario" && (
          <div className="space-y-6">
            <WeeklyScheduleGrid enrolledSubjects={enrolledSubjects} />
          </div>
        )}
      </main>

      {/* Official Receipt Modal */}
      <OfficialReceiptModal
        transaction={selectedReceiptTransaction}
        onClose={() => setSelectedReceiptTransaction(null)}
      />

      {/* Confirm Action Dialog Modal */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        title={confirmModal.title}
        subjectName={confirmModal.subjectName}
        nrc={confirmModal.nrc}
        details={confirmModal.details}
        credits={confirmModal.credits}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
