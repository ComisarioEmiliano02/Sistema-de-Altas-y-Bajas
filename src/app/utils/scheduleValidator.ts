export interface ParsedTimeSlot {
  days: string[]; // ["Lu", "Mi", "Vi"]
  startMinutes: number; // e.g. 10 * 60 = 600
  endMinutes: number;   // e.g. 11 * 60 = 660
  raw: string;
}

const DAY_MAP: Record<string, string> = {
  lu: "Lu",
  lun: "Lu",
  lunes: "Lu",
  ma: "Ma",
  mar: "Ma",
  martes: "Ma",
  mi: "Mi",
  mie: "Mi",
  miercoles: "Mi",
  miércoles: "Mi",
  ju: "Ju",
  jue: "Ju",
  jueves: "Ju",
  vi: "Vi",
  vie: "Vi",
  viernes: "Vi",
  sa: "Sa",
  sab: "Sa",
  sábado: "Sa",
  sabado: "Sa",
};

/**
 * Parsea un string de horario como:
 * "Lu-Mi-Vi 10:00-11:00" o "Ma-Ju 08:00-10:00" o "Vi 13:00-16:00"
 */
export function parseScheduleString(scheduleStr: string): ParsedTimeSlot | null {
  if (!scheduleStr) return null;

  try {
    // Extraer la parte de días y horas (ignorar aula en paréntesis al final)
    const cleanStr = scheduleStr.replace(/\(.*?\)/g, "").trim();

    // Regex para capturar Días y Rango de Horas
    const match = cleanStr.match(/([A-Za-z\-áéíóúÁÉÍÓÚ]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (!match) return null;

    const daysPart = match[1];
    const startTimeStr = match[2];
    const endTimeStr = match[3];

    // Obtener lista de días
    const dayTokens = daysPart.split("-").map(d => d.trim().toLowerCase());
    const days: string[] = [];

    for (const token of dayTokens) {
      if (DAY_MAP[token]) {
        days.push(DAY_MAP[token]);
      }
    }

    if (days.length === 0) return null;

    // Convertir horas a minutos desde las 00:00
    const [startH, startM] = startTimeStr.split(":").map(Number);
    const [endH, endM] = endTimeStr.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return {
      days,
      startMinutes,
      endMinutes,
      raw: scheduleStr,
    };
  } catch (err) {
    console.error("Error parsing schedule:", scheduleStr, err);
    return null;
  }
}

/**
 * Comprueba si dos horarios se cruzan/traslapan en algún día y rango de horas
 */
export function doSchedulesOverlap(scheduleA: string, scheduleB: string): boolean {
  const slotA = parseScheduleString(scheduleA);
  const slotB = parseScheduleString(scheduleB);

  if (!slotA || !slotB) return false;

  // Verificar si comparten al menos un día
  const sharedDays = slotA.days.filter(d => slotB.days.includes(d));
  if (sharedDays.length === 0) return false;

  // Se cruzan si (startA < endB) y (endA > startB)
  return slotA.startMinutes < slotB.endMinutes && slotA.endMinutes > slotB.startMinutes;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingSubjectName?: string;
  conflictingSubjectNrc?: string;
  conflictingSchedule?: string;
  reason?: string;
}

/**
 * Comprueba si una materia candidata choca con alguna de las materias inscritas
 */
export function checkScheduleConflict(
  candidateSchedule: string,
  enrolledSubjects: Array<{ name: string; nrc: string; schedule: string }>
): ConflictCheckResult {
  for (const enrolled of enrolledSubjects) {
    if (doSchedulesOverlap(candidateSchedule, enrolled.schedule)) {
      return {
        hasConflict: true,
        conflictingSubjectName: enrolled.name,
        conflictingSubjectNrc: enrolled.nrc,
        conflictingSchedule: enrolled.schedule,
        reason: `Empalme con ${enrolled.name} (${enrolled.schedule})`,
      };
    }
  }

  return { hasConflict: false };
}
