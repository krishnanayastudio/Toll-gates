import { CheckCircle2, Lock, AlertCircle, Circle } from 'lucide-react';
import type { Gate } from '../types';

interface GateIndicatorProps {
  gate: Gate;
  compact?: boolean;
  onClick?: () => void;
}

export function GateIndicator({ gate, compact = false, onClick }: GateIndicatorProps) {
  const completedCount = gate.criteria.filter(c => c.completed).length;
  const totalCount = gate.criteria.length;
  const statusConfig = {
    passed: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
      label: 'Passed',
    },
    active: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: <Circle size={14} className="text-amber-500" />,
      label: `${completedCount}/${totalCount}`,
    },
    blocked: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: <AlertCircle size={14} className="text-red-500" />,
      label: 'Blocked',
    },
    locked: {
      bg: 'bg-grey-050',
      border: 'border-grey-080',
      text: 'text-grey-300',
      icon: <Lock size={14} className="text-grey-300" />,
      label: 'Locked',
    },
  };

  const config = statusConfig[gate.status];

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
          ${config.bg} ${config.border} ${config.text}
          ${gate.status === 'active' || gate.status === 'passed' ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}
        `}
      >
        {config.icon}
        <span>{gate.name}</span>
        {gate.status === 'active' && (
          <span className="ml-0.5 tabular-nums">{config.label}</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 p-3 rounded-xl border transition-all w-full text-left
        ${config.bg} ${config.border}
        ${gate.status === 'active' ? 'cursor-pointer hover:shadow-md' : gate.status === 'passed' ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`text-sm font-medium ${config.text}`}>{gate.name}</span>
        </div>
        {gate.status === 'active' && (
          <span className={`text-xs font-medium tabular-nums ${config.text}`}>
            {completedCount}/{totalCount}
          </span>
        )}
        {gate.status === 'passed' && (
          <span className="text-xs text-emerald-600">
            {gate.decidedAt}
          </span>
        )}
      </div>



      {gate.status === 'blocked' && gate.blockReason && (
        <p className="text-xs text-red-600">{gate.blockReason}</p>
      )}
    </button>
  );
}
