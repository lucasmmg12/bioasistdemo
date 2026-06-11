import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Finding, FindingStatus, Assignee } from '../types';
import { MOCK_FINDINGS } from '../data/mockData';

// ─── Actions ───

interface FindingsContextType {
  findings: Finding[];
  getFinding: (id: string) => Finding | undefined;
  getFindingByTrackingId: (trackingId: string) => Finding | undefined;
  updateStatus: (id: string, status: FindingStatus) => void;
  assignTo: (findingId: string, assignees: Assignee[]) => void;
  updateStage: (id: string, stage: Partial<Finding>) => void;
  discardFinding: (id: string) => void;
  addNote: (id: string, note: string) => void;
  addFinding: (finding: Finding) => void;
  submitResolution: (id: string, data: { immediateAction: string; rootCause?: string; rootCauseMethod?: string; correctivePlan?: string; implementationDate?: string }) => void;
  returnFinding: (id: string, reason: string) => void;
}

const FindingsContext = createContext<FindingsContextType | null>(null);

// ─── Provider ───

export function FindingsProvider({ children }: { children: ReactNode }) {
  const [findings, setFindings] = useState<Finding[]>([...MOCK_FINDINGS]);

  const getFinding = useCallback((id: string) => {
    return findings.find(f => f.id === id);
  }, [findings]);

  const getFindingByTrackingId = useCallback((trackingId: string) => {
    return findings.find(f => f.tracking_id.toLowerCase() === trackingId.toLowerCase());
  }, [findings]);

  const updateStatus = useCallback((id: string, status: FindingStatus) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== id) return f;
      const now = new Date().toISOString();
      const noteEntry = `[${new Date().toLocaleString('es-AR')}] 🔄 Estado actualizado a: ${status}`;
      return {
        ...f,
        status,
        updated_at: now,
        notes: f.notes ? `${f.notes}\n\n${noteEntry}` : noteEntry,
      };
    }));
  }, []);

  const assignTo = useCallback((findingId: string, assignees: Assignee[]) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      const now = new Date().toISOString();
      const names = assignees.map(a => a.name).join(', ');
      const noteEntry = `[${new Date().toLocaleString('es-AR')}] 🔔 Derivado a: ${names}`;
      return {
        ...f,
        assigned_to: assignees,
        status: f.status === 'pending' ? 'immediate_action' : f.status,
        updated_at: now,
        notes: f.notes ? `${f.notes}\n\n${noteEntry}` : noteEntry,
      };
    }));
  }, []);

  const updateStage = useCallback((id: string, stage: Partial<Finding>) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== id) return f;
      const now = new Date().toISOString();
      return { ...f, ...stage, updated_at: now };
    }));
  }, []);

  const discardFinding = useCallback((id: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== id) return f;
      const now = new Date().toISOString();
      const noteEntry = `[${new Date().toLocaleString('es-AR')}] ❌ Hallazgo descartado`;
      return {
        ...f,
        status: 'discarded' as FindingStatus,
        updated_at: now,
        notes: f.notes ? `${f.notes}\n\n${noteEntry}` : noteEntry,
      };
    }));
  }, []);

  const addNote = useCallback((id: string, note: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== id) return f;
      const now = new Date().toISOString();
      const noteEntry = `[${new Date().toLocaleString('es-AR')}] ${note}`;
      return {
        ...f,
        updated_at: now,
        notes: f.notes ? `${f.notes}\n\n${noteEntry}` : noteEntry,
      };
    }));
  }, []);

  const addFinding = useCallback((finding: Finding) => {
    setFindings(prev => [finding, ...prev]);
  }, []);

  const submitResolution = useCallback((id: string, data: { immediateAction: string; rootCause?: string; rootCauseMethod?: string; correctivePlan?: string; implementationDate?: string }) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== id) return f;
      const now = new Date().toISOString();
      const ts = new Date().toLocaleString('es-AR');
      const noteEntry = `[${ts}] ✅ RESOLUCIÓN RECIBIDA: ${f.assigned_to.find(a => !a.responded)?.name || 'Responsable'} completó su gestión`;
      const updatedAssignees = f.assigned_to.map(a => a.responded ? a : { ...a, responded: true, response_date: now });
      return {
        ...f,
        status: 'verification' as FindingStatus,
        immediate_action: data.immediateAction,
        immediate_action_by: updatedAssignees[0]?.name || 'Responsable',
        immediate_action_date: now,
        root_cause: data.rootCause || f.root_cause,
        root_cause_method: (data.rootCauseMethod as any) || f.root_cause_method,
        root_cause_by: data.rootCause ? (updatedAssignees[0]?.name || 'Responsable') : f.root_cause_by,
        root_cause_date: data.rootCause ? now : f.root_cause_date,
        corrective_plan: data.correctivePlan || f.corrective_plan,
        corrective_plan_by: data.correctivePlan ? (updatedAssignees[0]?.name || 'Responsable') : f.corrective_plan_by,
        corrective_plan_date: data.correctivePlan ? now : f.corrective_plan_date,
        assigned_to: updatedAssignees,
        updated_at: now,
        notes: f.notes ? `${f.notes}\n\n${noteEntry}` : noteEntry,
      };
    }));
  }, []);

  const returnFinding = useCallback((id: string, reason: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== id) return f;
      const now = new Date().toISOString();
      const ts = new Date().toLocaleString('es-AR');
      const noteEntry = `[${ts}] ⚠️ DEVUELTO POR CALIDAD: ${reason}`;
      const resetAssignees = f.assigned_to.map(a => ({ ...a, responded: false, response_date: undefined }));
      return {
        ...f,
        status: 'corrective_plan' as FindingStatus,
        assigned_to: resetAssignees,
        updated_at: now,
        notes: f.notes ? `${f.notes}\n\n${noteEntry}` : noteEntry,
      };
    }));
  }, []);

  return (
    <FindingsContext.Provider value={{
      findings,
      getFinding,
      getFindingByTrackingId,
      updateStatus,
      assignTo,
      updateStage,
      discardFinding,
      addNote,
      addFinding,
      submitResolution,
      returnFinding,
    }}>
      {children}
    </FindingsContext.Provider>
  );
}

// ─── Hook ───

export function useFindings() {
  const context = useContext(FindingsContext);
  if (!context) throw new Error('useFindings must be used within FindingsProvider');
  return context;
}
