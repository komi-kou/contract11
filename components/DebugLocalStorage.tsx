"use client";

import { useEffect, useState } from 'react';
import { contractHistoryStorage } from '@/lib/contract-history';

export default function DebugLocalStorage() {
  const [storageData, setStorageData] = useState<any>(null);
  
  useEffect(() => {
    // LocalStorageからデータを取得
    const data: any = {};
    
    // 契約履歴
    const history = contractHistoryStorage.getAll();
    data.contractHistory = history;
    data.contractHistoryCount = history.length;
    
    // 月別グループ
    const groups = contractHistoryStorage.getGroupedByMonth();
    data.monthlyGroups = groups;
    data.monthlyGroupsCount = groups.length;
    
    // その他のLocalStorageデータ
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    
    setStorageData(data);
    console.log('LocalStorage Debug Data:', data);
  }, []);
  
  const addTestData = () => {
    // テスト用の契約データを追加
    const testContract = {
      id: `test-${Date.now()}`,
      customerId: 'test-customer-1',
      customerName: 'テスト株式会社',
      contractType: 'advertising' as const,
      amount: 500000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      createdAt: new Date(),
      yearMonth: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      status: 'draft' as const
    };
    
    contractHistoryStorage.save(testContract);
    location.reload();
  };
  
  return (
    <div className="fixed bottom-20 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto z-50">
      <h3 className="font-bold text-sm mb-2">LocalStorage Debug</h3>
      <div className="text-xs space-y-1">
        <div>契約履歴数: {storageData?.contractHistoryCount || 0}</div>
        <div>月別グループ数: {storageData?.monthlyGroupsCount || 0}</div>
        <button 
          onClick={addTestData}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          テストデータ追加
        </button>
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600">全データを表示</summary>
          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(storageData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}