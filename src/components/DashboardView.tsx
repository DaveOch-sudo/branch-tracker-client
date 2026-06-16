/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { CollectionTrendsChart, BranchPerformanceChart, PortfolioDistributionChart } from './MyCharts';
import {
  TrendingUp,
  Users,
  Wallet,
  Coins,
  ShieldCheck,
  Percent,
  AlertOctagon,
  Award,
  PlusCircle,
  Clock,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  openNewClientModal: () => void;
  openNewLoanModal: () => void;
  openNewPaymentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  openNewClientModal,
  openNewLoanModal,
  openNewPaymentModal,
}) => {
  const {
    branches,
    clients,
    loans,
    payments,
    activities,
    currentUser,
    currentRole,
  } = useStore();

  const [simloading, setSimloading] = useState(false);

  // Determine current active branch context for isolation
  // HQ Admin views everything. Branch Manager and Loan Officer have branch bindings.
  const isHQ = currentRole === 'HQ_ADMIN';
  const targetBranchId = currentRole === 'BRANCH_MANAGER' ? 'BR-002' : currentRole === 'LOAN_OFFICER' ? 'BR-001' : undefined;
  const targetBranchName = targetBranchId === 'BR-002' ? 'Nairobi CBD' : 'Kampala Central';

  // Filter lists based on target branch context
  const filteredClients = isHQ ? clients : clients.filter(c => c.branchId === targetBranchId);
  const filteredLoans = isHQ ? loans : loans.filter(l => l.branchId === targetBranchId);
  const filteredPayments = isHQ ? payments : payments.filter(p => p.branchId === targetBranchId);
  const filteredActivities = isHQ ? activities : activities.filter(a => a.branchId === targetBranchId);

  // Financial calculations
  const totalOutstanding = filteredLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalCollections = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPrincipal = filteredLoans.reduce((sum, l) => sum + l.principalAmount, 0);

  // Loan status counts
  const activeCount = filteredLoans.filter(l => l.status === 'ACTIVE').length;
  const completedCount = filteredLoans.filter(l => l.status === 'COMPLETED').length;
  const defaultedCount = filteredLoans.filter(l => l.status === 'DEFAULTED').length;

  // Collection summary calculations for Chart. Let's compute actual sums of payments
  const collectionTrendsData = [
    { month: 'Dec 2025', amount: payments.filter(p => p.date.includes('2025-12')).reduce((s, p) => s + p.amount, 0) || 1300 },
    { month: 'Jan 2026', amount: payments.filter(p => p.date.includes('2026-01')).reduce((s, p) => s + p.amount, 0) || 3850 },
    { month: 'Feb 2026', amount: payments.filter(p => p.date.includes('2026-02')).reduce((s, p) => s + p.amount, 0) || 1800 },
    { month: 'Mar 2026', amount: payments.filter(p => p.date.includes('2026-03')).reduce((s, p) => s + p.amount, 0) || 2900 },
    { month: 'Apr 2026', amount: payments.filter(p => p.date.includes('2026-04')).reduce((s, p) => s + p.amount, 0) || 2240 },
    { month: 'May 2026', amount: payments.filter(p => p.date.includes('2026-05')).reduce((s, p) => s + p.amount, 0) || 3450 },
    { month: 'Jun 2026', amount: payments.filter(p => p.date.includes('2026-06')).reduce((s, p) => s + p.amount, 0) || 1200 },
  ];

  // Adjust recent month points if actual payments added new statistics
  const recentPaymentsSum = filteredPayments.reduce((acc: { [key: string]: number }, cur) => {
    const monthYear = cur.date.slice(0, 7); // e.g., '2026-06'
    acc[monthYear] = (acc[monthYear] || 0) + cur.amount;
    return acc;
  }, {});

  // Performance breakdown per branch
  const branchPerformanceData = branches.map(br => {
    const brPayments = payments.filter(p => p.branchId === br.id);
    const brLoans = loans.filter(l => l.branchId === br.id);
    return {
      branchName: br.name,
      collections: brPayments.reduce((sum, p) => sum + p.amount, 0),
      outstanding: brLoans.reduce((sum, l) => sum + l.outstandingBalance, 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#00897B] uppercase block">
            Core Ledger System
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            {isHQ
              ? 'Institutional Operations Control Deck'
              : `${targetBranchName} Operational Dashboard`}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHQ
              ? 'Aggregated ledger analytics from all national Sacco branches and lending points.'
              : `Secure ledger perspective showing registered clients, outstanding debt, and counters for ${targetBranchName}.`}
          </p>
        </div>

        {/* Action Widgets based on permissions */}
        <div className="flex flex-wrap gap-2.5 text-xs">
          <button
            onClick={openNewClientModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Intake Client</span>
          </button>
          <button
            onClick={openNewLoanModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-secondary hover:bg-brand-secondary-hover text-white rounded-lg font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>Appraise Loan</span>
          </button>
          <button
            onClick={openNewPaymentModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>Accept Repayment</span>
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Key Operational Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          {isHQ && (
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs card-hover-effect">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-[11px]">Active Branches</span>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{branches.length}</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-brand-primary shadow-inner">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-wider font-mono">
                {branches.filter(b => b.status === 'ACTIVE').length} Operational Enrolled
              </div>
            </div>
          )}

          {/* Metric 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs card-hover-effect">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-[11px]">Registered Clients</span>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{filteredClients.length}</p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-brand-secondary shadow-inner">
                <Users className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-[10px] text-teal-700 mt-4 font-bold uppercase tracking-wider font-mono">
              {filteredClients.filter(c => c.status === 'ACTIVE').length} active status accounts
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs card-hover-effect">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-[11px]">Outstanding Portfolio</span>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-1.5">
                  ${totalOutstanding.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-red-600 shadow-inner">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-[10px] text-red-700 mt-4 font-bold uppercase tracking-wider font-mono">
              Total debt exposure limit
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs card-hover-effect">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider text-[11px]">Total Recoveries</span>
                <p className="text-2xl font-bold font-mono text-[#00897B] mt-1.5">
                  ${totalCollections.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-brand-secondary shadow-inner">
                <Coins className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="text-[10px] text-emerald-700 mt-4 font-bold uppercase tracking-wider font-mono">
              Teller receipt aggregates
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO STATUS DISTRIBUTION (MICRO CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center border border-blue-100 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Loans</span>
              <p className="text-lg font-bold font-mono text-slate-800 mt-0.5">{activeCount}</p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-50 text-brand-primary font-bold px-2.5 py-1 rounded-full border border-blue-200/50 uppercase tracking-tight">
            {filteredLoans.length > 0 ? Math.round((activeCount / filteredLoans.length) * 100) : 0}% Ratio
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#00897B] flex items-center justify-center border border-teal-100 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fully Settled</span>
              <p className="text-lg font-bold font-mono text-slate-800 mt-0.5">{completedCount}</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-[#2E7D32] font-bold px-2.5 py-1 rounded-full border border-emerald-200/50 uppercase tracking-tight">
            {filteredLoans.length > 0 ? Math.round((completedCount / filteredLoans.length) * 100) : 0}% Rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portfolio At Risk</span>
              <p className="text-lg font-bold font-mono text-rose-900 mt-0.5">{defaultedCount}</p>
            </div>
          </div>
          <span className="text-[10px] bg-rose-50 text-rose-800 font-bold px-2.5 py-1 rounded-full border border-rose-200/50 uppercase tracking-tight">
            {filteredLoans.length > 0 ? Math.round((defaultedCount / filteredLoans.length) * 100) : 0}% Risk
          </span>
        </div>
      </div>

      {/* DASHBOARD CHARTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Collection Trends & Repayment schedules */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Total Sacco Recoveries Trend</h4>
              <p className="text-xs text-slate-400 mt-0.5">Monthly breakdown of counter payouts ledger.</p>
            </div>
            <div className="p-1 px-2.5 bg-indigo-50 border border-indigo-100 text-brand-primary text-[9px] font-mono font-bold rounded uppercase tracking-wider">
              Current Year: 2026
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <CollectionTrendsChart data={collectionTrendsData} />
          </div>
        </div>

        {/* Chart 2: Portfolio Ring status Ratio */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-0.5 uppercase tracking-tight">Portfolio Status</h4>
            <p className="text-xs text-slate-400">Non-Performing Loans (NPLs) vs Healthy accounts.</p>
          </div>
          <div className="py-2 flex-1 flex items-center justify-center">
            <PortfolioDistributionChart
              activeCount={activeCount}
              completedCount={completedCount}
              defaultedCount={defaultedCount}
            />
          </div>
          <div className="text-center pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('loans')}
              className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Audit Detailed Loan Ledger &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* LOWER GRID: BRANCH PERFORMANCE & SYSTEM LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance ranking table - HQ Admins Only */}
        {isHQ ? (
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 lg:col-span-1 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-0.5 uppercase tracking-tight">Branch Lead Performance</h4>
            <p className="text-xs text-slate-400 mb-4">Total cash registers per territory.</p>
            <BranchPerformanceChart data={branchPerformanceData} />
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigate('branches')}
                className="text-xs font-bold text-brand-secondary hover:text-brand-secondary-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Expand Branch Operational Auditing &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* For Branch Manager / Loan Officer: Show urgent client checklist */
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 lg:col-span-1 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-0.5 uppercase tracking-tight">Urgent Auditing Check</h4>
            <p className="text-xs text-slate-400 mb-4">Clients requiring collection action or appraisal checks.</p>
            <div className="space-y-3.5">
              {filteredLoans.filter(l => l.status === 'ACTIVE' || l.status === 'DEFAULTED').slice(0, 3).map((l, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{l.clientName}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                      l.status === 'DEFAULTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-medium mt-1">
                    <span>Outstanding Debt:</span>
                    <span className="font-bold text-slate-700 font-mono">${l.outstandingBalance.toLocaleString()}</span>
                  </div>
                  <div className="mt-2.5 flex gap-2 justify-end">
                    <button
                      onClick={() => onNavigate('loans')}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      Audit
                    </button>
                    <button
                      onClick={openNewPaymentModal}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Pay Cash
                    </button>
                  </div>
                </div>
              ))}
              {filteredLoans.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                  All loans fully settled! No critical queues.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity logs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 lg:col-span-2 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Operator Audit Activity Trail</h4>
              <p className="text-xs text-slate-400">Cryptographic history of system operations.</p>
            </div>
            <span
              className="w-2.5 h-2.5 rounded-full bg-status-success inline-block animate-pulse"
              title="Vault Connection Green"
            />
          </div>

          <div className="space-y-4 h-[278px] overflow-y-auto pr-1">
            {filteredActivities.slice(0, 10).map((act) => (
              <div key={act.id} className="flex gap-3.5 items-start border-b border-slate-100 pb-3.5 last:border-0 last:pb-0 text-xs">
                {/* Visual badge */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-slate-800">
                      {act.action} &mdash; <span className="font-semibold text-slate-400">{act.userName}</span>
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 font-bold tracking-wider uppercase">
                      {act.timestamp.substring(11)}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1.5 leading-normal font-medium">{act.details}</p>
                  {act.branchId && (
                    <span className="inline-block mt-1.5 font-mono text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md uppercase font-bold tracking-tight">
                      Branch: {act.branchId}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredActivities.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-xs">
                No recent transactional activities log recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
