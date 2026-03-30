import { useState } from 'react';
import {
  Shield, CheckCircle2, Lock, AlertCircle, Plus,
  Image, FileText, Palette, Box, PenTool,
  MoreHorizontal, ChevronUp, Square,
} from 'lucide-react';
import type { Gate, Block, BlockGroup, GateItem } from '../types';

interface GateColumnProps {
  gate: Gate;
  status: 'locked' | 'active' | 'passed' | 'blocked';
  isActive: boolean;
  onClick: () => void;
}

const blockTypeIcons: Record<string, React.ReactNode> = {
  sketch: <PenTool size={14} />,
  board: <Palette size={14} />,
  doc: <FileText size={14} />,
  cad: <Box size={14} />,
  image: <Image size={14} />,
};

const thumbnailGradients: Record<string, string> = {
  sketch: 'from-blue-50 via-indigo-50 to-blue-100',
  board: 'from-rose-50 via-pink-50 to-rose-100',
  doc: 'from-slate-50 via-zinc-50 to-slate-100',
  cad: 'from-emerald-50 via-teal-50 to-emerald-100',
  image: 'from-amber-50 via-orange-50 to-amber-100',
};

const statusConfig = {
  passed: {
    accent: 'border-emerald-200',
    headerBg: 'bg-emerald-50',
    icon: <CheckCircle2 size={16} className="text-emerald-500" />,
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    badgeLabel: 'Passed',
  },
  active: {
    accent: 'border-amber-200',
    headerBg: 'bg-amber-50',
    icon: <Shield size={16} className="text-amber-500" />,
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    badgeLabel: 'Active',
  },
  blocked: {
    accent: 'border-red-200',
    headerBg: 'bg-red-50',
    icon: <AlertCircle size={16} className="text-red-500" />,
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    badgeLabel: 'Blocked',
  },
  locked: {
    accent: 'border-grey-200',
    headerBg: 'bg-grey-050',
    icon: <Lock size={16} className="text-grey-300" />,
    text: 'text-grey-400',
    badge: 'bg-grey-100 text-grey-400',
    badgeLabel: 'Locked',
  },
};

function BlockCard({ block, locked }: { block: Block; locked: boolean }) {
  const grad = thumbnailGradients[block.type] || 'from-grey-050 to-grey-100';
  const hasApproval = block.approval && block.approval.status !== 'none';
  const isApproved = block.approval?.status === 'approved';

  return (
    <div
      className={`relative w-full h-[180px] rounded-2xl border border-grey-080 shadow-sm overflow-hidden bg-white
        ${locked ? 'pointer-events-none opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <div className="text-grey-300/15 scale-[4]">
          {blockTypeIcons[block.type]}
        </div>
      </div>

      <div className="absolute top-2 left-2 flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="w-7 h-7 flex items-center justify-center text-grey-500 shrink-0">
          {blockTypeIcons[block.type]}
        </div>
        <span className="text-[11px] font-medium text-grey-700 pr-2.5 whitespace-nowrap">{block.name}</span>
      </div>

      {hasApproval && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-1.5 bg-white rounded-lg shadow-sm px-2 py-1">
            {isApproved ? (
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
            ) : (
              <Square size={12} className="text-grey-300 shrink-0" />
            )}
            <span className={`text-[11px] font-medium ${isApproved ? 'text-emerald-700' : 'text-grey-600'}`}>
              {isApproved ? 'Approved' : 'Needs approval'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockGroupCard({ group, locked }: { group: BlockGroup; locked: boolean }) {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false);

  return (
    <div className="bg-grey-050 rounded-2xl overflow-hidden w-full">
      <div className="flex items-center justify-between px-2 pt-2 pb-0">
        <button className="flex items-center h-7 px-2 rounded-lg hover:bg-white/60 transition-colors">
          <span className="text-xs font-medium text-grey-700 whitespace-nowrap">{group.name}</span>
        </button>
        <div className="flex items-center gap-0.5 pr-1">
          <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 transition-colors">
            <MoreHorizontal size={12} className="text-grey-500" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 transition-colors"
          >
            <ChevronUp size={12} className={`text-grey-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col gap-2 p-2">
          {group.blocks.map((block) => (
            <BlockCard key={block.id} block={block} locked={locked} />
          ))}
        </div>
      )}
    </div>
  );
}

export function GateColumn({ gate, status, isActive, onClick }: GateColumnProps) {
  const config = statusConfig[status];
  const isLocked = status === 'locked';
  const completedCount = gate.criteria.filter(c => c.completed).length;
  const totalCount = gate.criteria.length;

  const renderItem = (item: GateItem) => {
    if (item.kind === 'block') {
      return <BlockCard key={item.block.id} block={item.block} locked={isLocked} />;
    }
    return <BlockGroupCard key={item.group.id} group={item.group} locked={isLocked} />;
  };

  return (
    <div
      className={`w-[320px] rounded-2xl border-2 transition-all flex flex-col shrink-0 bg-white overflow-hidden
        ${config.accent}
        ${isActive ? 'ring-2 ring-primary-500/30 shadow-lg' : 'shadow-sm hover:shadow-md'}
        ${isLocked ? 'opacity-60' : ''}
      `}
    >
      {/* Column header — clickable to open gate panel */}
      <button
        onClick={onClick}
        className={`flex items-center justify-between px-4 py-3 ${config.headerBg} transition-colors text-left w-full`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {config.icon}
          <span className={`text-sm font-semibold truncate ${config.text}`}>
            {gate.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === 'active' && totalCount > 0 && (
            <span className={`text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full ${config.badge}`}>
              {completedCount}/{totalCount}
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.badgeLabel}
          </span>
        </div>
      </button>

      {/* Column body — blocks */}
      <div className="flex flex-col gap-3 p-3 min-h-[120px]">
        {(gate.items ?? []).length > 0 ? (
          (gate.items ?? []).map(renderItem)
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed ${
            isLocked ? 'border-grey-200' : 'border-grey-200 hover:border-primary-500/30 transition-colors'
          }`}>
            {isLocked ? (
              <Lock size={20} className="text-grey-200" />
            ) : (
              <>
                <Plus size={20} className="text-grey-300" />
                <span className="text-xs text-grey-300">Add blocks</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
