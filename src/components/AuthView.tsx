/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../store';
import { KeyRound, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, loading, error } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    login(email.trim(), password);
  };

  // Suggesters for quick demonstration testing!
  const quickLogins = [
    { label: 'Central HQ Admin', email: 'davidochwo24@gmail.com', pass: 'admin123', role: 'HQ_ADMIN' },
    { label: 'Nairobi Branch Manager', email: 'jane.kamau@branchtracker.co', pass: 'manager123', role: 'BRANCH_MANAGER' },
    { label: 'Kampala Loan Officer', email: 'peter.s@branchtracker.co', pass: 'officer123', role: 'LOAN_OFFICER' },
  ];

  const handleQuickLogin = (emailVal: string, passwordVal: string) => {
    setEmail(emailVal);
    setPassword(passwordVal);
    login(emailVal, passwordVal);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Visual ambient graphic circles (No futuristic cyberpunk neon, just warm premium tones) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-12 -translate-y-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-35 translate-x-12 translate-y-20 pointer-events-none" />

      {/* Main Container Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded bg-brand-primary flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900 block">Branch Tracker</span>
            <span className="text-[9px] font-mono leading-none tracking-widest text-brand-secondary uppercase font-extrabold">
              Microfinance intelligence vaults
            </span>
          </div>
        </div>
        
        <h2 className="text-center text-lg font-bold text-slate-950 tracking-tight mt-4">
          Core Operating System Sign-In
        </h2>
        <p className="text-center text-xs text-slate-400 mt-1 leading-normal font-semibold">
          Secure financial network ledger entry. Registered Sacco operators credentials required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-lg border border-slate-200 shadow-xl space-y-6">
          
          {/* Error Feedbacks */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-xs text-rose-900">
              <AlertCircle className="w-4.5 h-4.5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Credential Override Locked</h4>
                <p className="text-[11px] leading-relaxed mt-0.5 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Secure Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 block">
                Security Operator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. operator@branchtracker.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded pl-9 pr-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pass" className="text-xs font-bold text-slate-700 block">
                Operator Security Lock Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded pl-9 pr-10 py-2.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 px-1.5 text-slate-400 hover:text-slate-600 absolute right-1.5 top-2.5 rounded hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between font-medium text-[11px] text-slate-400">
              <div className="flex items-center">
                <input
                  id="persistence"
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 text-brand-primary focus:ring-brand-primary border-slate-200 rounded cursor-pointer"
                />
                <label htmlFor="persistence" className="ml-1.5 block cursor-pointer select-none">
                  Remain logged-in
                </label>
              </div>
              <span className="text-[11px] text-slate-400 hover:text-slate-600 cursor-help">
                Forgot access keys?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded border border-transparent shadow-xs text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50 disabled:cursor-wait cursor-pointer uppercase tracking-wider"
            >
              {loading ? 'Decrypting Signatures Key...' : 'Sign In To Secure Hub'}
            </button>
          </form>

          {/* AUDITOR SWITCHBOARD BOARD */}
          <div className="border-t border-slate-100 pt-5 space-y-3.5">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-0.5">
                Auditor Sandbox Quick login
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                Switch profiles to instantly experience distinct operational layouts:
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {quickLogins.map((quick, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickLogin(quick.email, quick.pass)}
                  className="flex justify-between items-center text-left bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded px-3 py-2 text-xs font-semibold hover:border-indigo-300 transition-all cursor-pointer"
                >
                  <div>
                    <span className="text-slate-900 font-bold block">{quick.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{quick.email}</span>
                  </div>
                  <span className="text-[9px] bg-indigo-100 text-brand-primary px-1.5 py-0.5 rounded font-extrabold font-mono uppercase shrink-0">
                    {quick.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
              <span>TLS AES-256 Vault-Link Active</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
