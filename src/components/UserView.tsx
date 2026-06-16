/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { UserRole, User } from '../types';
import {
  Search,
  Plus,
  CircleUser,
  ShieldCheck,
  Building,
  Mail,
  X,
  PlusCircle,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const UserView: React.FC = () => {
  const {
    users,
    branches,
    currentRole,
    addUser,
    updateUserStatus,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  
  // Create User Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('LOAN_OFFICER');
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Access protection check
  if (currentRole !== 'HQ_ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mt-10 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-rose-900">Access Denied &mdash; Central Directory Only</h3>
        <p className="text-xs text-rose-700 mt-2 leading-relaxed">
          Operational permissions level ({currentRole?.replace('_', ' ')}) is unauthorized to administer credential parameters or edit user access. All access attempts are documented under secure corporate logs.
        </p>
      </div>
    );
  }

  // Filter staff users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('All credential directory fields are required.', 'error');
      return;
    }

    // Branch requirements validation
    // HR Rule: HQ_ADMIN doesn't require branch. BRANCH_MANAGER and LOAN_OFFICER strictly require a terminal branch assignment.
    const isBranchRequired = role === 'BRANCH_MANAGER' || role === 'LOAN_OFFICER';
    if (isBranchRequired && !selectedBranchId) {
      showToast(`Credential Error: A physical branch must be assigned to role '${role.replace('_', ' ')}'.`, 'error');
      return;
    }

    addUser(name.trim(), email.trim().toLowerCase(), role, selectedBranchId || undefined);

    // reset Form
    setName('');
    setEmail('');
    setPassword('');
    setRole('LOAN_OFFICER');
    setSelectedBranchId('');
    setShowCreateForm(false);
  };

  const handleToggleUserStatus = (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (window.confirm(`Are you absolutely sure you wish to change user ${id} status to ${nextStatus}? This immediately controls active login permissions.`)) {
      updateUserStatus(id, nextStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CircleUser className="text-brand-primary w-5 h-5 shrink-0" />
            <span>Staff Directory and Credentials</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional user logins, configure localized branch permissions, and audit staff roles.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Enroll Sacco Operator</span>
        </button>
      </div>

      {/* SEARCH / FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff by Name, Email address, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('HQ_ADMIN')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'HQ_ADMIN'
                ? 'bg-brand-secondary text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => setRoleFilter('BRANCH_MANAGER')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'BRANCH_MANAGER'
                ? 'bg-indigo-700 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Managers
          </button>
          <button
            onClick={() => setRoleFilter('LOAN_OFFICER')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'LOAN_OFFICER'
                ? 'bg-teal-700 text-white font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Officers
          </button>
        </div>
      </div>

      {/* USER LIST DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
            Enrolled Institutional Operators
          </h3>
          <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-2.5 py-1 rounded-md font-mono uppercase tracking-wider">
            {filteredUsers.length} Users Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">Operator Name</th>
                <th className="px-4 py-3">Registered Email</th>
                <th className="px-4 py-3 min-w-[140px]">Assigned Authority Role</th>
                <th className="px-4 py-3">Assigned Sacco Node</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Credentials control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold font-mono uppercase">{u.id}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500 font-semibold">
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                      u.role === 'HQ_ADMIN'
                        ? 'bg-blue-50 text-[#1a237e] border-blue-200/50'
                        : u.role === 'BRANCH_MANAGER'
                        ? 'bg-teal-50 text-[#00695c] border-teal-200/50'
                        : 'bg-amber-50 text-[#b08d3e] border-amber-200/50'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 flex items-center gap-1.5 text-slate-500 font-semibold uppercase text-[10px] tracking-tight mt-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{u.branchName || 'Central Corporate HQ'}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                          : 'bg-rose-50 text-rose-800 border-rose-200/60'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        u.status === 'ACTIVE'
                          ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                      } cursor-pointer active:scale-95`}
                    >
                      {u.status === 'ACTIVE' ? 'Revoke Access' : 'Restore Access'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    No matching operator accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATION DIALOG MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CircleUser className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-800">Enroll Sacco Staff Login</h3>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Operator Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Peter Ssewanko"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Staff Corporate Email</label>
                <input
                  type="email"
                  placeholder="e.g. peter.s@branchtracker.co"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Assign Workspace Role</label>
                <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full border border-slate-200 bg-white rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-semibold cursor-pointer"
                >
                  <option value="LOAN_OFFICER">LOAN_OFFICER (Assigned branch operations)</option>
                  <option value="BRANCH_MANAGER">BRANCH_MANAGER (General local branch authority)</option>
                  <option value="HQ_ADMIN">HQ_ADMIN (Central global Sacco authority)</option>
                </select>
              </div>

              {/* Branch select fields (Skipped or disabled for HQ ADMIN) */}
              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Assign Sacco Node Terminal</label>
                {role === 'HQ_ADMIN' ? (
                  <input
                    type="text"
                    disabled
                    value="HQ - Central Authority (Global All branches view)"
                    className="w-full border border-slate-200 bg-slate-100 rounded p-2 text-xs text-slate-500 font-semibold"
                  />
                ) : (
                  <select
                    required
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none font-semibold cursor-pointer"
                  >
                    <option value="">Select physical branch Hub...</option>
                    {branches.filter(b => b.status === 'ACTIVE').map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-700 block">Initial Lock Password</label>
                <input
                  type="password"
                  required
                  placeholder="e.g. securePass123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none focus:outline-none"
                />
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
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded font-bold transition-all cursor-pointer"
                >
                  Confirm Staff Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
