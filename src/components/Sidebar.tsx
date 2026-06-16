/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../store';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  LineChart,
  DollarSign,
  Wallet,
  Settings,
  CircleUser,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSetView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView }) => {
  const { currentRole, logout, currentUser } = useStore();

  const handleLogout = () => {
    if (window.confirm("Confirm secure operator logout? Session audit logs will finalize.")) {
      logout();
    }
  };

  // Helper to check navigation permission
  const isAllowed = (view: string): boolean => {
    if (!currentRole) return false;
    if (currentRole === 'HQ_ADMIN') return true;

    if (currentRole === 'BRANCH_MANAGER') {
      const allowed = ['dashboard', 'clients', 'loans', 'payments', 'analytics', 'settings'];
      return allowed.includes(view);
    }

    if (currentRole === 'LOAN_OFFICER') {
      const allowed = ['dashboard', 'clients', 'loans', 'payments'];
      return allowed.includes(view);
    }

    return false;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'branches', label: 'Branches', icon: GitBranch, hqOnly: true },
    { id: 'clients', label: 'Clients Profile', icon: Users },
    { id: 'loans', label: 'Loan Book', icon: Wallet },
    { id: 'payments', label: 'Repayment Ledger', icon: DollarSign },
    { id: 'users', label: 'Staff Directory', icon: CircleUser, hqOnly: true },
    { id: 'analytics', label: 'Intelligence Desk', icon: LineChart, officerExcluded: true },
  ];

  return (
    <aside className="w-64 bg-brand-primary flex flex-col h-full shrink-0 text-white">
      {/* Brand & Corporate Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-md flex items-center justify-center font-bold text-slate-900 shadow-sm shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none text-white">Branch Tracker</h1>
            <p className="text-[10px] lowercase text-white/50 font-semibold font-mono tracking-wider mt-1">
              core microfinance deck
            </p>
          </div>
        </div>
      </div>

      {/* Operator Status */}
      <div className="p-4 bg-white/5 border-b border-white/10 text-xs">
        <span className="text-white/40 font-bold uppercase tracking-wider block text-[9px] mb-1.5">
          Authorized Operator
        </span>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AM'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-white truncate leading-snug">{currentUser?.name}</p>
            <p className="font-mono text-[9px] text-white/60 uppercase font-extrabold tracking-widest mt-0.5">
              {currentRole?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Directory Actions */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!isAllowed(item.id)) return null;
          
          const IconComponent = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSetView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-brand-accent' : 'text-white/60'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Corporate Foot footer */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="mb-4 text-center">
          <span className="inline-block px-2.5 py-1 bg-brand-accent/25 border border-brand-accent/30 rounded text-[9px] font-mono text-brand-accent font-extrabold uppercase tracking-widest">
            Live Vault Active
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-200 hover:text-white bg-red-950/20 hover:bg-red-950/40 p-2.5 rounded-lg border border-red-900/40 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit Secure Vault</span>
        </button>
      </div>
    </aside>
  );
};
