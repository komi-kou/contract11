"use client";

import { useState } from 'react';
import { Customer } from '@/lib/types';
import { Plus } from 'lucide-react';

interface CustomerFormProps {
  onSubmit: (customer: Customer) => void;
  initialData?: Customer;
  onCancel?: () => void;
}

export default function CustomerForm({ onSubmit, initialData, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    representative: initialData?.representative || '',
    address: initialData?.address || '',
    email: initialData?.email || '',
    phone: initialData?.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customer: Customer = {
      id: initialData?.id || Date.now().toString(),
      ...formData,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSubmit(customer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          会社名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.companyName}
          onChange={(e) => setFormData({...formData, companyName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="株式会社サンプル"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          代表者名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.representative}
          onChange={(e) => setFormData({...formData, representative: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="山田太郎"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          住所 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="東京都新宿区..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="contact@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          電話番号
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="03-1234-5678"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {initialData ? '更新' : '登録'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}