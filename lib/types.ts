export interface Customer {
  id: string;
  companyName: string;
  representative: string;
  address: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractData {
  customerId: string;
  contractType: 'advertising' | 'consulting';
  startDate: string;
  endDate?: string;
  amount?: number;
  paymentMethod?: string;
  specialNotes?: string;
  [key: string]: unknown;
}

// デバッグ用の型定義
export interface StorageDebugData {
  contractHistory: unknown[];
  contractHistoryCount: number;
  monthlyGroups: unknown[];
  monthlyGroupsCount: number;
  [key: string]: unknown;
}

// PDF生成用の型定義
export interface StyleBackup {
  element: HTMLElement;
  property: string;
  value: string;
}