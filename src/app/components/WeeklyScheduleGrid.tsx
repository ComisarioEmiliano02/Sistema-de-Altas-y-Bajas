import React from "react";
import { EnrolledSubject } from "../context/AcademicContext";
import { parseScheduleString } from "../utils/scheduleValidator";

interface WeeklyScheduleGridProps {
  enrolledSubjects: EnrolledSubject[];
  previewSubject?: { name: string; nrc: string; schedule: string; classroom: string; teacher: string; color?: string } | null;
}

const DAYS = [
  { key: "Lu", label: "Lunes" },
  { key: "Ma", label: "Martes" },
  { key: "Mi", label: "Miércoles" },
  { key: "Ju", label: "Jueves" },
  { key: "Vi", label: "Viernes" },
];

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({ enrolledSubjects, previewSubject }) => {
  // Convert subjects into visual slots per day
  const slotsByDay: Record<
    string,
    Array<{
      id: string;
      nrc: string;
      name: string;
      teacher: string;
      classroom: string;
      startHour: number;
      durationHours: number;
      color: string;
      isPreview?: boolean;
    }>
  > = { Lu: [], Ma: [], Mi: [], Ju: [], Vi: [] };

  // Add enrolled subjects
  enrolledSubjects.forEach((sub) => {
    const parsed = parseScheduleString(sub.schedule);
    if (!parsed) return;

    const startH = parsed.startMinutes / 60;
    const duration = (parsed.endMinutes - parsed.startMinutes) / 60;

    parsed.days.forEach((dayKey) => {
      if (slotsByDay[dayKey]) {
        slotsByDay[dayKey].push({
          id: `${sub.id}-${dayKey}`,
          nrc: sub.nrc,
          name: sub.name,
          teacher: sub.teacher,
          classroom: sub.classroom,
          startHour: startH,
          durationHours: duration,
          color: sub.color || "#3B82F6",
        });
      }
    });
  });

  // If preview subject provided, add it with dashed border / animation
  if (previewSubject) {
    const parsed = parseScheduleString(previewSubject.schedule);
    if (parsed) {
      const startH = parsed.startMinutes / 60;
      const duration = (parsed.endMinutes - parsed.startMinutes) / 60;

      parsed.days.forEach((dayKey) => {
        if (slotsByDay[dayKey]) {
          slotsByDay[dayKey].push({
            id: `preview-${previewSubject.nrc}-${dayKey}`,
            nrc: previewSubject.nrc,
            name: previewSubject.name,
            teacher: previewSubject.teacher,
            classroom: previewSubject.classroom,
            startHour: startH,
            durationHours: duration,
            color: previewSubject.color || "#F59E0B",
            isPreview: true,
          });
        }
      });
    }
  }

  const totalCredits = enrolledSubjects.reduce((acc, s) => acc + (s.credits || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg text-lg">📅</span>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Horario Semanal Oficial</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribución horaria en tiempo real de tus Experiencias Educativas cargadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
            {enrolledSubjects.length} Materias Inscritas
          </div>
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">
            {totalCredits} Créditos Totales
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Row: Days */}
          <div className="grid grid-cols-[70px_repeat(5,1fr)] bg-slate-50 border-y border-slate-200 text-xs font-bold text-slate-700 text-center">
            <div className="py-2.5 px-2 border-r border-slate-200 text-slate-400">HORA</div>
            {DAYS.map((d) => (
              <div key={d.key} className="py-2.5 px-2 border-r border-slate-200 last:border-r-0">
                <span className="hidden md:inline">{d.label}</span>
                <span className="md:hidden">{d.key}</span>
              </div>
            ))}
          </div>

          {/* Time Rows */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[70px_repeat(5,1fr)] h-14 border-b border-slate-100 text-xs"
              >
                <div className="py-1 px-2 border-r border-slate-200 font-mono text-[11px] text-slate-400 text-right pr-3 bg-slate-50/50">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {DAYS.map((d) => (
                  <div key={d.key} className="border-r border-slate-100 last:border-r-0 relative hover:bg-slate-50/50 transition-colors" />
                ))}
              </div>
            ))}

            {/* Absolute Placed Subject Blocks */}
            {DAYS.map((d, colIndex) => {
              const daySlots = slotsByDay[d.key] || [];

              return daySlots.map((slot) => {
                const topOffset = (slot.startHour - 7) * 56; // 56px per hour
                const height = slot.durationHours * 56 - 4;
                const leftPercent = (colIndex / 5) * 100;
                const widthPercent = (1 / 5) * 100;

                return (
                  <div
                    key={slot.id}
                    style={{
                      position: "absolute",
                      top: `${topOffset + 2}px`,
                      left: `calc(70px + (100% - 70px) * ${leftPercent / 100} + 4px)`,
                      width: `calc((100% - 70px) * ${widthPercent / 100} - 8px)`,
                      height: `${height}px`,
                      backgroundColor: slot.isPreview ? "#FEF3C7" : `${slot.color}15`,
                      borderLeft: `4px solid ${slot.color}`,
                      borderTop: slot.isPreview ? "2px dashed #F59E0B" : `1px solid ${slot.color}30`,
                      borderRight: slot.isPreview ? "2px dashed #F59E0B" : `1px solid ${slot.color}30`,
                      borderBottom: slot.isPreview ? "2px dashed #F59E0B" : `1px solid ${slot.color}30`,
                    }}
                    className={`rounded-md p-1.5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer z-10 ${
                      slot.isPreview ? "animate-pulse" : ""
                    }`}
                    title={`${slot.name} (NRC: ${slot.nrc}) - ${slot.teacher} - ${slot.classroom}`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="font-bold text-[11px] leading-tight truncate"
                          style={{ color: slot.isPreview ? "#B45309" : slot.color }}
                        >
                          {slot.name}
                        </span>
                        <span
                          className="text-[9px] px-1 py-0.2 rounded font-mono font-bold"
                          style={{
                            backgroundColor: `${slot.color}25`,
                            color: slot.color,
                          }}
                        >
                          {slot.nrc}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{slot.classroom}</p>
                    </div>

                    <div className="text-[9px] text-slate-600 truncate font-medium">
                      {slot.teacher.split(" ").slice(0, 2).join(" ")}
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
