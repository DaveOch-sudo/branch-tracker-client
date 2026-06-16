/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Loan } from '../types';
import {
  Search,
  Plus,
  Wallet,
  Coins,
  ShieldCheck,
  Calendar,
  Layers,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  User,
  GitBranch,
  Percent,
  X,
  PlusCircle,
  Info,
} from 'lucide-react';

export const LoanView: React.FC = () => {
  const {
    loans,
    clients,
    branches,
    payments,
    currentRole,
    currentUser,
    addLoan,
    recordPayment,
    updateLoanStatus,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED'>('ALL');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0]);

  // Payment Quick form inside details drawer
  const [repayAmount, setRepayAmount] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().split('T')[0]);
  const [showRepayForm, setShowRepayForm] = useState(false);

  // Enforce branch boundaries
  const throttleBranch = currentRole !== 'HQ_ADMIN';
  const activeUserBranchId = currentUser?.branchId || (currentRole === 'BRANCH_MANAGER' ? 'BR-002' : 'BR-001');

  // Filter loans
  const filteredLoans = loans.filter((l) => {
    // Branch isolation scoping
    if (throttleBranch && l.branchId !== activeUserBranchId) {
      return false;
    }

    const matchesSearch = l.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          l.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
                          l.branchName.toLowerCase().includes(search.toLowerCase()) ||
                          l.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate detailed repayment logs for a loan
  const getLoanLedger = (loan: Loan) => {
    const loanPayments = payments.filter((p) => p.loanId === loan.id);
    const totalPrincipalWithInterest = loan.principalAmount + (loan.principalAmount * (loan.interestRate / 100));
    const totalRepaidAmount = loanPayments.reduce((sum, p) => sum + p.amount, 0);
    const pctRepaid = totalPrincipalWithInterest > 0 ? Math.min(100, Math.round((totalRepaidAmount / totalPrincipalWithInterest) * 100)) : 100;

    return {
      paymentsList: loanPayments,
      totalExpected: totalPrincipalWithInterest,
      totalRepaid: totalRepaidAmount,
      pctRepaid,
    };
  };

  const selectedLoan = loans.find((l) => l.id === selectedLoanId);
  const selectedLedger = selectedLoan ? getLoanLedger(selectedLoan) : null;
  const clientOfLoan = selectedLoan ? clients.find((c) => c.id === selectedLoan.clientId) : null;

  // Filter clients eligible for loans depending on branch permissions
  const eligibleClients = clients.filter((c) => {
    if (c.status === 'INACTIVE') return false;
    if (throttleBranch) return c.branchId === activeUserBranchId;
    return true;
  });

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      showToast('Error: A registered active borrower is required.', 'error');
      return;
    }

    const principal = parseFloat(principalAmount);
    const interest = parseFloat(interestRate);
    const term = parseInt(termMonths);

    if (isNaN(principal) || principal <= 0) {
      showToast('Error: Principal amount must be greater than zero.', 'error');
      return;
    }
    if (isNaN(interest) || interest < 0) {
      showToast('Error: Interest rate cannot be negative.', 'error');
      return;
    }
    if (isNaN(term) || term <= 0) {
      showToast('Error: Repayment term term months must be positive.', 'error');
      return;
    }

    addLoan(selectedClientId, principal, interest, term, dateIssued);

    // reset forms
    setSelectedClientId('');
    setPrincipalAmount('');
    setInterestRate('');
    setTermMonths('');
    setShowCreateForm(false);
  };

  const handleRecordDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const amt = parseFloat(repayAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('repayment sum must be positive.', 'error');
      return;
    }

    recordPayment(selectedLoan.id, amt, repayDate, 'Counter Cash Credit Entry');
    setRepayAmount('');
    setShowRepayForm(false);
  };

  const handleUpdateStatusOverride = (status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED') => {
    if (!selectedLoanId) return;
    if (window.confirm(`Perform security override on loan status? Changing to ${status}.`)) {
      updateLoanStatus(selectedLoanId, status);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-brand-primary w-5 h-5 shrink-0" />
            <span>Master Sacco Loan Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {throttleBranch
              ? `Review regional lending portfolios, disburse and appraise loans, and record customer payments for ${currentUser?.branchName || 'your branch'}.`
              : 'Global institutional Sacco loan register across all nationwide local hubs.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Disburse / Appraise Loan</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search portfolios by Loan reference, Branch, or Client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Loans
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Active Portfolios
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-green-700 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Settle Complete
          </button>
          <button
            onClick={() => setStatusFilter('DEFAULTED')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'DEFAULTED'
                ? 'bg-red-700 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Default Risk
          </button>
        </div>
      </div>

      {/* SCREEN GRID CORE split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan List Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden lg:col-span-2 flex flex-col justify-between shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Loan Portfolios Database List
            </h3>
            <span className="text-[9px] font-mono tracking-wider bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-extrabold uppercase">
              {filteredLoans.length} entries audited
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Loan Reference</th>
                  <th className="px-4 py-3">Client details</th>
                  <th className="px-4 py-3">Principal Amount</th>
                  <th className="px-4 py-3">Outstanding Pool</th>
                  <th className="px-4 py-3 text-center">Status Badge</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((l) => (
                  <tr
                    key={l.id}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedLoanId === l.id ? 'bg-indigo-50/40' : ''
                    }`}
                    onClick={() => setSelectedLoanId(l.id)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{l.loanNumber}</span>
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">{l.branchName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800">{l.clientName}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      ${l.principalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${l.outstandingBalance > 0 ? 'text-amber-800 bg-amber-50 border border-amber-200/40' : 'text-slate-500 bg-slate-50'}`}>
                        ${l.outstandingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          l.status === 'ACTIVE'
                            ? 'bg-blue-50 text-blue-800 border-blue-200/40'
                            : l.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/40'
                            : 'bg-rose-50 text-rose-800 border-rose-200/40'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLoanId(l.id)}
                        className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
                      >
                        Audit Details
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredLoans.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-semibold leading-relaxed">
                      No loan accounts match criteria limits.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED AUDITING WIDGET DRAWER */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between">
          {selectedLoan && selectedLedger ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                    Credit Audit Review
                  </h4>
                  <p className="text-sm font-bold text-slate-900 mt-1">{selectedLoan.loanNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedLoanId(null)}
                  className="p-1 hover:bg-slate-200 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Drawer stats body */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-6">
                {/* Visual Status Badges timeline */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Exposure Profile:</span>
                  <span
                    className={`px-3 py-1 rounded text-xs text-white font-bold uppercase ${
                      selectedLoan.status === 'ACTIVE'
                        ? 'bg-status-info'
                        : selectedLoan.status === 'COMPLETED'
                        ? 'bg-status-success'
                        : 'bg-status-error'
                    }`}
                  >
                    {selectedLoan.status}
                  </span>
                </div>

                {/* Primary financial metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-[10px] text-slate-400 font-bold block">DISBURSED DATE</span>
                    <p className="text-sm font-semibold font-mono text-slate-800 mt-1">{selectedLoan.dateIssued}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-[10px] text-slate-400 font-bold block">LOAN PERIOD</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{selectedLoan.termMonths} Months</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-[10px] text-slate-400 font-bold block">INTEREST RATE</span>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{selectedLoan.interestRate}% Flat</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-[10px] text-slate-400 font-bold block">BORROWER</span>
                    <p className="text-sm font-bold text-brand-secondary mt-1">{selectedLoan.clientName}</p>
                  </div>
                </div>

                {/* LIQUIDATION / REPAYMENT RATIO PROGRESS BAR */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Liquidation Progress Indicator
                  </h4>
                  <div className="bg-slate-100 h-4 rounded-full overflow-hidden relative border border-slate-200 shadow-inner">
                    <div
                      className="h-full bg-brand-secondary opacity-90 transition-all duration-500 ease-out"
                      style={{ width: `${selectedLedger.pctRepaid}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] text-slate-800 font-bold font-mono">
                        {selectedLedger.pctRepaid}% Liquidation Rate
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                    <span>Paid to Date: ${selectedLedger.totalRepaid.toLocaleString()}</span>
                    <span>Expected Total: ${selectedLedger.totalExpected.toLocaleString()}</span>
                  </div>
                </div>

                {/* WORKFLOW AUDIT Timeline stepper */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    Appraisal Lifecycle Tracker
                  </h4>
                  <div className="mt-3.5 space-y-3.5 relative pl-4 border-l border-slate-200 text-xs">
                    {/* Step 1 */}
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border border-white" />
                      <div className="font-bold text-slate-800">1. Client KYC Check</div>
                      <p className="text-[11px] text-slate-400">Borrower profile registered with national identity checks.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border border-white" />
                      <div className="font-bold text-slate-800">2. Disbursal Appraisal</div>
                      <p className="text-[11px] text-slate-400">Officer appraisal and Sacco flat simple interest rate applied.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white ${
                        selectedLedger.pctRepaid > 0 ? 'bg-teal-600' : 'bg-slate-300'
                      }`} />
                      <div className="font-bold text-slate-800">3. Repayment Collection</div>
                      <p className="text-[11px] text-slate-400">Installments ledger active. Balance outstanding: ${selectedLoan.outstandingBalance.toLocaleString()}</p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-white ${
                        selectedLoan.status === 'COMPLETED' ? 'bg-teal-600' : 'bg-slate-300'
                      }`} />
                      <div className="font-bold text-slate-800">4. Liquidation Complete</div>
                      <p className="text-[11px] text-slate-400">Full settlement with outstanding balances reduced to zero.</p>
                    </div>
                  </div>
                </div>

                {/* AUDITOR OVERRIDES (HQ Admin only, but we allow BM for demonstration) */}
                {currentRole !== 'LOAN_OFFICER' && (
                  <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-xs space-y-2">
                    <span className="font-bold text-rose-800 block">Security Status Overrides</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        onClick={() => handleUpdateStatusOverride('ACTIVE')}
                        className="px-2.5 py-1 bg-white border border-blue-200 text-blue-800 hover:bg-slate-50 rounded text-[10px] font-bold"
                      >
                        Set Active
                      </button>
                      <button
                        onClick={() => handleUpdateStatusOverride('DEFAULTED')}
                        className="px-2.5 py-1 bg-white border border-red-200 text-red-800 hover:bg-slate-50 rounded text-[10px] font-bold"
                      >
                        Mark Default (Risk)
                      </button>
                      <button
                        onClick={() => handleUpdateStatusOverride('COMPLETED')}
                        className="px-2.5 py-1 bg-white border border-green-200 text-green-800 hover:bg-slate-50 rounded text-[10px] font-bold"
                      >
                        Settle Fully
                      </button>
                    </div>
                  </div>
                )}

                {/* Repayments ledger history logged against this loan number */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest pb-1.5 border-b border-slate-100">
                    Payments History Audited
                  </h4>
                  <div className="mt-2.5 text-xs space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {selectedLedger.paymentsList.map((pay) => (
                      <div key={pay.id} className="flex justify-between items-center text-xs pb-1 border-b border-slate-50 font-medium">
                        <div>
                          <p className="text-indigo-900 font-bold">+${pay.amount.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400">{pay.date}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          Receipt: {pay.id}
                        </span>
                      </div>
                    ))}
                    {selectedLedger.paymentsList.length === 0 && (
                      <p className="text-xs text-slate-400 p-2 text-center bg-slate-50 rounded leading-relaxed">
                        No deposits counter entries documented against this loan segment yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                <Wallet className="w-12 h-12 text-slate-300 mb-2.5" />
                <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                  Select Loan Portfolio
                </h4>
                <p className="text-xs mt-1 max-w-[200px] leading-relaxed mx-auto">
                  Audit risk timeline steppers, compute custom simple flat interest values, and override credit statuses.
                </p>
              </div>
            )}
          </div>
        </div>

      {/* DISBURSEMENT / APPRAISAL MODAL OVERLAY */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wallet className="w-4.5 h-4.5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-800">Appraise & Disburse Portfolio</h3>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="p-5 space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Select Registered Borrower Client</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-semibold cursor-pointer"
                >
                  <option value="">Choose and verify client details...</option>
                  {eligibleClients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (National ID: {c.nationalId} | {c.branchName})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Only ACTIVE, non-deactivated customers show in selection checks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-700 block">Principal Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 15000"
                    required
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-700 block">Interest Rate (% Flat Simple)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 12"
                    required
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-700 block">Repayment Term (Months)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 12 or 24"
                    required
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-700 block">Disbursal Entry Date</label>
                  <input
                    type="date"
                    required
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none cursor-pointer"
                  />
                </div>
              </div>

              {principalAmount && interestRate && (
                <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-xs font-semibold text-brand-primary">
                  <span className="font-bold flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    <span>Lending Calculation Model</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-bold text-indigo-900 leading-normal">
                    <span>Outstanding Settle Payout:</span>
                    <span>
                      ${(
                        parseFloat(principalAmount) +
                        (parseFloat(principalAmount) * (parseFloat(interestRate) / 100))
                      ).toLocaleString()}
                    </span>
                    <span>Simple Interest Sum:</span>
                    <span>
                      ${(parseFloat(principalAmount) * (parseFloat(interestRate) / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded font-bold transition-all cursor-pointer"
                >
                  Confirm Audited Disbursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
