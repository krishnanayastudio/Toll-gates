import { useState, useRef, useEffect } from 'react';
import { Plus, Edit3, Shield, Trash2 } from 'lucide-react';
import type { Phase } from '../types';

interface PhaseStepperProps {
  phases: Phase[];
  activeGateId: string | null;
  onGateClick: (gateId: string) => void;
  onAddPhase: () => void;
  onDeletePhase: (phaseId: string) => void;
  onRenamePhase: (phaseId: string, newName: string) => void;
  onAddGate: (phaseId: string) => void;
  onRemoveGate: (phaseId: string) => void;
  onReorderPhases: (fromIndex: number, toIndex: number) => void;
}

export function PhaseStepper({ phases, activeGateId, onGateClick, onAddPhase, onDeletePhase, onRenamePhase, onAddGate, onRemoveGate, onReorderPhases }: PhaseStepperProps) {
  const [contextMenu, setContextMenu] = useState<{ phaseId: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [contextMenu]);

  const handleRenameSubmit = (phaseId: string, originalName: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== originalName) onRenamePhase(phaseId, trimmed);
    setRenamingId(null);
  };

  return (
    <div className="flex items-center gap-0 px-6 py-3 border-b border-grey-080 bg-white overflow-x-auto shrink-0">
      {phases.map((phase, i) => {
        const isCompleted = phase.status === 'completed';
        const isActive = phase.status === 'active';
        const gateActive = phase.gate?.id === activeGateId;

        return (
          <div
            key={phase.id}
            className="flex items-center shrink-0"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(i));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = Number(e.dataTransfer.getData('text/plain'));
              if (fromIndex !== i) onReorderPhases(fromIndex, i);
            }}
          >
            <button
              onClick={() => phase.gate && onGateClick(phase.gate.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ phaseId: phase.id, x: e.clientX, y: e.clientY });
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                ${gateActive ? 'bg-primary-100' : 'hover:bg-grey-050'}
              `}
            >
              {phase.gate && (
                <Shield size={14} className={`shrink-0 ${
                  isCompleted ? 'text-emerald-500' : isActive ? 'text-primary-500' : 'text-grey-300'
                }`} />
              )}
              {renamingId === phase.id ? (
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(phase.id, phase.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(phase.id, phase.name);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-grey-700 bg-white border border-primary-500 rounded px-1.5 py-0.5 outline-none w-28"
                />
              ) : (
                <span className={`text-xs font-medium whitespace-nowrap ${
                  isCompleted ? 'text-emerald-700' : isActive ? 'text-grey-700' : 'text-grey-300'
                }`}>
                  {phase.name}
                </span>
              )}
              {phase.gate && phase.gate.status === 'active' && (
                <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {phase.gate.criteria.filter((c: import('../types').GateCriterion) => c.completed).length}/{phase.gate.criteria.length}
                </span>
              )}
            </button>

            {i < phases.length - 1 && (
              <div className={`w-8 h-[2px] mx-1 rounded-full transition-colors ${
                isCompleted ? 'bg-emerald-300' : 'bg-grey-200'
              }`} />
            )}
          </div>
        );
      })}

      {/* Add phase button */}
      <div className="flex items-center shrink-0 ml-1">
        <button
          onClick={onAddPhase}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-grey-300 hover:text-primary-500 hover:bg-primary-100 border border-dashed border-grey-200 hover:border-primary-500/30 transition-all"
        >
          <Plus size={14} />
          Add phase
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (() => {
        const phase = phases.find(p => p.id === contextMenu.phaseId);
        if (!phase) return null;
        return (
          <div
            ref={menuRef}
            className="fixed z-50 w-48 bg-white border border-grey-080 rounded-xl shadow-lg py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                setRenameValue(phase.name);
                setRenamingId(phase.id);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-grey-700 hover:bg-grey-050 transition-colors"
            >
              <Edit3 size={14} className="text-grey-500" /> Rename phase
            </button>
            {!phase.gate ? (
              <button
                onClick={() => { onAddGate(phase.id); setContextMenu(null); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-grey-700 hover:bg-grey-050 transition-colors"
              >
                <Shield size={14} className="text-primary-500" /> Add toll gate
              </button>
            ) : (
              <button
                onClick={() => { onRemoveGate(phase.id); setContextMenu(null); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Shield size={14} className="text-red-400" /> Remove toll gate
              </button>
            )}
            <div className="border-t border-grey-080 my-1" />
            <button
              onClick={() => { onDeletePhase(phase.id); setContextMenu(null); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} className="text-red-400" /> Delete phase
            </button>
          </div>
        );
      })()}
    </div>
  );
}
