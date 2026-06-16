/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { Branch } from '../types';
import {
  Search,
  Plus,
  GitBranch,
  MapPin,
  Clock,
  Briefcase,
  Users,
  Wallet,
  Coins,
  X,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export const BranchView: React.FC = () => {
  const {
    branches,
    clients,
    loans,
    payments,
    users,
    activities,
    currentRole,
    addBranch,
    updateBranchStatus,
  } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  
  // Create Branch Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchLocation, setNewBranchLocation] = useState('');

  // Access check
  if (currentRole !== 'HQ_ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mt-10 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-rose-900">Access Denied &mdash; Mission Authority Required</h3>
        <p className="text-xs text-rose-700 mt-2 leading-relaxed">
          Your current credentials level ({currentRole?.replace('_', ' ')}) is unauthorized to access or administer physical Sacco branches. This operation is encrypted and recorded under audit laws.
        </p>
      </div>
    );
  }

  // Filter & Search branches
  const filteredBranches = branches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
                          b.location.toLowerCase().includes(search.toLowerCase()) || 
                          b.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBranchStats = (branchId: string) => {
    const bClients = clients.filter((c) => c.branchId === branchId);
    const bLoans = loans.filter((l) => l.branchId === branchId);
    const bPayments = payments.filter((p) => p.branchId === branchId);

    const outstanding = bLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
    const collected = bPayments.reduce((sum, p) => sum + p.amount, 0);
    const activeStaff = users.filter((u) => u.branchId === branchId && u.status === 'ACTIVE');

    return {
      clientCount: bClients.length,
      loanCount: bLoans.length,
      outstanding,
      collected,
      staffCount: activeStaff.length,
      staffList: activeStaff,
    };
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const selectedBranchStats = selectedBranch ? getBranchStats(selectedBranch.id) : null;
  const branchActivities = selectedBranch
    ? activities.filter((act) => act.branchId === selectedBranch.id)
    : [];

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchLocation.trim()) {
      alert('Error: Branch name and location location address are mandatory.');
      return;
    }
    addBranch(newBranchName, newBranchLocation);
    setNewBranchName('');
    setNewBranchLocation('');
    setShowCreateForm(false);
  };

  const handleToggleBranchStatus = (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = `Are you absolutely sure you wish to change status of Sacco Branch ${id} to ${nextStatus}? This impacts active team user access limits and loan counters on this node!`;
    if (window.confirm(confirmMsg)) {
      updateBranchStatus(id, nextStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitBranch className="text-brand-primary w-5 h-5 shrink-0" />
            <span>HQ Sacco Branches Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional nodes, verify active cash aggregates, and track regional performance indices.
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Establish New Branch</span>
        </button>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search branches by ID, name, or location region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-brand-secondary text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Statuses
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === 'INACTIVE'
                ? 'bg-rose-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Deactivated Only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BRANCH LIST TABLE */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden lg:col-span-2 shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
              Recorded Sacco Terminals
            </h3>
            <span className="text-[9px] font-mono tracking-wider uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-extrabold">
              {filteredBranches.length} Matches Found
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Branch ID</th>
                  <th className="px-4 py-3">Terminal Name</th>
                  <th className="px-4 py-3">Region Location</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((br) => (
                  <tr
                    key={br.id}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedBranchId === br.id ? 'bg-indigo-50/40' : ''
                    }`}
                    onClick={() => setSelectedBranchId(br.id)}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{br.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{br.name}</td>
                    <td className="px-4 py-3.5 flex items-center gap-1.5 text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{br.location}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          br.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : 'bg-rose-50 text-rose-800 border-rose-200/60'
                        }`}
                      >
                        {br.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-3.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedBranchId(br.id)}
                        className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
                      >
                        Audit Details
                      </button>
                      <button
                        onClick={() => handleToggleBranchStatus(br.id, br.status)}
                        className={`text-xs font-bold cursor-pointer ${
                          br.status === 'ACTIVE'
                            ? 'text-rose-600 hover:text-rose-800'
                            : 'text-emerald-700 hover:text-emerald-900'
                        } hover:underline`}
                      >
                        {br.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredBranches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold font-sans">
                      No branches match specified filtering configuration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED VIEW DRAWER PANEL */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-xs">
          {selectedBranch && selectedBranchStats ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                    Auditor Review
                  </h4>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedBranch.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedBranchId(null)}
                  className="p-1 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Statistics body */}
              <div className="p-5 space-y-6 flex-1 overflow-y-auto max-h-[500px]">
                {/* Micro metrics grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Enrolled Borrowers
                    </span>
                    <p className="text-base font-bold font-mono text-slate-800 mt-1">
                      {selectedBranchStats.clientCount} clients
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Assigned Officers
                    </span>
                    <p className="text-base font-bold font-mono text-slate-800 mt-1">
                      {selectedBranchStats.staffCount} staff
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-lg shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Outstanding debt
                    </span>
                    <p className="text-base font-bold font-mono text-brand-primary mt-1">
                      ${selectedBranchStats.outstanding.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-teal-50/40 border border-teal-100 rounded-lg shadow-2xs">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                      Branch Recoveries
                    </span>
                    <p className="text-base font-bold font-mono text-[#00897B] mt-1">
                      ${selectedBranchStats.collected.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Assigned Users list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    Assigned Operators List
                  </h4>
                  <div className="mt-2 space-y-2.5">
                    {selectedBranchStats.staffList.map((user_item) => (
                      <div key={user_item.id} className="flex justify-between items-center text-xs p-1">
                        <div>
                          <p className="font-semibold text-slate-800">{user_item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-medium">{user_item.email}</p>
                        </div>
                        <span className="text-[10px] bg-indigo-50 text-brand-primary border border-indigo-100 px-1.5 py-0.5 rounded font-bold uppercase">
                          {user_item.role === 'BRANCH_MANAGER' ? 'Manager' : 'Lending Officer'}
                        </span>
                      </div>
                    ))}
                    {selectedBranchStats.staffList.length === 0 && (
                      <p className="text-xs text-slate-400 font-semibold p-2 bg-slate-50 rounded text-center">
                        No active users assigned to this branch yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Activities filtered */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    Recent Regional Activities
                  </h4>
                  <div className="mt-2.5 space-y-3 h-44 overflow-y-auto pr-1">
                    {branchActivities.map((act) => (
                      <div key={act.id} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{act.action}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            {act.timestamp.substring(11)}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed font-semibold">
                          {act.details}
                        </p>
                      </div>
                    ))}
                    {branchActivities.length === 0 && (
                      <p className="text-xs text-slate-400 font-semibold p-2 bg-slate-50 rounded text-center">
                        No transactions documented on this node today.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[350px]">
                <GitBranch className="w-12 h-12 text-slate-300 mb-2.5" />
                <h4 className="font-bold text-slate-600 text-xs uppercase tracking-wide">
                  No Node Inspected
                </h4>
                <p className="text-xs mt-1 max-w-[200px] leading-relaxed mx-auto">
                  Select a Sacco terminal branch from the ledger list on the left to review operational audit balances.
                </p>
              </div>
            )}
          </div>
        </div>

      {/* ESTABLISH BRANCH MODAL OVERLAY */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4.5 h-4.5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-800">Establish Sacco Node</h3>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Sacco Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kampala Central, Muthaiga SACCO"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Location Region / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi CBD, Kampala Rd Uganda"
                  required
                  value={newBranchLocation}
                  onChange={(e) => setNewBranchLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <h4 className="font-bold">Operational Note</h4>
                  <p className="text-[11px] leading-relaxed mt-0.5 font-medium">
                    New terminals default to an <strong>ACTIVE</strong> operational state. Staff directories and cash ledger streams can be assigned to this token immediately.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-xs font-semibold hover:bg-slate-50 text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded text-xs font-bold transition-all cursor-pointer"
                >
                  Authorize Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
