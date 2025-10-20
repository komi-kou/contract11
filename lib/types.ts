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
}