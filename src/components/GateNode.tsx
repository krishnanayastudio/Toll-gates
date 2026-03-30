import { Shield, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import type { Gate } from '../types';

interface GateNodeProps {
  gate: Gate;
  status: 'locked' | 'active' | 'passed' | 'blocked';
  isActive: boolean;
  onClick: () => void;
}

const statusStyles = {
  passed: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    icon: <CheckCircle2 size={20} className="text-emerald-500" />,
    text: 'text-emerald-700',
    line: 'bg-emerald-300',
  },
  active: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    icon: <Shield size={20} className="text-amber-500" />,
    text: 'text-amber-700',
    line: 'bg-amber-300',
  },
  blocked: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: <AlertCircle size={20} className="text-red-500" />,
    text: 'text-red-700',
    line: 'bg-red-300',
  },
  locked: {
    bg: 'bg-grey-050',
    border: 'border-grey-200',
    icon: <Lock size={20} className="text-grey-300" />,
    text: 'text-grey-400',
    line: 'bg-grey-200',
  },
};

export function GateNode({ gate, status, isActive, onClick }: GateNodeProps) {
  const style = statusStyles[status];
  const completedCount = gate.criteria.filter(c => c.completed).length;
  const totalCount = gate.criteria.length;

  return (
    <div className="flex items-center gap-0 mx-1">
      {/* Line before */}
      <div className={`w-6 h-[2px] ${style.line}`} />

      {/* Gate diamond */}
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-all
          ${style.bg} ${style.border}
          ${isActive ? 'ring-2 ring-primary-500/30 shadow-lg' : 'hover:shadow-md'}
          ${status === 'locked' ? 'cursor-default opacity-60' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2">
          {style.icon}
          <span className={`text-sm font-semibold whitespace-nowrap ${style.text}`}>
            {gate.name}
          </span>
        </div>
        {status === 'active' && totalCount > 0 && (
          <span className="text-xs font-medium tabular-nums text-amber-600">
            {completedCount}/{totalCount} criteria
          </span>
        )}
        {status === 'passed' && gate.decidedAt && (
          <span className="text-xs text-emerald-600">{gate.decidedAt}</span>
        )}
        {status === 'blocked' && (
          <span className="text-xs text-red-600">Blocked</span>
        )}
      </button>

      {/* Line after */}
      <div className={`w-6 h-[2px] ${style.line}`} />
    </div>
  );
}
