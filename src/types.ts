/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'HQ_ADMIN' | 'BRANCH_MANAGER' | 'LOAN_OFFICER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string; // HQ Admins don't need a branch, but Managers and Officers do
  branchName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdDate: string;
}

export interface Client {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  address: string;
  branchId: string;
  branchName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdDate: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  clientId: string;
  clientName: string;
  branchId: string;
  branchName: string;
  principalAmount: number;
  interestRate: number; // in percentage, e.g., 12 for 12%
  termMonths: number;
  outstandingBalance: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  dateIssued: string;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  loanId: string;
  loanNumber: string;
  amount: number;
  date: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  branchId: string;
  branchName: string;
  notes?: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  details: string;
  branchId?: string;
}
