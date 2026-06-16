/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import {
  Search,
  Plus,
  DollarSign,
  Coins,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle,
  X,
  CreditCard,
  Building,
  ArrowDownToLine,
} from 'lucide-react';

export const PaymentView: React.FC = () => {
  const {
    payments,
    loans,
    currentRole,
    currentUser,
    recordPayment,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [showRecordForm, setShowRecordForm] = useState(false);

  // Form states
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Enforce branch boundaries
  const throttleBranch = currentRole !== 'HQ_ADMIN';
  const activeUserBranchId = currentUser?.branchId || (currentRole === 'BRANCH_MANAGER' ? 'BR-002' : 'BR-001');

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    // 1. Branch isolation scoping rules
    if (throttleBranch && p.branchId !== activeUserBranchId) {
      return false;
    }

    const matchesSearch = p.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          p.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());
                          
    const matchesBranch = branchFilter === 'ALL' || p.branchId === branchFilter;

    return matchesSearch && (throttleBranch ? true : matchesBranch);
  });

  // Filter loans that can be repaid (ACTIVE or DEFAULTED)
  const eligibleLoans = loans.filter((l) => {
    if (l.status === 'COMPLETED') return false;
    if (throttleBranch) return l.branchId === activeUserBranchId;
    return true;
  });

  const selectedLoanForPay = loans.find(l => l.id === selectedLoanId);

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) {
      showToast('Error: A targeted active loan is required for payment booking.', 'error');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Error: payment amount must be greater than $0.', 'error');
      return;
    }

    if (selectedLoanForPay && amt > selectedLoanForPay.outstandingBalance) {
      if (!window.confirm(`Warning: Payment amount ($${amt}) is greater than outstanding balance ($${selectedLoanForPay.outstandingBalance}). The excess of $${amt - selectedLoanForPay.outstandingBalance} will be refunded on cash counters. Proceed with settlement?`)) {
        return;
      }
    }

    recordPayment(selectedLoanId, amt, paymentDate, notes);

    // reset forms
    setSelectedLoanId('');
    setAmount('');
    setNotes('');
    setShowRecordForm(false);
  };

  // Generate unique list of branches from payments for filtering
  const uniqueBranches = Array.from(new Set(payments.map(p => JSON.stringify({ id: p.branchId, name: p.branchName }))),
    item => JSON.parse(item) as { id: string, name: string }
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="text-brand-primary w-5 h-5 shrink-0" />
            <span>Counter Repayments ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {throttleBranch
              ? `Process incoming installments deposits, audit teller cash-payout clear receipts, and verify local payment bounds for ${currentUser?.branchName || 'your branch'}.`
              : 'HQ aggregated cash deposits and clear receipts auditing across all physical microfinance nodes.'}
          </p>
        </div>

        <button
          onClick={() => setShowRecordForm(true)}
          className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Record Counter Receipt</span>
        </button>
      </div>

      {/* SEARCH / FILTER SECTION */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search payments by Receipt ID, Loan Number, client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50"
          />
        </div>

        {/* HQ branch filter */}
        {!throttleBranch && (
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="border border-slate-200/80 text-slate-700 bg-white font-semibold rounded-lg text-xs px-3 py-2 focus:ring-1 focus:ring-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Branch Hubs</option>
            {uniqueBranches.map(ub => (
              <option key={ub.id} value={ub.id}>{ub.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* PAYMENTS LEDGER LIST TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            Counter Receipts Log Ledger
          </h3>
          <span className="text-[9px] bg-slate-250 border border-slate-300/40 text-slate-700 font-extrabold uppercase px-2.5 py-1 rounded-md font-mono tracking-wider">
            {filteredPayments.length} receipts audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">Receipt / Payment ID</th>
                <th className="px-4 py-3">Credit Client</th>
                <th className="px-4 py-3">Loan Target Link</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Date Authenticated</th>
                <th className="px-4 py-3">Operator Notes</th>
                <th className="px-4 py-3 text-right">Status Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{p.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{p.clientName}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold font-mono">{p.branchName}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-500">
                    {p.loanNumber}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/40 rounded px-1.5 py-0.5">
                      +${p.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold font-sans">{p.date}</td>
                  <td className="px-4 py-3.5 text-slate-400 max-w-[180px] font-semibold truncate" title={p.notes}>
                    {p.notes || 'Counter cash payment'}
                  </td>
                  <td className="px-4 py-3.5 text-right w-fit">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-emerald-200/60 bg-emerald-50 text-emerald-800">
                      <FileCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Ledger Verified</span>
                    </span>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-semibold leading-relaxed">
                    No counter clear transactions cataloged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD REPAYMENT FORM DIALOG MODAL */}
      {showRecordForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-800">Record Installements Receipt</h3>
              </div>
              <button
                onClick={() => setShowRecordForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Active Sacco Loan Portfolio</label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-semibold cursor-pointer"
                >
                  <option value="">Select loan reference & outstanding...</option>
                  {eligibleLoans.map(el => (
                    <option key={el.id} value={el.id}>
                      {el.loanNumber} &mdash; {el.clientName} (Bal: ${el.outstandingBalance.toLocaleString()} | {el.branchName})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">Only ACTIVE or RISK-DEFAULTED portfolios require cash intake processing.</p>
              </div>

              {selectedLoanForPay && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded font-medium text-xs text-amber-900 space-y-1">
                  <span className="font-bold block text-amber-950 uppercase text-[10px]">Outstanding Audit</span>
                  <div className="flex justify-between">
                    <span>Outstanding Payout Due:</span>
                    <strong className="font-mono text-sm">${selectedLoanForPay.outstandingBalance.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Borrower Customer:</span>
                    <strong className="text-slate-800">{selectedLoanForPay.clientName}</strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-700 block">Repayment Cash Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1500"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-bold text-slate-700 block">Accepted Receipt Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Teller Transaction Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Cash envelope deposit, counter clear draft, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded text-[11px] leading-relaxed text-slate-500 font-semibold">
                <p>
                  Confirm cash count authenticity before pushing records to database vaults. Payments reduce outstanding credit balances in real-time.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowRecordForm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded font-bold transition-colors cursor-pointer"
                >
                  Confirm Cash Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
