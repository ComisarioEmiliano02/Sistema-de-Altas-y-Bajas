import React from "react";
import { Transaction } from "../context/AcademicContext";

interface OfficialReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isAlta = transaction.tipo === "ALTA";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="p-1 bg-blue-600 rounded text-xs font-bold font-mono">UV</span>
            <span className="text-sm font-semibold tracking-wide">Acuse Institucional de Trámite Escolar</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 md:p-8 space-y-6 text-slate-800" id="receipt-print-area">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#004A98]">
                  SIGAB <span className="text-[#71A031]">FIEE</span>
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  SISTEMA OFICIAL
                </span>
              </div>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                Universidad Veracruzana • Facultad de Ingeniería Eléctrica y Electrónica
              </h2>
              <p className="text-[11px] text-slate-500">
                Secretaría Académica • Ventanilla Digital de Altas y Bajas (Feb – Jul 2026)
              </p>
            </div>

            {/* Folio Stamp */}
            <div className="text-right bg-slate-50 border border-slate-200 p-2.5 rounded-lg shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Folio de Control</span>
              <span className="font-mono text-base font-black text-[#004A98]">{transaction.folio}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{transaction.fecha} • {transaction.hora}</span>
            </div>
          </div>

          {/* Document Title & Status Banner */}
          <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Comprobante Oficial de Movimiento
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Solicitud de {isAlta ? "Alta de Experiencia Educativa" : "Baja de Experiencia Educativa"}
              </h3>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs ${
                  transaction.estatus === "Aprobada"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : transaction.estatus === "Rechazada"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {transaction.estatus}
              </span>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Estudiante</span>
              <strong className="text-slate-800">{transaction.studentName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Matrícula</span>
              <strong className="font-mono text-slate-800">{transaction.matricula}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Programa Educativo</span>
              <strong className="text-slate-800">Ingeniería Informática</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Periodo Escolar</span>
              <strong className="text-slate-800">Feb – Jul 2026</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Tipo de Trámite</span>
              <strong className={isAlta ? "text-blue-700" : "text-rose-700"}>
                {transaction.tipo === "ALTA" ? "Inscripción en Ventanilla" : "Baja Reglamentaria"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Créditos de la EE</span>
              <strong className="text-slate-800">{transaction.credits} Créditos</strong>
            </div>
          </div>

          {/* Subject Detail Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 border-b border-slate-200 uppercase text-[11px] tracking-wide">
              Detalle de la Experiencia Educativa
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Materia:</span>
                <span className="font-bold text-slate-900 text-sm">{transaction.subjectName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">NRC de Grupo:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {transaction.nrc}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Catedrático Asignado:</span>
                <span className="font-semibold text-slate-800">{transaction.teacher}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-500">Horario y Aula:</span>
                <span className="font-semibold text-slate-800">{transaction.schedule} ({transaction.classroom})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Regla de Validación:</span>
                <span className="font-semibold text-emerald-700">{transaction.validacion}</span>
              </div>
            </div>
          </div>

          {/* Digital Seal & QR Code */}
          <div className="border-t border-dashed border-slate-300 pt-4 flex items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-sm">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                Sello Digital de Autenticidad (Firma Electrónica UV)
              </span>
              <p className="font-mono text-[9px] text-slate-500 break-all leading-tight bg-slate-50 p-2 rounded border border-slate-200">
                SHA256: 8f4a9b2c3d1e0f7a9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f||{transaction.folio}||{transaction.matricula}||{transaction.nrc}
              </p>
              <p className="text-[10px] text-slate-400">
                Este acuse digital cuenta con validez oficial ante la Secretaría Académica de la FIEE.
              </p>
            </div>

            {/* Simulated QR Code SVG */}
            <div className="flex flex-col items-center shrink-0 p-2 bg-white border border-slate-300 rounded-lg shadow-2xs">
              <svg width="68" height="68" viewBox="0 0 100 100" className="text-slate-800">
                {/* QR Pattern Representation */}
                <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                <rect x="40" y="10" width="10" height="20" fill="currentColor" />
                <rect x="55" y="10" width="10" height="10" fill="currentColor" />
                <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                <rect x="70" y="45" width="20" height="10" fill="currentColor" />
                <rect x="10" y="45" width="20" height="10" fill="currentColor" />
                <rect x="70" y="70" width="10" height="20" fill="currentColor" />
                <rect x="85" y="80" width="10" height="10" fill="currentColor" />
                <rect x="45" y="75" width="15" height="15" fill="currentColor" />
              </svg>
              <span className="text-[8px] font-mono font-bold text-slate-500 mt-1">VERIFICAR QR</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            <span>🖨️</span> Imprimir Comprobante
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#004A98] text-white rounded-xl text-xs font-bold hover:bg-[#002B5E] transition-colors shadow-xs cursor-pointer"
            >
              Aceptar y Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
