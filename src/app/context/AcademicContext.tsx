import React, { createContext, useContext, useState, useEffect } from "react";
import { checkScheduleConflict } from "../utils/scheduleValidator";

export interface StudentProfile {
  name: string;
  matricula: string;
  career: string;
  faculty: string;
  semester: string;
  status: string;
  creditsEarned: number;
  bajasRemaining: number;
  maxBajas: number;
}

export interface EnrolledSubject {
  id: string;
  nrc: string;
  name: string;
  teacher: string;
  schedule: string;
  classroom: string;
  credits: number;
  color: string;
}

export interface CatalogSubject {
  nrc: string;
  name: string;
  teacher: string;
  schedule: string;
  classroom: string;
  credits: number;
  maxCapacity: number;
  enrolledCount: number;
  color: string;
}

export type TransactionType = "ALTA" | "BAJA";
export type TransactionStatus = "Pendiente (En Fila)" | "Aprobada" | "Rechazada";

export interface Transaction {
  folio: string;
  fecha: string;
  hora: string;
  matricula: string;
  studentName: string;
  tipo: TransactionType;
  nrc: string;
  subjectName: string;
  teacher: string;
  schedule: string;
  classroom: string;
  credits: number;
  estatus: TransactionStatus;
  validacion: string;
  motivo?: string;
}

export interface AuditLog {
  id: string;
  fecha: string;
  folio: string;
  sql: string;
  trigger: string;
  revisor: string;
  estatus: "Ejecutado" | "Revertido" | "Rechazado";
}

const INITIAL_STUDENT: StudentProfile = {
  name: "Emiliano Figueroa Monroy",
  matricula: "S20004603",
  career: "Ingeniería Informática",
  faculty: "Facultad de Ingeniería Eléctrica y Electrónica (FIEE)",
  semester: "6° Semestre",
  status: "Alumno Regular Activo",
  creditsEarned: 145,
  bajasRemaining: 3,
  maxBajas: 5,
};

const INITIAL_ENROLLED: EnrolledSubject[] = [
  {
    id: "s-46102",
    nrc: "46102",
    name: "Sistemas Operativos",
    teacher: "Mtro. Josué Tiburcio",
    schedule: "Lu-Mi-Vi 10:00-11:00",
    classroom: "Aula A2",
    credits: 8,
    color: "#3B82F6", // blue
  },
  {
    id: "s-43901",
    nrc: "43901",
    name: "Circuitos Lógicos",
    teacher: "Mtro. Mario Herrera",
    schedule: "Lu-Mi 08:00-10:00",
    classroom: "Aula E1",
    credits: 7,
    color: "#8B5CF6", // purple
  },
  {
    id: "s-45895",
    nrc: "45895",
    name: "Ingeniería de Software",
    teacher: "Mtra. Laura Méndez",
    schedule: "Ma-Ju 08:00-10:00",
    classroom: "Laboratorio L3",
    credits: 8,
    color: "#10B981", // emerald
  },
];

