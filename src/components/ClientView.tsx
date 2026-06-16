/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Client, Loan } from '../types';
import {
  Search,
  Plus,
  Users,
  User,
  Phone,
  CardDetails,
  MapPin,
  ListFilter,
  ArrowRight,
  ShieldAlert,
  X,
  PlusCircle,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';

export const ClientView: React.FC = () => {
  const {
    clients,
    loans,
    payments,
    branches,
    currentRole,
    currentUser,
    addClient,
    updateClientStatus,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Enforce branch boundaries
  const throttleBranch = currentRole !== 'HQ_ADMIN';
  // Nairobi CBD is BR-002 (General Manager), Kampala Central is BR-001 (Loan Officer)
  const activeUserBranchId = currentUser?.branchId || (currentRole === 'BRANCH_MANAGER' ? 'BR-002' : 'BR-001');

  // Filter clients
  const filteredClients = clients.filter((c) => {
    // 1. Branch scoping rules
    if (throttleBranch && c.branchId !== activeUserBranchId) {
      return false;
    }
    
    // 2. Global HQ and general filters
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.nationalId.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone.includes(search) ||
                          c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesBranch = branchFilter === 'ALL' || c.branchId === branchFilter;

    return matchesSearch && matchesStatus && (throttleBranch ? true : matchesBranch);
  });

  const getClientDetails = (clientId: string) => {
    const clientLoans = loans.filter((l) => l.clientId === clientId);
    const clientPayments = payments.filter((p) => p.clientId === clientId);

    const totalBorrowed = clientLoans.reduce((sum, l) => sum + l.principalAmount, 0);
    const outstanding = clientLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      loansList: clientLoans,
      paymentsList: clientPayments,
      totalBorrowed,
      totalPaid,
      outstanding,
    };
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const details = selectedClient ? getClientDetails(selectedClient.id) : null;

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !nationalId.trim() || !address.trim()) {
      showToast('All customer KYC fields are strictly required.', 'error');
      return;
    }

    // Determine target branch
    const branchIdToSave = throttleBranch ? activeUserBranchId : selectedBranchId;
    if (!branchIdToSave) {
      showToast('A target terminal branch must be specified.', 'error');
      return;
    }

    // Check national ID duplicates
    const isDup = clients.some(c => c.nationalId === nationalId.trim());
    if (isDup) {
      showToast(`KYC Error: National ID ${nationalId} has active registry.`, 'error');
      return;
    }

    addClient(name, phone, nationalId, address, branchIdToSave);
    
    // Clear forms
    setName('');
    setPhone('');
    setNationalId('');
    setAddress('');
    setSelectedBranchId('');
    setShowCreateForm(false);
  };

  const handleToggleClientStatus = (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (window.confirm(`Setting client status to ${nextStatus}. Continue?`)) {
      updateClientStatus(id, nextStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-brand-primary w-5 h-5 animate-pulse shrink-0" />
            <span>Borrower KYC Core Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {throttleBranch
              ? `Manage local customer registries, analyze debt limit ratios, and start KYC portfolios locked under your associated branch.`
              : 'Global client database dashboard with outstanding ledger values across all regional offices.'}
          </p>
        </div>

        <button
          onClick={() => {
            if (throttleBranch) {
              setSelectedBranchId(activeUserBranchId);
            }
            setShowCreateForm(true);
          }}
          className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Register New Borrower</span>
        </button>
      </div>

      {/* SEARCH / FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, name, National ID card code, or telephone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* HQ Branch Filter */}
          {!throttleBranch && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-slate-200/80 text-slate-700 bg-white font-semibold rounded-lg text-xs px-2.5 py-1.5 focus:ring-1 focus:ring-brand-primary focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {branches.map(br => (
                <option key={br.id} value={br.id}>{br.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-brand-secondary text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-green-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Active accounts
          </button>
        </div>
      </div>

      {/* CORE SPLIT SCREEN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST TABLE CONTAINER */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden lg:col-span-2 flex flex-col justify-between shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Recorded Borrowers Ledger
            </h3>
            <span className="text-[9px] font-mono tracking-wider uppercase bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md font-extrabold">
              {filteredClients.length} accounts verified
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Client details</th>
                  <th className="px-4 py-3">KYC Identifier</th>
                  <th className="px-4 py-3">Branch Terminal</th>
                  <th className="px-4 py-3 text-center">Debt State</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((c) => {
                  const clientLoans = loans.filter(l => l.clientId === c.id && l.status === 'ACTIVE');
                  const hasExposure = clientLoans.length > 0;
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedClientId === c.id ? 'bg-indigo-50/40' : ''
                      }`}
                      onClick={() => setSelectedClientId(c.id)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold bg-slate-50 border border-slate-100 px-1.5 py-1 rounded">
                          {c.nationalId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 uppercase font-semibold text-slate-500 text-[10px] tracking-tight">
                        {c.branchName}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                              : 'bg-rose-50 text-rose-800 border-rose-200/60'
                          }`}
                        >
                          {c.status}
                        </span>
                        {hasExposure && (
                          <span className="inline-block ml-1.5 px-2 py-0.5 bg-brand-primary text-white text-[9px] rounded-full font-bold uppercase tracking-tight">
                            {clientLoans.length} Exposure
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedClientId(c.id)}
                          className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
                        >
                          Audit Profile
                        </button>
                        <button
                          onClick={() => handleToggleClientStatus(c.id, c.status)}
                          className={`text-xs font-bold cursor-pointer ${
                            c.status === 'ACTIVE' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-700 hover:text-emerald-950'
                          } hover:underline`}
                        >
                          {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-semibold leading-relaxed">
                      No borrowers enrolled inside specifications.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILS PROFILE COMPONENT PANEL */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-xs">
          {selectedClient && details ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                    Auditing Profile Overview
                  </h4>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedClient.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedClientId(null)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Profile stats */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[500px] space-y-6">
                {/* Profile Grid */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 block bg-slate-50 border border-slate-100 rounded p-2 text-[11px] font-semibold text-slate-500">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Reg-ID: {selectedClient.id} | Nat-No: {selectedClient.nationalId}</span>
                  </div>
                  <div className="flex items-center gap-2 block bg-slate-50 border border-slate-100 rounded p-2 text-[11px] font-semibold text-slate-500">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>Phone: {selectedClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 block bg-slate-50 border border-slate-100 rounded p-2 text-[11px] font-semibold text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Address: {selectedClient.address}</span>
                  </div>
                </div>

                {/* Exposure Statistics */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    Absolute exposure indexes
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Borrowed</span>
                      <p className="font-mono text-[11px] text-slate-800 mt-1 font-extrabold">
                        ${details.totalBorrowed.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Paid Back</span>
                      <p className="font-mono text-[11px] text-teal-800 mt-1 font-extrabold">
                        ${details.totalPaid.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2.5 bg-yellow-50 border border-yellow-100 rounded text-center">
                      <span className="text-[9px] font-bold text-amber-700 uppercase">Outstanding</span>
                      <p className="font-mono text-[11px] text-amber-800 mt-1 font-extrabold">
                        ${details.outstanding.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan History list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide pb-1.5 border-b border-slate-100 flex justify-between">
                    <span>Active Loan Portfolios</span>
                    <span className="text-[9px] font-bold text-brand-primary">({details.loansList.length})</span>
                  </h4>

                  <div className="mt-2.5 space-y-2">
                    {details.loansList.map((loan) => (
                      <div key={loan.id} className="p-2 bg-slate-50 border border-slate-100 rounded text-xs flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-800">{loan.loanNumber}</span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 rounded ${
                              loan.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : loan.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {loan.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold text-[11px]">
                          <span>Original Principal: ${loan.principalAmount.toLocaleString()}</span>
                          <span className="text-slate-800 font-bold">Bal: ${loan.outstandingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {details.loansList.length === 0 && (
                      <p className="text-xs text-slate-400 font-semibold p-2.5 bg-slate-50 rounded text-center">
                        This customer holds no financial loan records.
                      </p>
                    )}
                  </div>
                </div>

                {/* Payments Register */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide pb-1.5 border-b border-slate-100">
                    Repayment Receipt Logs
                  </h4>
                  <div className="mt-2 text-xs space-y-2 h-36 overflow-y-auto pr-1">
                    {details.paymentsList.map((pay) => (
                      <div key={pay.id} className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">+${pay.amount.toLocaleString()}</p>
                          <p className="text-[9px] font-mono text-slate-400">{pay.date}</p>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1 py-0.5 border border-emerald-100 rounded font-bold uppercase">
                          Counter Clear
                        </span>
                      </div>
                    ))}
                    {details.paymentsList.length === 0 && (
                      <p className="text-xs text-slate-400 font-semibold p-2 bg-slate-50 rounded text-center">
                        No repayments have been audited for this borrower.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                <Users className="w-12 h-12 text-slate-300 mb-2.5 animate-bounce" />
                <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                  Select Customer account
                </h4>
                <p className="text-xs mt-1 max-w-[200px] leading-relaxed mx-auto">
                  Audit accounts, track exact outstanding debt balances, and search loans on borrower profiles.
                </p>
              </div>
            )}
          </div>
        </div>

      {/* CREATE CLIENT DIALOG MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-800">Borrower Sacco Registration</h3>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Borrower Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David Ochwo, Mwangi Kamau"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Telephone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +254 712 345 678"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">National ID Passport Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ID-8840292"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block text-slate-500">
                    Operational Branch Assigned
                  </label>
                  {throttleBranch ? (
                    <input
                      type="text"
                      disabled
                      value={currentUser?.branchName || 'Local Branch Locked'}
                      className="w-full border border-slate-200 bg-slate-100 rounded p-2 text-xs font-semibold text-slate-600"
                    />
                  ) : (
                    <select
                      required
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-semibold cursor-pointer"
                    >
                      <option value="">Select Target Sacco Branch...</option>
                      {branches.filter(b => b.status === 'ACTIVE').map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">KYC Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. Biashara Street, Nairobi Kenya or Kampala Rd plot 12"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded p-3 text-xs text-teal-900 leading-normal font-semibold">
                <ShieldAlert className="w-4.5 h-4.5 text-teal-700 inline-block mr-1.5 shrink-0" />
                <span>
                  Onboarding represents full legal and credit reference checking. Ensure all passport codes are authentic to prevent SACCO risk default.
                </span>
              </div>

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
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded font-bold cursor-pointer"
                >
                  Confirm KYC Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
