import React, { useState } from "react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  type: "BAJA" | "ALTA" | "RECHAZAR_ADMIN";
  title: string;
  subjectName?: string;
  nrc?: string;
  details?: string;
  credits?: number;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  type,
  title,
  subjectName,
  nrc,
  details,
  credits,
  onConfirm,
  onCancel,
}) => {
  const [rejectReason, setRejectReason] = useState("Conflicto de cupo no superado");

  if (!isOpen) return null;

  const isBaja = type === "BAJA";
  const isRechazar = type === "RECHAZAR_ADMIN";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
              isBaja || isRechazar ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {isBaja ? "⚠️" : isRechazar ? "❌" : "📝"}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBaja
                ? "Esta operación enviará la solicitud de baja a la Secretaría Académica."
                : isRechazar
                ? "Indica el motivo del dictamen negativo para la bitácora institucional."
                : "Confirma los datos de la Experiencia Educativa para generar tu folio."}
            </p>
          </div>
        </div>

        {/* Details Card */}
        {subjectName && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Experiencia Educativa:</span>
              <strong className="text-slate-800">{subjectName}</strong>
            </div>
            {nrc && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">NRC:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  {nrc}
                </span>
              </div>
            )}
            {credits && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Créditos:</span>
                <span className="font-semibold text-slate-700">{credits} Créditos</span>
              </div>
            )}
            {details && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Horario:</span>
                <span className="font-semibold text-slate-700">{details}</span>
              </div>
            )}
          </div>
        )}

        {/* Warning Callout for Baja */}
        {isBaja && (
          <div className="mt-3.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <span>⚠️</span>
            <span>
              <strong>Aviso reglamentario:</strong> Se descontará 1 baja de tu límite de 5 permitidas. Esta acción es irrevocable una vez dictaminada.
            </span>
          </div>
        )}

        {/* Reject reason input for Admin */}
        {isRechazar && (
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Motivo del Rechazo:</label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="Conflicto de cupo no superado">Conflicto de cupo no superado</option>
              <option value="Incompatibilidad con plan de estudios o seriación">
                Incompatibilidad con plan de estudios o seriación
              </option>
              <option value="Trámite extemporáneo al cierre del periodo">
                Trámite extemporáneo al cierre del periodo
              </option>
              <option value="Dictamen negativo por Consejo Técnico">Dictamen negativo por Consejo Técnico</option>
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(isRechazar ? rejectReason : undefined)}
            className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
              isBaja || isRechazar
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isBaja ? "Confirmar Baja" : isRechazar ? "Rechazar Solicitud" : "Confirmar y Enviar Alta"}
          </button>
        </div>
      </div>
    </div>
  );
};