const INITIAL_CATALOG: CatalogSubject[] = [
  {
    nrc: "46102",
    name: "Sistemas Operativos",
    teacher: "Mtro. Josué Tiburcio",
    schedule: "Lu-Mi-Vi 10:00-11:00",
    classroom: "Aula A2",
    credits: 8,
    maxCapacity: 30,
    enrolledCount: 29,
    color: "#3B82F6",
  },
  {
    nrc: "43901",
    name: "Circuitos Lógicos",
    teacher: "Mtro. Mario Herrera",
    schedule: "Lu-Mi 08:00-10:00",
    classroom: "Aula E1",
    credits: 7,
    maxCapacity: 30,
    enrolledCount: 26,
    color: "#8B5CF6",
  },
  {
    nrc: "45895",
    name: "Ingeniería de Software",
    teacher: "Mtra. Laura Méndez",
    schedule: "Ma-Ju 08:00-10:00",
    classroom: "Laboratorio L3",
    credits: 8,
    maxCapacity: 25,
    enrolledCount: 24,
    color: "#10B981",
  },
  {
    nrc: "51204",
    name: "Microcontroladores y Microprocesadores",
    teacher: "Dr. Adrián Sánchez",
    schedule: "Ma-Ju 11:00-13:00",
    classroom: "Lab. Microelectrónica",
    credits: 9,
    maxCapacity: 30,
    enrolledCount: 22,
    color: "#EC4899", // pink
  },
  {
    nrc: "48911",
    name: "Desarrollo de Aplicaciones Web",
    teacher: "Mtro. Josué Tiburcio",
    schedule: "Lu-Mi 12:00-14:00",
    classroom: "Centro Cómputo CC1",
    credits: 8,
    maxCapacity: 30,
    enrolledCount: 26,
    color: "#F59E0B", // amber
  },
  {
    nrc: "45892",
    name: "Bases de Datos Relacionales",
    teacher: "Mtra. Ana María Pérez",
    schedule: "Lu-Mi-Vi 10:00-11:00",
    classroom: "Aula A1",
    credits: 8,
    maxCapacity: 30,
    enrolledCount: 25,
    color: "#6366F1", // indigo (conflicts with Sistemas Operativos)
  },
  {
    nrc: "47201",
    name: "Redes de Computadoras",
    teacher: "Dr. Carlos Hernández",
    schedule: "Ma-Ju 10:00-12:00",
    classroom: "Aula A3",
    credits: 8,
    maxCapacity: 25,
    enrolledCount: 25, // Full capacity (0 available)
    color: "#EF4444", // red
  },
  {
    nrc: "53109",
    name: "Arquitectura de Computadoras",
    teacher: "Dr. Roberto Morales",
    schedule: "Vi 13:00-16:00",
    classroom: "Aula A4",
    credits: 8,
    maxCapacity: 30,
    enrolledCount: 18,
    color: "#06B6D4", // cyan
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    folio: "#TR-1045",
    fecha: "12/Feb/2026",
    hora: "09:30:15",
    matricula: "S20004603",
    studentName: "Emiliano Figueroa Monroy",
    tipo: "ALTA",
    nrc: "48911",
    subjectName: "Desarrollo de Aplicaciones Web",
    teacher: "Mtro. Josué Tiburcio",
    schedule: "Lu-Mi 12:00-14:00",
    classroom: "Centro Cómputo CC1",
    credits: 8,
    estatus: "Pendiente (En Fila)",
    validacion: "✔ Cupo: 4 / 30 • Sin cruce de horario",
  },
  {
    folio: "#TR-0892",
    fecha: "10/Feb/2026",
    hora: "11:14:02",
    matricula: "S20004603",
    studentName: "Emiliano Figueroa Monroy",
    tipo: "BAJA",
    nrc: "54321",
    subjectName: "Física General",
    teacher: "Dr. Roberto Solís",
    schedule: "Ma-Ju 14:00-16:00",
    classroom: "Aula F3",
    credits: 6,
    estatus: "Aprobada",
    validacion: "✔ Bajas restantes: 3 de 5",
  },
];

const INITIAL_AUDIT: AuditLog[] = [
  {
    id: "a1",
    fecha: "10/Feb/2026 11:15:30",
    folio: "#TR-0892",
    sql: "UPDATE Alumno SET Bajas_Disp = Bajas_Disp - 1 WHERE Mat = 'S20004603'; UPDATE Grupo_Oferta SET Cupo = Cupo + 1 WHERE NRC = 54321;",
    trigger: "TRG_Baja_Aprobada",
    revisor: "Secretaría Académica FIEE",
    estatus: "Ejecutado",
  },
];

