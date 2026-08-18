/**
 * StatCard — Professional dashboard stat card
 * Matches the reference dashboard card style:
 * icon on the left, title + count on the right,
 * with a colored left-border accent.
 */
const ACCENT_COLORS = ['#00D6CC', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, icon: Icon, hint, colorIndex = 0 }) => {
  const accent = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length];

  return (
    <div
      className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-slate-100 relative overflow-hidden"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      {/* Icon bubble */}
      {Icon && (
        <div
          className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon size={24} style={{ color: accent }} />
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-wider truncate"
          style={{ color: '#94a3b8', fontFamily: 'Poppins, sans-serif' }}
        >
          {title}
        </p>
        <p
          className="mt-1 text-2xl font-bold truncate"
          style={{ color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}
        >
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 text-xs text-slate-400 font-medium">{hint}</p>
        )}
      </div>

      {/* Decorative background circle */}
      <div
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.06]"
        style={{ backgroundColor: accent }}
      />
    </div>
  );
};

export default StatCard;
