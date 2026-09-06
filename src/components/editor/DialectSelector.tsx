import { QueryDialect } from '../../types';

interface DialectSelectorProps {
  dialect: QueryDialect;
  onChange: (dialect: QueryDialect) => void;
}

export const DialectSelector: React.FC<DialectSelectorProps> = ({ dialect, onChange }) => {
  const dialects: { id: QueryDialect; label: string; icon: string }[] = [
    { id: 'postgresql', label: 'PostgreSQL', icon: '🐘' },
    { id: 'mysql', label: 'MySQL', icon: '🐬' },
    { id: 'sqlite', label: 'SQLite', icon: '🪶' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-dark-900/90 border border-slate-700/60 rounded-lg p-1">
      {dialects.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
            dialect === d.id
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
          }`}
        >
          <span className="text-xs">{d.icon}</span>
          <span>{d.label}</span>
        </button>
      ))}
    </div>
  );
};
