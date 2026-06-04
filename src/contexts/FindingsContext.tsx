import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Finding, FindingStatus, Assignee } from '../types';
import { MOCK_FINDINGS } from '../data/mockData';

// ─── Actions ───

interface FindingsContextType {
  findings: Finding[];
  getFinding: (id: string) => Finding | undefined;
  updateStatus: (id: string, status: FindingStatus) => void;
  assignTo: (findingId: string, assignees: Assignee[]) => void;
  updateStage: (id: string, stage: Partial<Finding>) => void;
  discardFinding: (id: string) => void;
  addNote: (id: string, note: string) => void;
  addFinding: (finding: Finding) => void;
}

const FindingsContext = createContext<FindingsContextType | null>(null);

// ─── Provider ───

export function FindingsProvider({ children }: { children: ReactNode }) {
  const [findings, setFindings] = useState<Finding[]>([...MOCK_FINDINGS]);

  const getFinding = useCallback((id: string) => {
    return findings.find(f => f.id === id);
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

  return (
    <FindingsContext.Provider value={{
      findings,
      getFinding,
      updateStatus,
      assignTo,
      updateStage,
      discardFinding,
      addNote,
      addFinding,
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
