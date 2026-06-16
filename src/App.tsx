/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { ToastContainer } from './components/ToastContainer';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { BranchView } from './components/BranchView';
import { ClientView } from './components/ClientView';
import { LoanView } from './components/LoanView';
import { PaymentView } from './components/PaymentView';
import { UserView } from './components/UserView';
import { AnalyticsView } from './components/AnalyticsView';

import {
  ShieldAlert,
  Sliders,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  X,
  PlusCircle,
  Coins,
  Wallet,
  Users,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, currentRole, showToast } = useStore();
  const [currentView, setCurrentView] = useState('dashboard');

  // Global Interactive Modals Trigger States
  const [globalClientOpen, setGlobalClientOpen] = useState(false);
  const [globalLoanOpen, setGlobalLoanOpen] = useState(false);
  const [globalPaymentOpen, setGlobalPaymentOpen] = useState(false);

  if (!currentUser) {
    return <AuthView />;
  }

  // Security authorization validator per tab
  const verifyAccess = (view: string): boolean => {
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

  const handleSetViewWithPermissionCheck = (view: string) => {
    if (verifyAccess(view)) {
      setCurrentView(view);
    } else {
      showToast(`Credential Revoked: Role '${currentRole}' is restricted from accessing the '${view}' section.`, 'error');
    }
  };

  const renderActiveView = () => {
    if (!verifyAccess(currentView)) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-xl mx-auto mt-12 text-center shadow-md">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-rose-900 uppercase tracking-tight">
            Security Block &mdash; Desk Clearance Required
          </h3>
          <p className="text-xs text-rose-700 mt-2 leading-relaxed">
            Your current operational clearance level (<strong>{currentRole?.replace('_', ' ')}</strong>) is strictly unauthorized to read or write metadata associated with the <strong>'{currentView}'</strong> directory. Your session tokens has been flagged in our logs.
          </p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-5 px-4.5 py-2 bg-brand-primary text-white rounded text-xs font-bold shadow hover:bg-brand-primary-hover transition-all"
          >
            Return to Core Dashboard
          </button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={handleSetViewWithPermissionCheck}
            openNewClientModal={() => setGlobalClientOpen(true)}
            openNewLoanModal={() => setGlobalLoanOpen(true)}
            openNewPaymentModal={() => setGlobalPaymentOpen(true)}
          />
        );
      case 'branches':
        return <BranchView />;
      case 'clients':
        return <ClientView />;
      case 'loans':
        return <LoanView />;
      case 'payments':
        return <PaymentView />;
      case 'users':
        return <UserView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-2xl">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-primary" />
              <span>Sacco Terminal System Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Manage terminal configurations, flat Simple simple interest schedules, national identification verification API proxies, and local branch limits attributes.
            </p>

            <div className="mt-6 space-y-4 text-xs font-medium">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800">Operational Profile: Active</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Terminal registers represent encrypted links to our central relational storage databases. HMR streams and network socket checks remain live.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">OPERATING REGION</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">East Africa Hub, SACCOs Group</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">VAULT CONNECTION VERSION</span>
                  <p className="text-sm font-mono text-slate-800 mt-1 font-bold">2026.1 Enterprise</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => showToast('Configurations archived successfully.', 'success')}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded font-bold transition-all cursor-pointer"
                >
                  Save Sacco Settings
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView onNavigate={handleSetViewWithPermissionCheck} openNewClientModal={() => setGlobalClientOpen(true)} openNewLoanModal={() => setGlobalLoanOpen(true)} openNewPaymentModal={() => setGlobalPaymentOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg text-slate-700 relative overflow-hidden font-sans">
      {/* Toast System alerts layer */}
      <ToastContainer />

      {/* Main Sidebar Deck (Enforces role parameters list automatically) */}
      <Sidebar currentView={currentView} onSetView={handleSetViewWithPermissionCheck} />

      {/* Dynamic Content Frame Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* INTERACTIVE GLOBAL CLIENTS REGISTER DRAWER OVERLAY */}
      {globalClientOpen && (
        <ClientModalWrapper onClose={() => setGlobalClientOpen(false)} />
      )}

      {/* INTERACTIVE GLOBAL APPRAISAL DISBURSEMENT DRAWER OVERLAY */}
      {globalLoanOpen && (
        <LoanModalWrapper onClose={() => setGlobalLoanOpen(false)} />
      )}

      {/* INTERACTIVE GLOBAL DEPOSITS REPAYMENTS CO counters OVERLAY */}
      {globalPaymentOpen && (
        <PaymentModalWrapper onClose={() => setGlobalPaymentOpen(false)} />
      )}
    </div>
  );
};

