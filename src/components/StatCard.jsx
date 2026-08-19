import React from 'react';

/**
 * StatCard — Premium KPI card matching professional reference design.
 * Supports Lucide icons (icon prop) or Font Awesome (faIcon prop).
 * colorVariant controls the accent color theme.
 */
const VARIANTS = {
  purple: {
    border: '#6366f1',
    iconBg: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    iconColor: '#6366f1',
    glow: 'rgba(99,102,241,0.12)',
  },
  blue: {
    border: '#3b82f6',
    iconBg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    iconColor: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
  },
  teal: {
    border: '#00D6CC',
    iconBg: 'linear-gradient(135deg, #f0fdfc 0%, #ccfbf1 100%)',
    iconColor: '#00D6CC',
    glow: 'rgba(0,214,204,0.12)',
  },
  green: {
    border: '#10b981',
    iconBg: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    iconColor: '#10b981',
    glow: 'rgba(16,185,129,0.12)',
  },
  pink: {
    border: '#ec4899',
    iconBg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    iconColor: '#ec4899',
    glow: 'rgba(236,72,153,0.12)',
  },
  rose: {
    border: '#ef4444',
    iconBg: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
    iconColor: '#ef4444',
    glow: 'rgba(239,68,68,0.12)',
  },
  amber: {
    border: '#f59e0b',
    iconBg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    iconColor: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
  },
};

// Map old colorClass strings → new variant keys
const LEGACY_MAP = {
  'card-purple': 'purple',
  'card-blue':   'blue',
  'card-pink':   'pink',
  'card-green':  'green',
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  faIcon,
  colorClass,       // legacy support
  colorVariant,     // preferred: 'purple'|'blue'|'teal'|'green'|'pink'|'rose'|'amber'
}) => {
  const variantKey = colorVariant || LEGACY_MAP[colorClass] || 'teal';
  const v = VARIANTS[variantKey] || VARIANTS.teal;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${v.border}`,
        padding: '20px',
        boxShadow: `0 2px 12px ${v.glow}, 0 1px 3px rgba(0,0,0,0.06)`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Icon Box */}
      <div
        style={{
          flexShrink: 0,
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: v.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {faIcon ? (
          <i className={faIcon} style={{ fontSize: '22px', color: v.iconColor }} />
        ) : Icon ? (
          <Icon size={24} color={v.iconColor} />
        ) : (
          <i className="fa-solid fa-chart-bar" style={{ fontSize: '22px', color: v.iconColor }} />
        )}
      </div>

      {/* Text */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}>
          {title}
        </p>
        <p style={{
          margin: '4px 0 2px',
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.1,
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            margin: 0,
            fontSize: '0.72rem',
            color: '#64748b',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
