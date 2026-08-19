import React from 'react';

/**
 * StatCard — Matches the exact layout, structure, and CSS classes
 * of the reference shipment dashboard KPI cards.
 */
const StatCard = ({ title, value, icon: Icon, colorClass = 'card-purple', faIcon }) => {
  return (
    <div className={`card ${colorClass}`}>
      <div className="card-body">
        <div className="dash-widget-header">
          <span className="dash-widget-icon bg-1">
            {faIcon ? (
              <i className={faIcon}></i>
            ) : Icon ? (
              <Icon size={20} />
            ) : (
              <i className="fa-solid fa-clipboard-list"></i>
            )}
          </span>
          <div className="dash-count">
            <div className="dash-title">{title}</div>
            <div className="dash-counts">
              <p>{value}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
