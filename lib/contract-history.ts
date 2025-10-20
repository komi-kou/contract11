export interface ContractHistory {
  id: string;
  customerId: string;
  customerName: string;
  contractType: 'advertising' | 'consulting';
  amount: number;
  startDate: string;
  endDate?: string;
  createdAt: Date;
  yearMonth: string; // YYYY-MM format for grouping
  pdfData?: string; // Base64 encoded PDF data (optional)
  status: 'draft' | 'finalized';
}

export interface MonthlyGroup {
  yearMonth: string;
  year: number;
  month: number;
  contracts: ContractHistory[];
  totalAmount: number;
  count: number;
}

const HISTORY_KEY = 'contract_history';

export const contractHistoryStorage = {
  getAll: (): ContractHistory[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return parsed.map((item: unknown) => {
          const contract = item as Record<string, unknown>;
          return {
            ...contract,
            createdAt: new Date(contract.createdAt as string)
          } as ContractHistory;
        });
      } catch (error) {
        console.error('Error parsing contract history:', error);
        return [];
      }
    }
    return [];
  },

  save: (history: ContractHistory): void => {
    const histories = contractHistoryStorage.getAll();
    const index = histories.findIndex(h => h.id === history.id);
    
    if (index >= 0) {
      histories[index] = history;
    } else {
      histories.push(history);
    }
    
    const dataToSave = histories.map(h => ({
      ...h,
      createdAt: h.createdAt.toISOString()
    }));
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dataToSave));
    
    // イベントを発火
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('contract-history-updated'));
    }
  },

  delete: (id: string): void => {
    const histories = contractHistoryStorage.getAll();
    const filtered = histories.filter(h => h.id !== id);
    
    const dataToSave = filtered.map(h => ({
      ...h,
      createdAt: h.createdAt.toISOString()
    }));
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dataToSave));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('contract-history-updated'));
    }
  },

  getByMonth: (yearMonth: string): ContractHistory[] => {
    const all = contractHistoryStorage.getAll();
    return all.filter(h => h.yearMonth === yearMonth);
  },

  getByCustomer: (customerId: string): ContractHistory[] => {
    const all = contractHistoryStorage.getAll();
    return all.filter(h => h.customerId === customerId);
  },

  getGroupedByMonth: (): MonthlyGroup[] => {
    const all = contractHistoryStorage.getAll();
    const groups: { [key: string]: MonthlyGroup } = {};
    
    all.forEach(contract => {
      if (!groups[contract.yearMonth]) {
        const [year, month] = contract.yearMonth.split('-').map(Number);
        groups[contract.yearMonth] = {
          yearMonth: contract.yearMonth,
          year,
          month,
          contracts: [],
          totalAmount: 0,
          count: 0
        };
      }
      
      groups[contract.yearMonth].contracts.push(contract);
      groups[contract.yearMonth].totalAmount += contract.amount;
      groups[contract.yearMonth].count += 1;
    });
    
    // 新しい月順にソート
    return Object.values(groups).sort((a, b) => 
      b.yearMonth.localeCompare(a.yearMonth)
    );
  }
};

export function createContractHistory(
  customer: { id: string; companyName: string },
  contractData: Record<string, unknown>
): ContractHistory {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    id: `contract-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.companyName,
    contractType: contractData.contractType as 'advertising' | 'consulting',
    amount: (contractData.amount as number) || 0,
    startDate: contractData.startDate as string,
    endDate: contractData.endDate as string | undefined,
    createdAt: now,
    yearMonth,
    status: 'draft'
  };
}