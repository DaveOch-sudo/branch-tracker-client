/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { UserRole } from '../types';
import { Bell, KeyRound, MonitorCheck, Calendar, Lock } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { currentUser, currentRole, overrideRole, branches } = useStore();
  const [systemTime, setSystemTime] = useState('');

  useEffect(() => {
    // Setting initial time matching metadata or current ticking clock
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) +
          ' | ' +
          now.toLocaleTimeString('en-US', { hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleOverride = (e: React.ChangeEvent<HTMLSelectElement>) => {
    overrideRole(e.target.value as UserRole);
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'HQ_ADMIN':
        return 'Global HQ Administrator';
      case 'BRANCH_MANAGER':
        return 'Nairobi Branch General Manager';
      case 'LOAN_OFFICER':
        return 'Kampala Lending Desk Officer';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 relative z-30">
      {/* Title & Branch Locks */}
      <div className="flex items-center gap-4">
        {currentUser?.branchId ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100/60 rounded-lg text-xs font-semibold text-brand-primary">
            <Lock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span>Branch View: {currentUser.branchName} Only</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-100/60 rounded-lg text-xs font-semibold text-brand-secondary">
            <MonitorCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Global Operations View (All Branches)</span>
          </div>
        )}
      </div>

      {/* Auditor Sandbox / Quick Switches Plus Status */}
      <div className="flex items-center gap-6">
        {/* Sandbox Role Switcher */}
        <div className="hidden lg:flex items-center gap-2.5 bg-amber-50/50 border border-amber-200/60 p-1 rounded-lg">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase px-2 font-mono tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Override Role:</span>
          </div>
          <select
            value={currentRole || 'HQ_ADMIN'}
            onChange={handleRoleOverride}
            className="bg-white border border-amber-200 rounded-md text-xs px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer shadow-2xs"
          >
            <option value="HQ_ADMIN">HQ_ADMIN (Central Authority)</option>
            <option value="BRANCH_MANAGER">BRANCH_MANAGER (Nairobi CBD)</option>
            <option value="LOAN_OFFICER">LOAN_OFFICER (Kampala Central)</option>
          </select>
        </div>

        {/* Dynamic ticking clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono font-medium text-slate-500 bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{systemTime}</span>
        </div>

        {/* Notifications Icon (Simulated) */}
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 relative shrink-0 transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-error border border-white" />
        </button>

        {/* Profile representation */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[9px] text-slate-400 truncate max-w-[140px] font-mono leading-none mt-1 uppercase tracking-tight">
              {currentUser?.email}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-primary text-brand-accent flex items-center justify-center font-bold text-xs shadow-inner shrink-0 border border-white/20">
            {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'OP'}
          </div>
        </div>
      </div>
    </header>
  );
};
