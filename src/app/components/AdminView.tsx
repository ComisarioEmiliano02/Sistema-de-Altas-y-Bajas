import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAcademic, Transaction } from "../context/AcademicContext";
import { OfficialReceiptModal } from "./OfficialReceiptModal";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { toast } from "sonner";

type AdminTab = "tab-inbox" | "tab-audit" | "tab-catalogs";

export function AdminView() {
  const {
    catalog,
    transactions,
    auditLogs,
    selectedReceiptTransaction,
    setSelectedReceiptTransaction,
    authorizeTransaction,
    rejectTransaction,
    updateCatalogCapacity,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<AdminTab>("tab-inbox");
  const [filterType, setFilterType] = useState<"ALL" | "ALTA" | "BAJA">("ALL");
  const [selectedNrcToEdit, setSelectedNrcToEdit] = useState<string>("48911");
  const [newCapacityValue, setNewCapacityValue] = useState<number>(35);
  const navigate = useNavigate();

  // Reject Modal State
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    transaction: Transaction | null;
  }>({
    isOpen: false,
    transaction: null,
  });

  const pendingTransactions = transactions.filter((t) => t.estatus === "Pendiente (En Fila)");
  const filteredPending = pendingTransactions.filter((t) => {
    if (filterType === "ALL") return true;
    return t.tipo === filterType;
  });

  function handleAuthorize(tx: Transaction) {
    authorizeTransaction(tx.folio);
    toast.success(`Dictamen Aprobado (${tx.folio})`, {
      description: `Se ejecutó el Trigger automático para ${tx.tipo === "ALTA" ? "alta de cupo e inscripción" : "liberación de aforo y baja"}.`,
    });
  }

  function promptReject(tx: Transaction) {
    setRejectModal({
      isOpen: true,
      transaction: tx,
    });
  }

  function handleConfirmReject(reason?: string) {
    if (rejectModal.transaction) {
      rejectTransaction(rejectModal.transaction.folio, reason);
      toast.info(`Solicitud Rechazada (${rejectModal.transaction.folio})`, {
        description: `Motivo registrado en bitácora: ${reason}`,
      });
    }
    setRejectModal({ isOpen: false, transaction: null });
  }

  function handleUpdateCapacity(e: React.FormEvent) {
    e.preventDefault();
    updateCatalogCapacity(selectedNrcToEdit, Number(newCapacityValue));
    toast.success(`Aforo actualizado para NRC ${selectedNrcToEdit}`, {
      description: `Nuevo cupo máximo asignado: ${newCapacityValue} estudiantes.`,
    });
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans pb-20">
      {/* Admin Top Header */}
      <header className="bg-[#002B5E] text-white px-6 md:px-12 py-3.5 border-b-4 border-[#71A031] shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center font-bold text-sm border border-white/20">
              🛡️
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase">
                SIGAB <span className="text-[#88B24B]">FIEE</span> | Panel de Control
              </h1>
              <span className="text-[11px] text-white/80 tracking-wide block">
                Secretaría Académica • Módulo de Dictamen y Auditoría en Tiempo Real
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-white leading-tight">Secretaría Académica FIEE</div>
              <div className="text-white/70 text-[11px]">Rol: Administrador General (SuperAdmin)</div>
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

      {/* Admin Tabs */}
      <div className="bg-[#001D40] px-6 md:px-12 shadow-inner sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1 py-1">
          {[
            { id: "tab-inbox", label: "Bandeja de Solicitudes", icon: "📥", count: pendingTransactions.length },
            { id: "tab-audit", label: "Auditoría (Logs de Triggers)", icon: "📋", count: auditLogs.length },
            { id: "tab-catalogs", label: "Gestión de Aforos (NRC)", icon: "⚙️" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as AdminTab)}
              className={`px-4 py-3 text-xs md:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 border-b-3 cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#71A031] text-white border-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full font-black text-[10px] ${
                    t.id === "tab-inbox" ? "bg-amber-400 text-slate-950 animate-bounce" : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: INBOX (Bandeja de Solicitudes en Tiempo Real)                     */}
        {/* ========================================================================= */}
        {activeTab === "tab-inbox" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Bandeja de Peticiones Estudiantiles en Vivo</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Revisa las solicitudes entrantes. Autorizar ejecutará los <strong>Triggers automáticos</strong> de actualización en base de datos.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setFilterType("ALL")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterType === "ALL" ? "bg-[#004A98] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Todas ({pendingTransactions.length})
                  </button>
                  <button
                    onClick={() => setFilterType("ALTA")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterType === "ALTA" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Altas ({pendingTransactions.filter((t) => t.tipo === "ALTA").length})
                  </button>
                  <button
                    onClick={() => setFilterType("BAJA")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      filterType === "BAJA" ? "bg-rose-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Bajas ({pendingTransactions.filter((t) => t.tipo === "BAJA").length})
                  </button>
                </div>
              </div>

              {/* Real-time Alert Notification */}
              {pendingTransactions.length > 0 && (
                <div className="mb-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <span>
                      Hay <strong>{pendingTransactions.length} solicitud(es)</strong> pendientes de dictamen en este momento.
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-mono">Sincronización Activa</span>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-3 px-3.5">Folio / Hora</th>
                      <th className="py-3 px-3.5">Matrícula & Alumno</th>
                      <th className="py-3 px-3.5">Tipo</th>
                      <th className="py-3 px-3.5">Experiencia Educativa</th>
                      <th className="py-3 px-3.5">Validación Lógica</th>
                      <th className="py-3 px-3.5 text-right">Acciones de Dictamen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPending.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                          <div className="text-3xl mb-2">🎉</div>
                          No hay solicitudes pendientes en esta categoría.
                        </td>
                      </tr>
                    ) : (
                      filteredPending.map((tx) => (
                        <tr key={tx.folio} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-3.5">
                            <span className="font-mono font-bold text-blue-700 block">{tx.folio}</span>
                            <span className="text-[10px] text-slate-400">{tx.fecha} • {tx.hora}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <strong className="text-slate-900 block">{tx.studentName}</strong>
                            <span className="font-mono text-[11px] text-slate-500">{tx.matricula}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase ${
                                tx.tipo === "ALTA"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {tx.tipo}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="font-semibold text-slate-900 block">{tx.subjectName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">NRC: {tx.nrc} • {tx.teacher}</span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="text-emerald-700 font-semibold block">{tx.validacion}</span>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedReceiptTransaction(tx)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                title="Ver Acuse Oficial"
                              >
                                📄
                              </button>
                              <button
                                onClick={() => handleAuthorize(tx)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                              >
                                <span>✔</span> Autorizar
                              </button>
                              <button
                                onClick={() => promptReject(tx)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AUDITORÍA (Logs de SQL Triggers y Modificaciones)                  */}
        {/* ========================================================================= */}
        {activeTab === "tab-audit" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Historial de Auditoría (Trazabilidad SQL / Triggers)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registro inmutable de sentencias DML y Triggers ejecutados automáticamente por el sistema al autorizar movimientos.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                  {auditLogs.length} Registros en Bitácora
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                      <th className="py-3 px-3.5">Fecha y Hora</th>
                      <th className="py-3 px-3.5">Folio</th>
                      <th className="py-3 px-3.5">Operación Ejecutada en Base de Datos (SQL)</th>
                      <th className="py-3 px-3.5">Trigger Activado</th>
                      <th className="py-3 px-3.5">Revisor</th>
                      <th className="py-3 px-3.5 text-right">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">{log.fecha}</td>
                        <td className="py-3 px-3.5 font-bold text-blue-700">{log.folio}</td>
                        <td className="py-3 px-3.5 text-slate-800 max-w-md">
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 text-[11px] block whitespace-pre-wrap">
                            {log.sql}
                          </code>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 font-bold text-[10px]">
                            {log.trigger}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 font-sans text-xs">{log.revisor}</td>
                        <td className="py-3 px-3.5 text-right font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              log.estatus === "Ejecutado"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {log.estatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GESTIÓN DE CATÁLOGOS Y AFOROS                                      */}
        {/* ========================================================================= */}
        {activeTab === "tab-catalogs" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Master Entities */}
            <div className="bg-white rounded-2xl p-0 border border-slate-200 shadow-sm overflow-hidden h-fit">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">
                Entidades Maestras
              </div>
              <ul className="divide-y divide-slate-100 text-xs">
                {[
                  { icon: "👩‍🎓", label: "Alumnos Matriculados", active: false },
                  { icon: "👨‍🏫", label: "Plantilla Docente", active: false },
                  { icon: "📚", label: "Experiencias Educativas", active: false },
                  { icon: "📅", label: "Oferta de Grupos (NRC)", active: true },
                ].map((item) => (
                  <li
                    key={item.label}
                    className={`p-3.5 flex items-center gap-2.5 font-bold transition-colors cursor-pointer ${
                      item.active ? "bg-[#71A031] text-white" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Catalog View & Capacity Config */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Capacity Adjustment Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Configuración Rápida de Aforo (Cupo Máximo)</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Modifica la capacidad de un grupo en tiempo real. Los estudiantes verán reflejado el nuevo cupo inmediatamente.
                </p>

                <form onSubmit={handleUpdateCapacity} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NRC a Modificar:</label>
                    <select
                      value={selectedNrcToEdit}
                      onChange={(e) => {
                        setSelectedNrcToEdit(e.target.value);
                        const sub = catalog.find((c) => c.nrc === e.target.value);
                        if (sub) setNewCapacityValue(sub.maxCapacity);
                      }}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                    >
                      {catalog.map((c) => (
                        <option key={c.nrc} value={c.nrc}>
                          NRC: {c.nrc} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nuevo Cupo Máximo:</label>
                    <input
                      type="number"
                      min={10}
                      max={60}
                      value={newCapacityValue}
                      onChange={(e) => setNewCapacityValue(Number(e.target.value))}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-[#004A98] hover:bg-[#002B5E] text-white rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      Actualizar Capacidad
                    </button>
                  </div>
                </form>
              </div>

              {/* Group Capacity Table */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Estado Actual de Grupos y Aforos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                        <th className="py-3 px-3.5">NRC</th>
                        <th className="py-3 px-3.5">Materia</th>
                        <th className="py-3 px-3.5">Docente</th>
                        <th className="py-3 px-3.5">Inscritos</th>
                        <th className="py-3 px-3.5">Cupo Máx.</th>
                        <th className="py-3 px-3.5">Disponibles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {catalog.map((c) => {
                        const available = c.maxCapacity - c.enrolledCount;
                        return (
                          <tr key={c.nrc} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3.5 font-mono font-bold text-blue-700">{c.nrc}</td>
                            <td className="py-3 px-3.5 font-semibold text-slate-900">{c.name}</td>
                            <td className="py-3 px-3.5 text-slate-600">{c.teacher}</td>
                            <td className="py-3 px-3.5 font-mono text-slate-700">{c.enrolledCount}</td>
                            <td className="py-3 px-3.5 font-mono font-bold text-slate-800">{c.maxCapacity}</td>
                            <td className="py-3 px-3.5">
                              <span
                                className={`font-mono font-bold ${
                                  available <= 0 ? "text-rose-600" : "text-emerald-600"
                                }`}
                              >
                                {available} lugares
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Official Receipt Modal */}
      <OfficialReceiptModal
        transaction={selectedReceiptTransaction}
        onClose={() => setSelectedReceiptTransaction(null)}
      />

      {/* Confirm Reject Modal */}
      <ConfirmActionModal
        isOpen={rejectModal.isOpen}
        type="RECHAZAR_ADMIN"
        title="Dictamen Negativo de Solicitud"
        subjectName={rejectModal.transaction?.subjectName}
        nrc={rejectModal.transaction?.nrc}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectModal({ isOpen: false, transaction: null })}
      />
    </div>
  );
}
