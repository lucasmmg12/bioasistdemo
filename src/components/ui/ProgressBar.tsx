import type { FindingStatus } from '../../types';
import { FINDING_STATUSES } from '../../constants';
import { Check, Clock, Circle } from 'lucide-react';

interface ProgressBarProps {
  currentStatus: FindingStatus;
  compact?: boolean;
}

const CYCLE_STEPS = FINDING_STATUSES.filter(s => s.step >= 0 && s.step <= 6);

const STEP_COLORS: Record<number, string> = {
  0: 'bg-slate-400',
  1: 'bg-blue-500',
  2: 'bg-amber-500',
  3: 'bg-purple-500',
  4: 'bg-teal-500',
  5: 'bg-emerald-500',
  6: 'bg-green-500',
};

export function ProgressBar({ currentStatus, compact = false }: ProgressBarProps) {
  const currentStep = FINDING_STATUSES.find(s => s.value === currentStatus)?.step ?? 0;

  if (compact) {
    const totalSteps = 7; // 0 through 6
    const progress = currentStatus === 'discarded' ? 0 : ((currentStep) / (totalSteps - 1)) * 100;

    return (
      <div className="w-full">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${currentStep >= 6 ? 'bg-green-500' : 'bg-bio-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-bio-primary transition-all duration-700 ease-out"
          style={{ width: `${Math.max(0, ((currentStep) / (CYCLE_STEPS.length - 1)) * 100 - 5)}%` }}
        />

        {CYCLE_STEPS.map((step) => {
          const isCompleted = currentStep > step.step;
          const isCurrent = currentStep === step.step;

          return (
            <div key={step.value} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? `${STEP_COLORS[step.step]} text-white shadow-md`
                    : isCurrent
                    ? `${STEP_COLORS[step.step]} text-white shadow-lg ring-4 ring-offset-2 ring-${STEP_COLORS[step.step].replace('bg-', '')}/30`
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 animate-pulse" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              <span
                className={`mt-2 text-[9px] font-bold uppercase tracking-wider text-center leading-tight max-w-[70px] ${
                  isCurrent ? 'text-bio-primary' : isCompleted ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Multi-User Progress Bar ───
interface UserProgressBarProps {
  total: number;
  responded: number;
}

export function UserProgressBar({ total, responded }: UserProgressBarProps) {
  const percentage = total > 0 ? (responded / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">Respuestas</span>
        <span className="font-bold text-bio-primary">{responded}/{total}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage === 100 ? 'bg-green-500' : percentage > 0 ? 'bg-bio-primary' : 'bg-slate-200'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
