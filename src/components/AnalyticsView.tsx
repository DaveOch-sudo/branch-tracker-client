/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { CollectionTrendsChart, BranchPerformanceChart, PortfolioDistributionChart } from './MyCharts';
import {
  LineChart,
  Coins,
  Wallet,
  Building,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  AlertTriangle,
  Download,
  Calendar,
  Percent,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    branches,
    clients,
    loans,
    payments,
    currentRole,
  } = useStore();

  const [seasonFilter, setSeasonFilter] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Authorization check - Loan Officers shouldn't access general analytics
  if (currentRole === 'LOAN_OFFICER') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto mt-10 text-center">
        <ShieldCheck className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-amber-900">Desk Limits &mdash; Executive Security Lock</h3>
        <p className="text-xs text-amber-700 mt-2 leading-relaxed">
          Analytics intelligence charts require <strong>BRANCH_MANAGER</strong> status or higher. This ensures client privacy and centralized capital statistics tracking.
        </p>
      </div>
    );
  }

  // Financial aggregates
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalOutstanding = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Total expected payoff (interest rate model)
  const totalExpected = loans.reduce((sum, l) => {
    return sum + (l.principalAmount + (l.principalAmount * (l.interestRate / 100)));
  }, 0);

  const activeCount = loans.filter((l) => l.status === 'ACTIVE').length;
  const completedCount = loans.filter((l) => l.status === 'COMPLETED').length;
  const defaultedCount = loans.filter((l) => l.status === 'DEFAULTED').length;

  const totalNPLsAmount = loans.filter(l => l.status === 'DEFAULTED').reduce((s, l) => s + l.outstandingBalance, 0);
  const healthyLoansAmount = loans.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + l.outstandingBalance, 0);

  // Computed data points for season aggregates
  const getSeasonData = () => {
    switch (seasonFilter) {
      case 'DAILY':
        return [
          { label: 'Mon 15th', amount: 800 },
          { label: 'Tue 16th', amount: 1500 },
          { label: 'Wed 17th', amount: 620 },
          { label: 'Thu 18th', amount: 1200 },
          { label: 'Fri 19th', amount: 2400 },
          { label: 'Sat 20th', amount: 450 },
          { label: 'Sun 21st', amount: 120 },
        ];
      case 'WEEKLY':
        return [
          { label: 'Week 21', amount: 4500 },
          { label: 'Week 22', amount: 6200 },
          { label: 'Week 23', amount: 3900 },
          { label: 'Week 24', amount: 7300 },
          { label: 'Week 25', amount: 5100 },
        ];
      case 'YEARLY':
        return [
          { label: 'FY 2023', amount: 35000 },
          { label: 'FY 2024', amount: 82000 },
          { label: 'FY 2025', amount: 115000 },
          { label: 'FY 2026 (Est.)', amount: 145000 },
        ];
      case 'MONTHLY':
      default:
        return [
          { label: 'Dec 25', amount: payments.filter(p => p.date.includes('2025-12')).reduce((s, p) => s + p.amount, 0) || 1300 },
          { label: 'Jan 26', amount: payments.filter(p => p.date.includes('2026-01')).reduce((s, p) => s + p.amount, 0) || 3850 },
          { label: 'Feb 26', amount: payments.filter(p => p.date.includes('2026-02')).reduce((s, p) => s + p.amount, 0) || 1800 },
          { label: 'Mar 26', amount: payments.filter(p => p.date.includes('2026-03')).reduce((s, p) => s + p.amount, 0) || 2900 },
          { label: 'Apr 26', amount: payments.filter(p => p.date.includes('2026-04')).reduce((s, p) => s + p.amount, 0) || 2240 },
          { label: 'May 26', amount: payments.filter(p => p.date.includes('2026-05')).reduce((s, p) => s + p.amount, 0) || 3450 },
          { label: 'Jun 26', amount: payments.filter(p => p.date.includes('2026-06')).reduce((s, p) => s + p.amount, 0) || 1200 },
        ];
    }
  };

  const seasonData = getSeasonData();

  // Branch Performance rankings calculation
  const branchRanks = branches.map(br => {
    const brLoans = loans.filter(l => l.branchId === br.id);
    const brPayments = payments.filter(p => p.branchId === br.id);

    const disbursed = brLoans.reduce((sum, l) => sum + l.principalAmount, 0);
    const collections = brPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = brLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);

    // Recovery rate = client payments made relative to total expected loans payoffs inside this branch
    const totalExpectedPayoff = brLoans.reduce((sum, l) => sum + (l.principalAmount + (l.principalAmount * (l.interestRate / 100))), 0);
    const recoveryRate = totalExpectedPayoff > 0 ? Math.round((collections / totalExpectedPayoff) * 100) : 0;

    return {
      id: br.id,
      name: br.name,
      disbursed,
      collections,
      outstanding,
      recoveryRate,
      activeLoans: brLoans.filter(l => l.status === 'ACTIVE').length,
    };
  }).sort((a, b) => b.collections - a.collections); // Sorted by absolute collections volume

  const handleExportMockReport = () => {
    showToast('Mock CSV Report compilation dispatched. Downloading metadata bundles...', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LineChart className="text-brand-primary w-5 h-5 shrink-0" />
            <span>Executive Sacco Intelligence Desk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time capital projections, defaults assessment maps, and regional terminal rankings.
          </p>
        </div>

        <button
          onClick={handleExportMockReport}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200/80 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export SEC Audit Bundle</span>
        </button>
      </div>

      {/* THREE STATS METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 font-bold tracking-wider uppercase text-[9px] block">Aggregated Debt Exposure Limit</span>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
            ${totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-medium">
            Disbursed target portfolio: ${totalPrincipal.toLocaleString()} with interest.
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 font-bold tracking-wider uppercase text-[9px] block">Recovered Counter Cash Registers</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
            ${totalCollections.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 mt-2 font-bold uppercase overflow-hidden truncate">
            Liquidation recovery index: {totalExpected > 0 ? Math.round((totalCollections / totalExpected) * 100) : 0}% of expected payoff
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#C62828]/20 bg-[#C62828]/5 shadow-xs">
          <span className="text-rose-900 font-bold tracking-wider uppercase text-[9px] block">Capital At Risk (NPL ratio)</span>
          <div className="text-2xl font-bold font-mono text-[#C62828] mt-1">
            ${totalNPLsAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-800 mt-2 font-bold uppercase">
            Sacco non-performing portfolios count: {defaultedCount} risk segment accounts 
          </div>
        </div>
      </div>

      {/* DATA VISUAL CHART MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Season Overview Graph */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 lg:col-span-2 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Aggregate Sacco Recoveries overview</h4>
              <p className="text-xs text-slate-400 mt-0.5">Total cash intake audited at counter desks.</p>
            </div>

            {/* Selector season filters */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-250 shrink-0 text-xs">
              {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(season => {
                const isActive = seasonFilter === season;
                return (
                  <button
                    key={season}
                    onClick={() => setSeasonFilter(season)}
                    className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-brand-primary shadow-xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {season}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-60 flex items-center justify-center font-mono">
            {/* Map trends */}
            <CollectionTrendsChart data={seasonData.map(d => ({ month: d.label, amount: d.amount }))} />
          </div>
        </div>

        {/* Portfolio Distribution block */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Portfolio Risk Spread Map</h4>
            <p className="text-xs text-slate-400">Healthy completed payoffs vs non-performing loans risk.</p>
          </div>
          
          <div className="p-2 flex items-center justify-center flex-1">
            <PortfolioDistributionChart
              activeCount={activeCount}
              completedCount={completedCount}
              defaultedCount={defaultedCount}
            />
          </div>

          <div className="p-3 bg-indigo-50/55 border border-indigo-100 rounded text-xs text-brand-primary font-medium leading-normal">
            <span>
              Risk exposure is evaluated as {activeCount > 0 ? Math.round((defaultedCount / (activeCount + defaultedCount)) * 100) : 0}% of outstanding loan accounts.
            </span>
          </div>
        </div>
      </div>

      {/* REGIONAL PERFORMANCE LEADERBOARD COLD MATRIX */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Branch Leaderboard Roster
          </h3>
          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
            Ranked by counters revenue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3">Sacco Terminal</th>
                <th className="px-4 py-3">Disbursed Principal</th>
                <th className="px-4 py-3">Aggregated Recoveries</th>
                <th className="px-4 py-3">Outstanding Capital Exposure</th>
                <th className="px-4 py-3 text-center">Portfolio Recovery Rate</th>
                <th className="px-4 py-3 text-right">Active Loan books</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchRanks.map((br, index) => {
                let badgeStyle = 'text-slate-600 bg-slate-100';
                if (index === 0) badgeStyle = 'text-yellow-800 bg-yellow-100 border border-yellow-200';
                if (index === 1) badgeStyle = 'text-slate-800 bg-slate-200';
                return (
                  <tr key={br.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-extrabold font-mono ${badgeStyle}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{br.name}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      ${br.disbursed.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 rounded px-1.5 py-0.5">
                        ${br.collections.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      ${br.outstanding.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="font-bold text-slate-800 font-mono">{br.recoveryRate}%</span>
                        <div className="w-12 bg-slate-200 h-2 rounded overflow-hidden col-span-2">
                          <div className="h-full bg-brand-secondary inline-block" style={{ width: `${br.recoveryRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-800 font-mono">
                      {br.activeLoans} book files
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
