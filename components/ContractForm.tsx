"use client";

import { useState } from 'react';
import { Customer, ContractData } from '@/lib/types';
import { format } from 'date-fns';

interface ContractFormProps {
  customer: Customer;
  onGenerate: (data: ContractData) => void;
  onCancel: () => void;
}

export default function ContractForm({ customer, onGenerate, onCancel }: ContractFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [contractType, setContractType] = useState<'advertising' | 'consulting'>('advertising');
  const [formData, setFormData] = useState({
    startDate: today,
    endDate: '',
    amount: contractType === 'advertising' ? '70000' : '298000',
    paymentMethod: 'bank',
    specialNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contractData: ContractData = {
      customerId: customer.id,
      contractType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      amount: parseInt(formData.amount),
      paymentMethod: formData.paymentMethod,
      specialNotes: formData.specialNotes
    };
    
    onGenerate(contractData);
  };

  const handleTypeChange = (type: 'advertising' | 'consulting') => {
    setContractType(type);
    setFormData({
      ...formData,
      amount: type === 'advertising' ? '70000' : '298000'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">契約書作成</h2>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">顧客情報</p>
        <p className="font-medium text-lg">{customer.companyName}</p>
        <p className="text-gray-600">{customer.representative} 様</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            契約書タイプ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('advertising')}
              className={`p-4 rounded-lg border-2 transition-all ${
                contractType === 'advertising'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium">広告運用代行</p>
              <p className="text-sm mt-1">月額 70,000円（税抜）</p>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('consulting')}
              className={`p-4 rounded-lg border-2 transition-all ${
                contractType === 'consulting'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium">内製化支援・コンサル</p>
              <p className="text-sm mt-1">298,000円（税込）</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約終了日
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            金額（税抜）
          </label>
          <input
            type="number"
            required
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="70000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            支払方法
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="bank">銀行振込</option>
            <option value="credit">クレジットカード</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            特記事項
          </label>
          <textarea
            value={formData.specialNotes}
            onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="特別な条件や備考があれば入力してください"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            契約書を生成
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}