interface AcademicContextType {
  student: StudentProfile;
  enrolledSubjects: EnrolledSubject[];
  catalog: CatalogSubject[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  selectedReceiptTransaction: Transaction | null;
  setSelectedReceiptTransaction: (t: Transaction | null) => void;
  // Actions
  requestAlta: (nrc: string, motivo?: string) => { success: boolean; folio?: string; error?: string };
  requestBaja: (nrc: string, motivo?: string) => { success: boolean; folio?: string; error?: string };
  authorizeTransaction: (folio: string) => void;
  rejectTransaction: (folio: string, motivo?: string) => void;
  updateCatalogCapacity: (nrc: string, newMax: number) => void;
  resetDemo: () => void;
  checkConflictForCandidate: (schedule: string) => ReturnType<typeof checkScheduleConflict>;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENT: "sigab_fiee_student",
  ENROLLED: "sigab_fiee_enrolled",
  CATALOG: "sigab_fiee_catalog",
  TRANSACTIONS: "sigab_fiee_transactions",
  AUDIT: "sigab_fiee_audit",
};

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT);
    return saved ? JSON.parse(saved) : INITIAL_STUDENT;
  });

  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENROLLED);
    return saved ? JSON.parse(saved) : INITIAL_ENROLLED;
  });

  const [catalog, setCatalog] = useState<CatalogSubject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT;
  });

  const [selectedReceiptTransaction, setSelectedReceiptTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENROLLED, JSON.stringify(enrolledSubjects));
  }, [enrolledSubjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Check schedule conflict helper
  function checkConflictForCandidate(schedule: string) {
    return checkScheduleConflict(schedule, enrolledSubjects);
  }

  // Request ALTA
  function requestAlta(nrc: string, motivo?: string) {
    const candidate = catalog.find((c) => c.nrc === nrc);
    if (!candidate) return { success: false, error: "Materia no encontrada en catálogo." };

    // Check if already enrolled
    if (enrolledSubjects.some((s) => s.nrc === nrc)) {
      return { success: false, error: "La materia ya se encuentra inscrita en tu horario actual." };
    }

    // Check if pending transaction already exists
    if (transactions.some((t) => t.nrc === nrc && t.estatus === "Pendiente (En Fila)")) {
      return { success: false, error: "Ya existe un trámite pendiente en revisión para este NRC." };
    }

    // Check capacity
    const available = candidate.maxCapacity - candidate.enrolledCount;
    if (available <= 0) {
      return { success: false, error: "No hay cupos disponibles en este grupo (Cupo Agotado)." };
    }

    // Check schedule conflict
    const conflict = checkConflictForCandidate(candidate.schedule);
    if (conflict.hasConflict) {
      return {
        success: false,
        error: `Conflicto de horario: Se empalma con '${conflict.conflictingSubjectName}' (${conflict.conflictingSchedule}).`,
      };
    }

    // Generate transaction
    const folio = `#TR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const fecha = now.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
    const hora = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newTx: Transaction = {
      folio,
      fecha,
      hora,
      matricula: student.matricula,
      studentName: student.name,
      tipo: "ALTA",
      nrc: candidate.nrc,
      subjectName: candidate.name,
      teacher: candidate.teacher,
      schedule: candidate.schedule,
      classroom: candidate.classroom,
      credits: candidate.credits,
      estatus: "Pendiente (En Fila)",
      validacion: `✔ Cupo: ${available} / ${candidate.maxCapacity} • Sin cruce de horario`,
      motivo,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setSelectedReceiptTransaction(newTx);

    return { success: true, folio };
  }

  // Request BAJA
  function requestBaja(nrc: string, motivo?: string) {
    const subject = enrolledSubjects.find((s) => s.nrc === nrc);
    if (!subject) return { success: false, error: "La materia no está en tu lista de materias inscritas." };

    if (student.bajasRemaining <= 0) {
      return { success: false, error: "Has agotado tu límite de bajas permitidas para este periodo (0 restantes)." };
    }

    // Check if pending transaction exists
    if (transactions.some((t) => t.nrc === nrc && t.estatus === "Pendiente (En Fila)")) {
      return { success: false, error: "Ya existe una solicitud pendiente para esta materia." };
    }

    const folio = `#TR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const fecha = now.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
    const hora = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const newTx: Transaction = {
      folio,
      fecha,
      hora,
      matricula: student.matricula,
      studentName: student.name,
      tipo: "BAJA",
      nrc: subject.nrc,
      subjectName: subject.name,
      teacher: subject.teacher,
      schedule: subject.schedule,
      classroom: subject.classroom,
      credits: subject.credits,
      estatus: "Pendiente (En Fila)",
      validacion: `✔ Bajas disponibles: ${student.bajasRemaining} de ${student.maxBajas}`,
      motivo,
    };

    setTransactions((prev) => [newTx, ...prev]);
    setSelectedReceiptTransaction(newTx);

    return { success: true, folio };
  }

  // Admin Authorize Transaction
  function authorizeTransaction(folio: string) {
    const tx = transactions.find((t) => t.folio === folio);
    if (!tx || tx.estatus !== "Pendiente (En Fila)") return;

    const now = new Date();
    const fechaHora = now.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "medium" });

    // Update transaction status
    setTransactions((prev) =>
      prev.map((t) => (t.folio === folio ? { ...t, estatus: "Aprobada" as TransactionStatus } : t))
    );

    if (tx.tipo === "ALTA") {
      // Add to enrolled subjects
      const catalogItem = catalog.find((c) => c.nrc === tx.nrc);
      const newEnrolled: EnrolledSubject = {
        id: `s-${tx.nrc}`,
        nrc: tx.nrc,
        name: tx.subjectName,
        teacher: tx.teacher,
        schedule: tx.schedule,
        classroom: tx.classroom,
        credits: tx.credits,
        color: catalogItem?.color || "#3B82F6",
      };

      setEnrolledSubjects((prev) => [...prev, newEnrolled]);

      // Increment enrolledCount in catalog
      setCatalog((prev) =>
        prev.map((c) => (c.nrc === tx.nrc ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
      );

      // Log to audit
      setAuditLogs((prev) => [
        {
          id: `audit-${Date.now()}`,
          fecha: fechaHora,
          folio: tx.folio,
          sql: `INSERT INTO Alumno_Horario (Mat, NRC) VALUES ('${tx.matricula}', '${tx.nrc}'); UPDATE Grupo_Oferta SET Inscritos = Inscritos + 1 WHERE NRC = '${tx.nrc}';`,
          trigger: "TRG_Alta_Aprobada_FIEE",
          revisor: "Secretaría Académica FIEE",
          estatus: "Ejecutado",
        },
        ...prev,
      ]);
    } else if (tx.tipo === "BAJA") {
      // Remove from enrolled subjects
      setEnrolledSubjects((prev) => prev.filter((s) => s.nrc !== tx.nrc));

      // Decrement student bajasRemaining
      setStudent((prev) => ({
        ...prev,
        bajasRemaining: Math.max(0, prev.bajasRemaining - 1),
      }));

      // Decrement enrolledCount in catalog
      setCatalog((prev) =>
        prev.map((c) => (c.nrc === tx.nrc ? { ...c, enrolledCount: Math.max(0, c.enrolledCount - 1) } : c))
      );

      // Log to audit
      setAuditLogs((prev) => [
        {
          id: `audit-${Date.now()}`,
          fecha: fechaHora,
          folio: tx.folio,
          sql: `DELETE FROM Alumno_Horario WHERE Mat = '${tx.matricula}' AND NRC = '${tx.nrc}'; UPDATE Alumno SET Bajas_Disp = Bajas_Disp - 1 WHERE Mat = '${tx.matricula}'; UPDATE Grupo_Oferta SET Inscritos = Inscritos - 1 WHERE NRC = '${tx.nrc}';`,
          trigger: "TRG_Baja_Aprobada_FIEE",
          revisor: "Secretaría Académica FIEE",
          estatus: "Ejecutado",
        },
        ...prev,
      ]);
    }
  }

  // Admin Reject Transaction
  function rejectTransaction(folio: string, motivo: string = "No procede por dictamen de Secretaría Académica") {
    const tx = transactions.find((t) => t.folio === folio);
    if (!tx || tx.estatus !== "Pendiente (En Fila)") return;

    const now = new Date();
    const fechaHora = now.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "medium" });

    setTransactions((prev) =>
      prev.map((t) => (t.folio === folio ? { ...t, estatus: "Rechazada" as TransactionStatus, motivo } : t))
    );

    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        fecha: fechaHora,
        folio: tx.folio,
        sql: `-- Transacción rechazada. Sin modificación en tablas de horarios ni aforos. Motivo: ${motivo}`,
        trigger: "TRG_Dictamen_Rechazado",
        revisor: "Secretaría Académica FIEE",
        estatus: "Rechazado",
      },
      ...prev,
    ]);
  }

  // Admin update capacity
  function updateCatalogCapacity(nrc: string, newMax: number) {
    setCatalog((prev) => prev.map((c) => (c.nrc === nrc ? { ...c, maxCapacity: newMax } : c)));
  }

  // Reset Demo
  function resetDemo() {
    setStudent(INITIAL_STUDENT);
    setEnrolledSubjects(INITIAL_ENROLLED);
    setCatalog(INITIAL_CATALOG);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT);
    setSelectedReceiptTransaction(null);

    localStorage.removeItem(STORAGE_KEYS.STUDENT);
    localStorage.removeItem(STORAGE_KEYS.ENROLLED);
    localStorage.removeItem(STORAGE_KEYS.CATALOG);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
  }

  return (
    <AcademicContext.Provider
      value={{
        student,
        enrolledSubjects,
        catalog,
        transactions,
        auditLogs,
        selectedReceiptTransaction,
        setSelectedReceiptTransaction,
        requestAlta,
        requestBaja,
        authorizeTransaction,
        rejectTransaction,
        updateCatalogCapacity,
        resetDemo,
        checkConflictForCandidate,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error("useAcademic debe ser usado dentro de un AcademicProvider");
  }
  return context;
}
