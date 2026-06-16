/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

// Collection Trends Chart Props
interface CollectionTrendsProps {
  data: { month: string; amount: number }[];
}

export const CollectionTrendsChart: React.FC<CollectionTrendsProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return <div className="p-8 text-center text-slate-400">No data points available</div>;

  const maxAmount = Math.max(...data.map(d => d.amount), 1000);
  const chartHeight = 200;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Compute SVG Coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.amount / maxAmount) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Create path description for line
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, '');

  // Area path (closed polygon)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
          const val = Math.round(ratio * maxAmount);
          return (
            <g key={i} className="opacity-20">
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 font-mono"
                style={{ fontSize: '9px' }}
              >
                ${(val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val)}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path
          d={areaPath}
          fill="url(#trendGrad)"
          className="opacity-20"
        />

        {/* Main Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#283593"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Notes & Interactivity Nodes */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? '6' : '4'}
              fill={hoveredIdx === i ? '#C8A44D' : '#00897B'}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {/* Label along X-Axis */}
            <text
              x={p.x}
              y={chartHeight - 4}
              textAnchor="middle"
              className="fill-slate-500 font-medium font-sans"
              style={{ fontSize: '10px' }}
            >
              {p.month}
            </text>
          </g>
        ))}

        {/* Definitions */}
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#283593" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      {/* HTML absolute position feedback overlay (Tooltips) */}
      <div className="absolute top-1 right-2 bg-slate-800 text-white rounded px-2.5 py-1 text-xs font-mono shadow-md min-h-[22px] transition-opacity duration-200">
        {hoveredIdx !== null ? (
          <span>
            {data[hoveredIdx].month}: <strong className="text-amber-400">${data[hoveredIdx].amount.toLocaleString()}</strong>
          </span>
        ) : (
          <span className="text-slate-400">Hover nodes to audit balances</span>
        )}
      </div>
    </div>
  );
};


// Branch Performance Chart Props
interface BranchPerformanceProps {
  data: { branchName: string; collections: number; outstanding: number }[];
}

export const BranchPerformanceChart: React.FC<BranchPerformanceProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'outstanding'>('collections');

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No operational branches enrolled yet.
      </div>
    );
  }

  const values = data.map((d) => (activeTab === 'collections' ? d.collections : d.outstanding));
  const maxVal = Math.max(...values, 1000);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toggle */}
      <div className="flex justify-end gap-1 text-xs">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === 'collections'
              ? 'bg-brand-primary text-white font-medium'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Collections ($)
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`px-3 py-1 rounded transition-colors ${
            activeTab === 'outstanding'
              ? 'bg-brand-primary text-white font-medium'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Outstanding Pool ($)
        </button>
      </div>

      {/* Grid Bar Layout */}
      <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
        {data.map((d, i) => {
          const currentAmount = activeTab === 'collections' ? d.collections : d.outstanding;
          const pct = Math.min(100, Math.max(8, (currentAmount / maxVal) * 100));
          return (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              {/* Branch name label */}
              <div className="w-full sm:w-36 text-xs font-semibold text-slate-700 truncate">
                {d.branchName}
              </div>

              {/* Bar visualization */}
              <div className="flex-1 bg-slate-200 h-6 rounded-md overflow-hidden relative">
                <div
                  className={`h-full opacity-90 transition-all duration-500 ease-out flex items-center justify-end px-3 ${
                    activeTab === 'collections' ? 'bg-brand-secondary' : 'bg-brand-primary'
                  }`}
                  style={{ width: `${pct}%` }}
                >
                  <span className="text-white text-[10px] uppercase tracking-wider font-mono font-bold">
                    {pct > 15 ? `$${currentAmount.toLocaleString()}` : ''}
                  </span>
                </div>
              </div>

              {/* Fallback micro label for narrow percentage bars */}
              {pct <= 15 && (
                <div className="text-[11px] font-mono font-bold text-slate-800 self-start sm:self-auto shrink-0 sm:w-20 sm:text-right">
                  ${currentAmount.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// Portfolio Status Distribution Chart
interface PortfolioDistributionProps {
  activeCount: number;
  completedCount: number;
  defaultedCount: number;
}

export const PortfolioDistributionChart: React.FC<PortfolioDistributionProps> = ({
  activeCount,
  completedCount,
  defaultedCount,
}) => {
  const total = activeCount + completedCount + defaultedCount;
  
  if (total === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No registered loan portfolios.
      </div>
    );
  }

  // Percentages
  const activePct = Math.round((activeCount / total) * 100);
  const completedPct = Math.round((completedCount / total) * 100);
  const defaultedPct = Math.round((defaultedCount / total) * 100);

  // Simple SVG Donut configuration
  const radius = 50;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;

  // Stroke offsets
  const activeOffset = circ - (activeCount / total) * circ;
  const completedOffset = circ - (completedCount / total) * circ;
  const defaultedOffset = circ - (defaultedCount / total) * circ;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center py-2">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-95">
          {/* Base Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          
          {/* Defaulted Section (Red) */}
          {defaultedCount > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#C62828"
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={defaultedOffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {/* Active Section (Blue) */}
          {activeCount > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#1565C0"
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={activeOffset}
              strokeLinecap="round"
              className="transition-all duration-300 transform rotate-12"
            />
          )}

          {/* Completed Section (Green) */}
          {completedCount > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#2E7D32"
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={completedOffset}
              strokeLinecap="round"
              className="transition-all duration-300 transform rotate-[80deg]"
            />
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono text-slate-800">{total}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Projects
          </span>
        </div>
      </div>

      {/* Legend & percentage breakdowns */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-info inline-block" />
            <span className="font-medium text-slate-700">Active Portfolios</span>
          </div>
          <span className="font-mono font-bold text-slate-800">
            {activeCount} ({activePct}%)
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-success inline-block" />
            <span className="font-medium text-slate-700">Fully Settled</span>
          </div>
          <span className="font-mono font-bold text-slate-800">
            {completedCount} ({completedPct}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-status-error inline-block" />
            <span className="font-medium text-slate-700">Default Risk (NPLs)</span>
          </div>
          <span className="font-mono font-bold text-slate-800 text-rose-700">
            {defaultedCount} ({defaultedPct}%)
          </span>
        </div>
      </div>
    </div>
  );
};
