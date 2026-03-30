import { useState, useRef, useEffect } from 'react';
import {
  Lock, Plus, Image, FileText, Palette, Box, PenTool,
  MoreHorizontal, Trash2, Edit3, Shield, ChevronUp, Square, CheckCircle2,
} from 'lucide-react';
import type { Phase, Block, BlockGroup, PhaseItem } from '../types';

interface PhaseCardProps {
  phase: Phase;
  onGateClick: (gateId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onRenamePhase: (phaseId: string, newName: string) => void;
  onAddGate: (phaseId: string) => void;
  onRemoveGate: (phaseId: string) => void;
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

/* ─── Single block card (288×230, Figma style) ─── */
export function BlockCard({ block, locked }: { block: Block; locked: boolean }) {
  const grad = thumbnailGradients[block.type] || 'from-grey-050 to-grey-100';
  const hasApproval = block.approval && block.approval.status !== 'none';
  const isApproved = block.approval?.status === 'approved';

  return (
    <div
      className={`relative w-[288px] h-[230px] rounded-3xl border border-grey-080 shadow-[0px_1px_2px_rgba(0,0,0,0.07),0px_2px_6px_rgba(0,0,0,0.04)] overflow-hidden bg-white shrink-0
        ${locked ? 'pointer-events-none opacity-70' : 'hover:shadow-lg transition-shadow cursor-pointer'}
      `}
    >
      {/* Thumbnail area */}
      <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <div className="text-grey-300/20 scale-[5]">
          {blockTypeIcons[block.type]}
        </div>
      </div>

      {/* Block info label (top-left) */}
      <div className="absolute top-[9px] left-[10px] flex items-center bg-white rounded-lg shadow-[0px_4px_8px_3px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="w-8 h-8 flex items-center justify-center text-grey-500 shrink-0">
          {blockTypeIcons[block.type]}
        </div>
        <span className="text-xs font-medium text-grey-700 pr-3 whitespace-nowrap">{block.name}</span>
      </div>

      {/* Approval badge (bottom) */}
      {hasApproval && (
        <div className="absolute bottom-[10px] left-[10px] right-[10px]">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1)] px-2.5 py-1.5">
            {isApproved ? (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <Square size={14} className="text-grey-300 shrink-0" />
            )}
            <span className={`text-xs font-medium ${isApproved ? 'text-emerald-700' : 'text-grey-600'}`}>
              {isApproved ? 'Approved' : 'Needs approval'}
            </span>
            {block.approval!.assignees.length > 0 && (
              <div className="flex items-center ml-auto">
                <div className="flex -space-x-1.5">
                  {block.approval!.assignees.slice(0, 1).map((name, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-300 to-indigo-400 border-2 border-white flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">{name.charAt(0)}</span>
                    </div>
                  ))}
                </div>
                {block.approval!.assignees.length > 1 && (
                  <span className="text-[10px] text-grey-500 ml-1 font-medium">
                    +{block.approval!.assignees.length - 1}
                  </span>
                )}
              </div>
            )}
            {block.approval!.dueDate && (
              <span className="text-[10px] text-grey-400 font-medium whitespace-nowrap ml-1">
                {block.approval!.dueDate}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Block group (grey bg container with header, blocks stacked vertically) ─── */
export function BlockGroupCard({ group, locked }: { group: BlockGroup; locked: boolean }) {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false);

  return (
    <div className="bg-grey-050 rounded-3xl overflow-hidden shrink-0 w-[304px]">
      {/* Group header */}
      <div className="flex items-center justify-between px-2 pt-2 pb-0">
        <div className="flex items-center overflow-hidden">
          <button className="flex items-center h-8 px-2 rounded-lg hover:bg-white/60 transition-colors">
            <span className="text-sm font-medium text-grey-700 whitespace-nowrap">{group.name}</span>
          </button>
        </div>
        <div className="flex items-center gap-0.5 pr-1">
          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors">
            <MoreHorizontal size={14} className="text-grey-500" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors"
          >
            <ChevronUp size={14} className={`text-grey-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Group body — blocks stacked vertically with dot separators */}
      {!collapsed && (
        <div className="flex flex-col items-center gap-2 p-2">
          {group.blocks.map((block, i) => (
            <div key={block.id} className="flex flex-col items-center gap-2">
              <BlockCard block={block} locked={locked} />
              {i < group.blocks.length - 1 && (
                <div className="w-2 h-2 rounded-full bg-grey-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Dot connector between items inside a phase ─── */
function ItemDot() {
  return <div className="w-2 h-2 rounded-full bg-grey-200 shrink-0 self-center" />;
}

/* ─── Empty phase block (when no items yet) ─── */
function EmptyPhaseBlock({ isLocked }: { isLocked: boolean }) {
  return (
    <div className={`w-[288px] h-[230px] rounded-3xl border-2 border-dashed shrink-0 flex flex-col items-center justify-center gap-2 ${
      isLocked ? 'border-grey-200 bg-grey-050/50' : 'border-grey-200 bg-white hover:border-primary-500/30 hover:bg-primary-100/20 transition-all cursor-pointer'
    }`}>
      {isLocked ? (
        <>
          <Lock size={24} className="text-grey-200" />
          <span className="text-xs text-grey-300">Phase locked</span>
        </>
      ) : (
        <>
          <Plus size={24} className="text-grey-300" />
          <span className="text-xs text-grey-300">Add a block to start</span>
        </>
      )}
    </div>
  );
}

/* ─── Phase menu (floating, for rename / gate / delete) ─── */
function PhaseMenu({ phase, onDeletePhase, onRenamePhase, onAddGate, onRemoveGate }: {
  phase: Phase;
  onDeletePhase: (id: string) => void;
  onRenamePhase: (id: string, name: string) => void;
  onAddGate: (id: string) => void;
  onRemoveGate: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(phase.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== phase.name) onRenamePhase(phase.id, trimmed);
    else setRenameValue(phase.name);
    setIsRenaming(false);
  };

  return (
    <div className="flex items-center gap-1.5 relative" ref={menuRef}>
      {isRenaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') { setRenameValue(phase.name); setIsRenaming(false); }
          }}
          className="text-sm font-semibold text-grey-700 bg-white border border-primary-500 rounded-md px-2 py-0.5 outline-none w-40"
        />
      ) : (
        <span className="text-sm font-semibold text-grey-700">{phase.name}</span>
      )}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-5 h-5 flex items-center justify-center rounded hover:bg-grey-080 transition-colors"
      >
        <MoreHorizontal size={12} className="text-grey-400" />
      </button>
      {showMenu && (
        <div className="absolute left-0 top-7 z-50 w-48 bg-white border border-grey-080 rounded-xl shadow-lg py-1">
          <button onClick={() => { setIsRenaming(true); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-grey-700 hover:bg-grey-050 transition-colors">
            <Edit3 size={14} className="text-grey-500" /> Rename phase
          </button>
          {!phase.gate ? (
            <button onClick={() => { onAddGate(phase.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-grey-700 hover:bg-grey-050 transition-colors">
              <Shield size={14} className="text-primary-500" /> Add toll gate
            </button>
          ) : (
            <button onClick={() => { onRemoveGate(phase.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <Shield size={14} className="text-red-400" /> Remove toll gate
            </button>
          )}
          <div className="border-t border-grey-080 my-1" />
          <button onClick={() => { onDeletePhase(phase.id); setShowMenu(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} className="text-red-400" /> Delete phase
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main export: renders a phase on the horizontal canvas ─── */
export function PhaseCard({ phase, onDeletePhase, onRenamePhase, onAddGate, onRemoveGate }: PhaseCardProps) {
  const isLocked = phase.status === 'locked';
  const hasItems = phase.items.length > 0;

  const renderItem = (item: PhaseItem) => {
    if (item.kind === 'block') {
      return <BlockCard key={item.block.id} block={item.block} locked={isLocked} />;
    }
    return <BlockGroupCard key={item.group.id} group={item.group} locked={isLocked} />;
  };

  return (
    <div className={`flex flex-col gap-2 shrink-0 ${isLocked ? 'opacity-50' : ''}`}>
      {/* Phase label + menu — always on top */}
      <PhaseMenu
        phase={phase}
        onDeletePhase={onDeletePhase}
        onRenamePhase={onRenamePhase}
        onAddGate={onAddGate}
        onRemoveGate={onRemoveGate}
      />

      {/* Content: items laid out horizontally, or a single empty block */}
      {hasItems ? (
        <div className="flex items-start gap-2">
          {phase.items.map((item: PhaseItem, i: number) => (
            <div key={item.kind === 'block' ? item.block.id : item.group.id} className="flex items-center gap-2">
              {renderItem(item)}
              {i < phase.items.length - 1 && <ItemDot />}
            </div>
          ))}
        </div>
      ) : (
        <EmptyPhaseBlock isLocked={isLocked} />
      )}

      {/* Gate indicator — sits below the phase's content */}
    </div>
  );
}
