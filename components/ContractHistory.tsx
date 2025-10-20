"use client";

import { useState, useEffect, useCallback } from 'react';
import { ContractHistory as ContractHistoryType, MonthlyGroup, contractHistoryStorage } from '@/lib/contract-history';
import { Calendar, FileText, Download, Trash2, ChevronDown, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import { format } from 'date-fns';

interface ContractHistoryProps {
  onSelectContract?: (contract: ContractHistoryType) => void;
  customerId?: string;
}

export default function ContractHistory({ onSelectContract, customerId }: ContractHistoryProps) {
  const [monthlyGroups, setMonthlyGroups] = useState<MonthlyGroup[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const loadHistory = useCallback(() => {
    if (customerId) {
      const customerHistory = contractHistoryStorage.getByCustomer(customerId);
      // 顧客別の履歴を月ごとにグループ化
      const groups: { [key: string]: MonthlyGroup } = {};
      
      customerHistory.forEach(contract => {
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
      
      setMonthlyGroups(Object.values(groups).sort((a, b) => 
        b.yearMonth.localeCompare(a.yearMonth)
      ));
    } else {
      setMonthlyGroups(contractHistoryStorage.getGroupedByMonth(      ));
    }
  }, [customerId]);

  useEffect(() => {
    loadHistory();
    
    const handleUpdate = () => {
      loadHistory();
    };

    window.addEventListener('contract-history-updated', handleUpdate);
    return () => {
      window.removeEventListener('contract-history-updated', handleUpdate);
    };
  }, [customerId, loadHistory]);

  const toggleMonth = (yearMonth: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(yearMonth)) {
      newExpanded.delete(yearMonth);
    } else {
      newExpanded.add(yearMonth);
    }
    setExpandedMonths(newExpanded);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('この契約書履歴を削除しますか？')) {
      contractHistoryStorage.delete(id);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatMonthLabel = (year: number, month: number) => {
    return `${year}年${month}月`;
  };

  const getContractTypeLabel = (type: string) => {
    return type === 'advertising' ? '広告運用代行' : '内製化支援・コンサル';
  };

  if (monthlyGroups.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">契約書履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monthlyGroups.map((group) => (
        <div key={group.yearMonth} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => toggleMonth(group.yearMonth)}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              {expandedMonths.has(group.yearMonth) ? (
                <>
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </>
              ) : (
                <>
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                  <Folder className="w-5 h-5 text-gray-600" />
                </>
              )}
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">
                  {formatMonthLabel(group.year, group.month)}
                </span>
                <span className="text-sm text-gray-500">
                  ({group.count}件)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                合計: {formatAmount(group.totalAmount)}
              </span>
            </div>
          </button>

          {expandedMonths.has(group.yearMonth) && (
            <div className="divide-y divide-gray-100">
              {group.contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onSelectContract?.(contract)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {contract.customerName}
                        </p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          contract.contractType === 'advertising' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {getContractTypeLabel(contract.contractType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>開始日: {format(new Date(contract.startDate), 'yyyy/MM/dd')}</span>
                        <span>{formatAmount(contract.amount)}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          contract.status === 'finalized' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {contract.status === 'finalized' ? '確定' : '下書き'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // PDFダウンロード処理
                          alert('PDF機能は後で実装します');
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="PDFダウンロード"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(contract.id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}