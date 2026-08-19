import React from 'react';

/**
 * StatCard — Premium KPI card matching reference design layout and colors.
 * Automatically integrates with shipment-backend card gradient CSS classes.
 */
const CLASS_MAP = {
  purple: 'card-purple',
  blue: 'card-blue',
  pink: 'card-pink',
  green: 'card-green',
  teal: 'card-orange',
  amber: 'card-yellow',
  rose: 'card-pink',
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  faIcon,
  colorClass,       // legacy support
  colorVariant,     // preferred
}) => {
  const variantKey = colorVariant || 'teal';
  const cardColorClass = CLASS_MAP[variantKey] || 'card-blue';

  return (
    <div className={`card ${cardColorClass} h-100 mb-0 shadow-sm`} style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <div className="dash-widget-header">
          <span className="dash-widget-icon bg-1 flex items-center justify-center shrink-0">
            {faIcon ? (
              <i className={faIcon} style={{ fontSize: '1.25rem', color: '#fff' }} />
            ) : Icon ? (
              <Icon size={22} color="#fff" />
            ) : (
              <i className="fa-solid fa-chart-bar" style={{ fontSize: '1.25rem', color: '#fff' }} />
            )}
          </span>
          <div className="dash-count">
            <div className="dash-title text-slate-800 font-semibold mb-1" style={{ fontSize: '0.85rem', textTransform: 'none', letterSpacing: 'normal' }}>
              {title}
            </div>
            <div className="dash-counts">
              <p className="text-slate-950 font-bold mb-0" style={{ fontSize: '1.75rem', lineHeight: 1.1 }}>
                {value}
              </p>
            </div>
            {subtitle && (
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
