/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Branch, Client, Loan, Payment, Activity, UserRole } from './types';

interface StoreState {
  users: User[];
  branches: Branch[];
  clients: Client[];
  loans: Loan[];
  payments: Payment[];
  activities: Activity[];
  currentUser: User | null;
  currentRole: UserRole | null; // For easy role injection/testing
  loading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  overrideRole: (role: UserRole) => void;
  
  // Data actions
  addBranch: (name: string, location: string) => void;
  updateBranchStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => void;
  addClient: (name: string, phone: string, nationalId: string, address: string, branchId: string) => void;
  updateClientStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => void;
  addLoan: (clientId: string, principalAmount: number, interestRate: number, termMonths: number, dateIssued: string) => void;
  recordPayment: (loanId: string, amount: number, date: string, notes?: string) => void;
  updateLoanStatus: (loanId: string, status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED') => void;
  addUser: (name: string, email: string, role: UserRole, branchId?: string) => void;
  updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => void;
  
  // Toast notifications helper
  showToast: (message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const StoreContext = createContext<StoreState | undefined>(undefined);

// Initial Seed Data
const DEFAULT_BRANCHES: Branch[] = [
  { id: 'BR-001', name: 'Kampala Central', location: 'Kampala, Uganda', status: 'ACTIVE', createdDate: '2024-01-15' },
  { id: 'BR-002', name: 'Nairobi CBD', location: 'Nairobi, Kenya', status: 'ACTIVE', createdDate: '2024-02-10' },
  { id: 'BR-003', name: 'Muthaiga SACCO', location: 'Nairobi, Kenya', status: 'ACTIVE', createdDate: '2024-03-01' },
  { id: 'BR-004', name: 'Entebbe Gateway', location: 'Entebbe, Uganda', status: 'ACTIVE', createdDate: '2024-05-20' },
];

const DEFAULT_USERS: User[] = [
  { id: 'US-001', name: 'David Ochwo', email: 'davidochwo24@gmail.com', role: 'HQ_ADMIN', status: 'ACTIVE' },
  { id: 'US-002', name: 'Jane Kamau', email: 'jane.kamau@branchtracker.co', role: 'BRANCH_MANAGER', branchId: 'BR-002', branchName: 'Nairobi CBD', status: 'ACTIVE' },
  { id: 'US-003', name: 'Peter Ssewanko', email: 'peter.s@branchtracker.co', role: 'LOAN_OFFICER', branchId: 'BR-001', branchName: 'Kampala Central', status: 'ACTIVE' },
  { id: 'US-004', name: 'Alice Namubiru', email: 'alice.n@branchtracker.co', role: 'LOAN_OFFICER', branchId: 'BR-004', branchName: 'Entebbe Gateway', status: 'ACTIVE' },
];

const DEFAULT_CLIENTS: Client[] = [
  { id: 'CL-001', name: 'Mwangi Kamau', nationalId: 'ID-8849201', phone: '+254712345678', address: 'Biashara St, Nairobi', branchId: 'BR-002', branchName: 'Nairobi CBD', status: 'ACTIVE', createdDate: '2024-06-10' },
  { id: 'CL-002', name: 'Sarah Nabakooza', nationalId: 'ID-9920184', phone: '+256782345678', address: 'Plot 45 Kampala Rd, Kampala', branchId: 'BR-001', branchName: 'Kampala Central', status: 'ACTIVE', createdDate: '2024-07-12' },
  { id: 'CL-003', name: 'John Omondi', nationalId: 'ID-3392810', phone: '+254722334455', address: 'Kisumu Rd, Nakuru', branchId: 'BR-002', branchName: 'Nairobi CBD', status: 'ACTIVE', createdDate: '2024-08-01' },
  { id: 'CL-004', name: 'Florence Namubiru', nationalId: 'ID-4402194', phone: '+256701122334', address: 'Mission Rd, Entebbe', branchId: 'BR-004', branchName: 'Entebbe Gateway', status: 'ACTIVE', createdDate: '2024-08-15' },
  { id: 'CL-005', name: 'Agnes Atieno', nationalId: 'ID-2281930', phone: '+254705566778', address: 'Ngong Rd, Nairobi', branchId: 'BR-003', branchName: 'Muthaiga SACCO', status: 'ACTIVE', createdDate: '2024-09-02' },
];

const DEFAULT_LOANS: Loan[] = [
  { id: 'LN-001', loanNumber: 'LN-2026-001', clientId: 'CL-001', clientName: 'Mwangi Kamau', branchId: 'BR-002', branchName: 'Nairobi CBD', principalAmount: 5000, interestRate: 12, termMonths: 12, outstandingBalance: 2400, status: 'ACTIVE', dateIssued: '2025-06-10' },
  { id: 'LN-002', loanNumber: 'LN-2026-002', clientId: 'CL-002', clientName: 'Sarah Nabakooza', branchId: 'BR-001', branchName: 'Kampala Central', principalAmount: 12000, interestRate: 15, termMonths: 24, outstandingBalance: 10500, status: 'ACTIVE', dateIssued: '2025-07-15' },
  { id: 'LN-003', loanNumber: 'LN-2025-003', clientId: 'CL-003', clientName: 'John Omondi', branchId: 'BR-002', branchName: 'Nairobi CBD', principalAmount: 3500, interestRate: 10, termMonths: 6, outstandingBalance: 0, status: 'COMPLETED', dateIssued: '2025-01-05' },
  { id: 'LN-004', loanNumber: 'LN-2026-004', clientId: 'CL-004', clientName: 'Florence Namubiru', branchId: 'BR-004', branchName: 'Entebbe Gateway', principalAmount: 8000, interestRate: 18, termMonths: 18, outstandingBalance: 7200, status: 'DEFAULTED', dateIssued: '2025-09-20' },
  { id: 'LN-005', loanNumber: 'LN-2026-005', clientId: 'CL-005', clientName: 'Agnes Atieno', branchId: 'BR-003', branchName: 'Muthaiga SACCO', principalAmount: 2000, interestRate: 12, termMonths: 6, outstandingBalance: 0, status: 'COMPLETED', dateIssued: '2025-10-01' },
];

const DEFAULT_PAYMENTS: Payment[] = [
  { id: 'PM-001', clientId: 'CL-001', clientName: 'Mwangi Kamau', loanId: 'LN-001', loanNumber: 'LN-2026-001', amount: 1300, date: '2025-12-05', status: 'SUCCESS', branchId: 'BR-002', branchName: 'Nairobi CBD', notes: 'Monthly installments' },
  { id: 'PM-002', clientId: 'CL-001', clientName: 'Mwangi Kamau', loanId: 'LN-001', loanNumber: 'LN-2026-001', amount: 1300, date: '2026-02-15', status: 'SUCCESS', branchId: 'BR-002', branchName: 'Nairobi CBD', notes: 'Cash payment counter' },
  { id: 'PM-003', clientId: 'CL-002', clientName: 'Sarah Nabakooza', loanId: 'LN-002', loanNumber: 'LN-2026-002', amount: 1500, date: '2025-11-20', status: 'SUCCESS', branchId: 'BR-001', branchName: 'Kampala Central', notes: 'Mobile Loan Pay' },
  { id: 'PM-004', clientId: 'CL-003', clientName: 'John Omondi', loanId: 'LN-003', loanNumber: 'LN-2025-003', amount: 3850, date: '2025-07-05', status: 'SUCCESS', branchId: 'BR-002', branchName: 'Nairobi CBD', notes: 'Full settlement with interest' },
  { id: 'PM-005', clientId: 'CL-004', clientName: 'Florence Namubiru', loanId: 'LN-004', loanNumber: 'LN-2026-004', amount: 800, date: '2025-11-01', status: 'SUCCESS', branchId: 'BR-004', branchName: 'Entebbe Gateway', notes: 'Partial payment post default letter' },
  { id: 'PM-006', clientId: 'CL-005', clientName: 'Agnes Atieno', loanId: 'LN-005', loanNumber: 'LN-2026-005', amount: 2240, date: '2026-04-01', status: 'SUCCESS', branchId: 'BR-003', branchName: 'Muthaiga SACCO', notes: 'Final complete closure pay' },
];

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'ACT-001', userId: 'US-001', userName: 'David Ochwo', userRole: 'HQ_ADMIN', action: 'System Setup', timestamp: '2026-06-15 08:30:00', details: 'Initialized Branch Tracker system for SACCO audit.' },
  { id: 'ACT-002', userId: 'US-002', userName: 'Jane Kamau', userRole: 'BRANCH_MANAGER', action: 'Client Registered', timestamp: '2026-06-15 10:15:00', details: 'Registered new client John Omondi to Nairobi CBD branch.', branchId: 'BR-002' },
  { id: 'ACT-003', userId: 'US-003', userName: 'Peter Ssewanko', userRole: 'LOAN_OFFICER', action: 'Loan Disbursed', timestamp: '2026-06-15 11:45:00', details: 'Appraised and disbursed Loan LN-2026-002 to Sarah Nabakooza.', branchId: 'BR-001' },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const data = localStorage.getItem('bt_users');
    return data ? JSON.parse(data) : DEFAULT_USERS;
  });
  
  const [branches, setBranches] = useState<Branch[]>(() => {
    const data = localStorage.getItem('bt_branches');
    return data ? JSON.parse(data) : DEFAULT_BRANCHES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const data = localStorage.getItem('bt_clients');
    return data ? JSON.parse(data) : DEFAULT_CLIENTS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const data = localStorage.getItem('bt_loans');
    return data ? JSON.parse(data) : DEFAULT_LOANS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const data = localStorage.getItem('bt_payments');
    return data ? JSON.parse(data) : DEFAULT_PAYMENTS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const data = localStorage.getItem('bt_activities');
    return data ? JSON.parse(data) : DEFAULT_ACTIVITIES;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const data = localStorage.getItem('bt_current_user');
    return data ? JSON.parse(data) : DEFAULT_USERS[0]; // Default to HQ Admin for evaluation
  });

  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const data = localStorage.getItem('bt_current_role');
    return data ? (data as UserRole) : 'HQ_ADMIN';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage synchronizations
  useEffect(() => {
    localStorage.setItem('bt_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bt_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('bt_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('bt_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('bt_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('bt_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bt_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bt_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('bt_current_role', currentRole);
    } else {
      localStorage.removeItem('bt_current_role');
    }
  }, [currentRole]);

  // Toasts Manager
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Log activity helper
  const logActivity = (action: string, details: string, branchId?: string) => {
    const timestampStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newAct: Activity = {
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      userId: currentUser?.id || 'ANON',
      userName: currentUser?.name || 'Anonymous',
      userRole: currentRole || 'LOAN_OFFICER',
      action,
      timestamp: timestampStr,
      details,
      branchId: branchId || currentUser?.branchId,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Login action
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        setLoading(false);
        if (foundUser) {
          if (foundUser.status === 'INACTIVE') {
            setError('Your account is deactivated. Contact HQ Admin.');
            showToast('Account deactivated', 'error');
            resolve(false);
            return;
          }
          setCurrentUser(foundUser);
          setCurrentRole(foundUser.role);
          showToast(`Welcome back, ${foundUser.name}! Logged in as ${foundUser.role.replace('_', ' ')}`, 'success');
          
          // Log it
          const timestampStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
          const loginAct: Activity = {
            id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
            userId: foundUser.id,
            userName: foundUser.name,
            userRole: foundUser.role,
            action: 'User Login',
            timestamp: timestampStr,
            details: `Logged in via console credential.`,
            branchId: foundUser.branchId,
          };
          setActivities((prev) => [loginAct, ...prev]);
          resolve(true);
        } else {
          setError('Invalid email or password combination.');
          showToast('Authentication failed', 'error');
          resolve(false);
        }
      }, 800);
    });
  };

  // Logout action
  const logout = () => {
    if (currentUser) {
      logActivity('User Logout', 'Session closed by operator.');
    }
    setCurrentUser(null);
    setCurrentRole(null);
    showToast('Logged out successfully', 'info');
  };

  // Override role (for easy testing in workspace iframe)
  const overrideRole = (role: UserRole) => {
    setCurrentRole(role);
    showToast(`Session override: role set to ${role.replace('_', ' ')}`, 'info');
    logActivity('Role Override', `Switched view mode to ${role} for auditing.`);
  };

  // Add Branch
  const addBranch = (name: string, location: string) => {
    const id = `BR-${String(branches.length + 1).padStart(3, '0')}`;
    const newBranch: Branch = {
      id,
      name,
      location,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
    };
    setBranches((prev) => [...prev, newBranch]);
    showToast(`Branch "${name}" successfully established.`, 'success');
    logActivity('Branch Created', `Established branch ${id} at ${location}.`);
  };

  const updateBranchStatus = (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast(`Branch ${id} status updated to ${status}.`, 'info');
    logActivity('Branch Status Updated', `Set status of branch ${id} to ${status}.`);
  };

  // Add Client
  const addClient = (name: string, phone: string, nationalId: string, address: string, branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) {
      showToast('Error registering client: Branch not found.', 'error');
      return;
    }
    
    // Check dups
    const dup = clients.find((c) => c.nationalId === nationalId);
    if (dup) {
      showToast(`Error: Client with ID ${nationalId} already exists!`, 'error');
      return;
    }

    const id = `CL-${String(clients.length + 1).padStart(3, '0')}`;
    const newClient: Client = {
      id,
      name,
      nationalId,
      phone,
      address,
      branchId,
      branchName: branch.name,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setClients((prev) => [...prev, newClient]);
    showToast(`Client "${name}" successfully registered.`, 'success');
    logActivity('Client Registered', `Registered new client ${id} (${name}) at branch ${branch.name}.`, branchId);
  };

  const updateClientStatus = (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    showToast(`Client status adjusted to ${status}.`, 'info');
    logActivity('Client Adjusted', `Set status of client ${id} to ${status}.`);
  };

  // Add Loan
  const addLoan = (clientId: string, principalAmount: number, interestRate: number, termMonths: number, dateIssued: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      showToast('Error disbursing loan: Registered client required.', 'error');
      return;
    }

    if (principalAmount <= 0) {
      showToast('Error: Principal amount must be greater than zero.', 'error');
      return;
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const loanNum = `LN-${new Date(dateIssued).getFullYear()}-${randomSuffix}`;
    const id = `LN-${String(loans.length + 1).padStart(3, '0')}`;
    
    // Calculate total interest based on flat simple rate for simplicity
    const totalToRepay = principalAmount + (principalAmount * (interestRate / 100));

    const newLoan: Loan = {
      id,
      loanNumber: loanNum,
      clientId: client.id,
      clientName: client.name,
      branchId: client.branchId,
      branchName: client.branchName,
      principalAmount,
      interestRate,
      termMonths,
      outstandingBalance: totalToRepay,
      status: 'ACTIVE',
      dateIssued,
    };

    setLoans((prev) => [...prev, newLoan]);
    showToast(`Loan ${loanNum} of $${principalAmount} approved for ${client.name}.`, 'success');
    logActivity('Loan Appraised & Disbursed', `Approved and disbursed ${loanNum} with outstanding $${totalToRepay}.`, client.branchId);
  };

  // Record Payment
  const recordPayment = (loanId: string, amount: number, date: string, notes?: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) {
      showToast('Payment Failure: Specified active loan was not found.', 'error');
      return;
    }

    if (amount <= 0) {
      showToast('Payment Failure: Repayment amount must be positive.', 'error');
      return;
    }

    if (loan.status === 'COMPLETED') {
      showToast('Payment Rejected: This loan is already fully settled.', 'warning');
      return;
    }

    // Process repayment
    const refund = Math.max(0, amount - loan.outstandingBalance);
    const effectivePayment = amount - refund;
    const initialBalance = loan.outstandingBalance;
    const finalBalance = Math.max(0, initialBalance - effectivePayment);

    // Update Loan Balance
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          const updatedStatus = finalBalance === 0 ? 'COMPLETED' : l.status;
          return {
            ...l,
            outstandingBalance: finalBalance,
            status: updatedStatus as 'ACTIVE' | 'COMPLETED' | 'DEFAULTED',
          };
        }
        return l;
      })
    );

    // Register Payment Record
    const id = `PM-${String(payments.length + 1).padStart(3, '0')}`;
    const newPayment: Payment = {
      id,
      clientId: loan.clientId,
      clientName: loan.clientName,
      loanId: loan.id,
      loanNumber: loan.loanNumber,
      amount: effectivePayment,
      date,
      status: 'SUCCESS',
      branchId: loan.branchId,
      branchName: loan.branchName,
      notes: notes || 'Teller Counter Deposit',
    };

    setPayments((prev) => [newPayment, ...prev]);
    showToast(`Recorded payment of $${effectivePayment} for ${loan.clientName}.`, 'success');
    
    if (finalBalance === 0) {
      showToast(`Congratulations! Loan ${loan.loanNumber} has been fully settled!`, 'success');
      logActivity('Loan Settled', `Loan ${loan.loanNumber} closed with status COMPLETED.`, loan.branchId);
    } else {
      logActivity('Payment Audited', `Accepted counter-deposit of $${effectivePayment} towards ${loan.loanNumber}. Balance is now $${finalBalance.toLocaleString()}.`, loan.branchId);
    }
  };

  const updateLoanStatus = (loanId: string, status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED') => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status } : l))
    );
    showToast(`Loan status set to ${status}.`, 'info');
    const loan = loans.find(l => l.id === loanId);
    logActivity('Loan Status Adjusted', `Manual system override to ${status} for ${loan?.loanNumber}.`, loan?.branchId);
  };

  // Add User
  const addUser = (name: string, email: string, role: UserRole, branchId?: string) => {
    const id = `US-${String(users.length + 1).padStart(3, '0')}`;
    const branch = branches.find((b) => b.id === branchId);
    
    const newUser: User = {
      id,
      name,
      email,
      role,
      branchId,
      branchName: branch ? branch.name : undefined,
      status: 'ACTIVE',
    };

    setUsers((prev) => [...prev, newUser]);
    showToast(`Staff account for "${name}" successfully active.`, 'success');
    logActivity('Staff Enrolled', `Created ${role} login for ${name} (${email}).`, branchId);
  };

  const updateUserStatus = (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    showToast(`Staff access revoked or adjusted.`, 'info');
    logActivity('Staff Audited', `Altered state of user ${id} to ${status}.`);
  };

  return (
    <StoreContext.Provider
      value={{
        users,
        branches,
        clients,
        loans,
        payments,
        activities,
        currentUser,
        currentRole,
        loading,
        error,
        toasts,
        
        login,
        logout,
        overrideRole,
        
        addBranch,
        updateBranchStatus,
        addClient,
        updateClientStatus,
        addLoan,
        recordPayment,
        updateLoanStatus,
        addUser,
        updateUserStatus,
        
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
