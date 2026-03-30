import type { Gate } from '../types';

interface GateConnectorProps {
  gate?: Gate;
}

export function GateConnector({ gate }: GateConnectorProps) {
  const status = gate?.status ?? 'locked';

  const colors = {
    passed: { line: 'bg-emerald-300', dot: 'bg-emerald-400 border-emerald-200' },
    active: { line: 'bg-amber-300', dot: 'bg-amber-400 border-amber-200' },
    blocked: { line: 'bg-red-300', dot: 'bg-red-400 border-red-200' },
    locked: { line: 'bg-grey-200', dot: 'bg-grey-200 border-grey-100' },
  };

  const c = colors[status];

  return (
    <div className="flex items-center self-center shrink-0 mx-1">
      <div className={`h-[2px] w-4 ${c.line} transition-colors duration-500`} />
      <div className={`w-2 h-2 rounded-full border-2 ${c.dot} transition-all duration-500`} />
      <div className={`h-[2px] w-4 ${c.line} transition-colors duration-500`} />
    </div>
  );
}