// Global Modals Helpers so Operators can disburse from any section effortlessly!
const ClientModalWrapper: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addClient, clients, branches, currentRole, currentUser, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNo, setIdNo] = useState('');
  const [address, setAddress] = useState('');
  
  const throttle = currentRole !== 'HQ_ADMIN';
  const localBranchId = currentUser?.branchId || 'BR-001';
  const [branchId, setBranchId] = useState(throttle ? localBranchId : '');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !idNo.trim() || !address.trim() || !branchId) {
      showToast('All customer parameters require check inputs.', 'warning');
      return;
    }
    
    // Dupree check
    if (clients.some(c => c.nationalId === idNo.trim())) {
      showToast(`Conflict error: Identity ${idNo} already registered.`, 'error');
      return;
    }

    addClient(name.trim(), phone, idNo, address, branchId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-bold text-slate-800">Quick Client Intake Portal</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 block">Client Full Name</label>
            <input type="text" required placeholder="e.g. David Ochwo" value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">Phone Telephone</label>
              <input type="tel" required placeholder="e.g. +256782345" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-700 block">National ID Passport</label>
              <input type="text" required placeholder="e.g. ID-4402" value={idNo} onChange={e => setIdNo(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-700 block">KYC Sacco Branch Node</label>
            {throttle ? (
              <input type="text" disabled value={currentUser?.branchName || 'Nairobi CBD Branch'} className="w-full border border-slate-200 bg-slate-55 p-2 rounded font-bold text-slate-500" />
            ) : (
              <select required value={branchId} onChange={e => setBranchId(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded outline-none cursor-pointer">
                <option value="">Select target branch terminal...</option>
                {branches.filter(b => b.status === 'ACTIVE').map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-700 block">Residential Address</label>
            <input type="text" required placeholder="e.g. Ngong Rd plot 4, Nairobi" value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded cursor-pointer">Cancel</button>
            <button type="submit" className="px-3.5 py-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded font-bold cursor-pointer">Register Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoanModalWrapper: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addLoan, clients, currentRole, currentUser, showToast } = useStore();
  const [cid, setCid] = useState('');
  const [pAmount, setPAmount] = useState('');
  const [iRate, setIRate] = useState('12');
  const [months, setMonths] = useState('12');

  const throttle = currentRole !== 'HQ_ADMIN';
  const localBranchId = currentUser?.branchId || 'BR-001';

  const clientsList = clients.filter(c => {
    if (c.status === 'INACTIVE') return false;
    if (throttle) return c.branchId === localBranchId;
    return true;
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(pAmount);
    const interest = parseFloat(iRate);
    const period = parseInt(months);

    if (!cid) {
      showToast('credit client must be selected.', 'warning');
      return;
    }
    if (isNaN(principal) || principal <= 0) {
      showToast('Principal must be positive check.', 'warning');
      return;
    }

    addLoan(cid, principal, interest, period, new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-bold text-slate-800">Quick Appraisal Disbursal</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 block">Select Registered Sacco Borrower</label>
            <select required value={cid} onChange={e => setCid(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded outline-none cursor-pointer">
              <option value="">Choose and identify customer account...</option>
              {clientsList.map(c => (
                <option key={c.id} value={c.id}>{c.name} (National ID: {c.nationalId})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">Principal Amount ($)</label>
              <input type="number" required min="1" placeholder="e.g. 5000" value={pAmount} onChange={e => setPAmount(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-700 block">Simple Interest Rate (%)</label>
              <input type="number" required min="1" value={iRate} onChange={e => setIRate(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-700 block">Period Term Duration (Months)</label>
            <input type="number" required min="1" value={months} onChange={e => setMonths(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded cursor-pointer">Cancel</button>
            <button type="submit" className="px-3.5 py-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded font-bold cursor-pointer">Approve Disbursal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModalWrapper: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { recordPayment, loans, currentRole, currentUser, showToast } = useStore();
  const [lid, setLid] = useState('');
  const [amt, setAmt] = useState('');

  const throttle = currentRole !== 'HQ_ADMIN';
  const localBranchId = currentUser?.branchId || 'BR-001';

  const eligibleLoans = loans.filter((l) => {
    if (l.status === 'COMPLETED') return false;
    if (throttle) return l.branchId === localBranchId;
    return true;
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(amt);
    if (!lid) {
      showToast('A target active loan must be mapped.', 'warning');
      return;
    }
    if (isNaN(cash) || cash <= 0) {
      showToast('Payment sum must be positive.', 'warning');
      return;
    }

    recordPayment(lid, cash, new Date().toISOString().split('T')[0], 'Desk Counter Cash Intake');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-300 max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-bold text-slate-800">Quick Counter Repayment</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <label className="text-slate-700 block">Select Active Loan portfolio</label>
            <select required value={lid} onChange={e => setLid(e.target.value)} className="w-full border border-slate-200 bg-white p-2 rounded outline-none cursor-pointer text-slate-800 font-bold">
              <option value="">Identify client ledger and outstanding...</option>
              {eligibleLoans.map(el => (
                <option key={el.id} value={el.id}>{el.loanNumber} &mdash; {el.clientName} (Outstanding: ${el.outstandingBalance.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-700 block">Repayment Cash Amount ($)</label>
            <input type="number" required min="1" placeholder="e.g. 1200" value={amt} onChange={e => setAmt(e.target.value)} className="w-full border border-slate-200 p-2 rounded outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded cursor-pointer">Cancel</button>
            <button type="submit" className="px-3.5 py-1.5 bg-brand-primary text-white hover:bg-brand-primary-hover rounded font-bold cursor-pointer">Accept Repayment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
