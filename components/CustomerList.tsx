"use client";

import { Customer } from '@/lib/types';
import { Edit, Trash2, FileText } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onCreateContract: (customer: Customer) => void;
}

export default function CustomerList({ customers, onEdit, onDelete, onCreateContract }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">顧客情報がありません</p>
        <p className="text-sm text-gray-400 mt-2">新規顧客を登録してください</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">会社名</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">代表者</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 hidden md:table-cell">住所</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{customer.companyName}</p>
                  <p className="text-sm text-gray-500 sm:hidden">{customer.representative}</p>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-gray-700">
                {customer.representative}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-sm">
                {customer.address}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onCreateContract(customer)}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    title="契約書作成"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('この顧客を削除しますか？')) {
                        onDelete(customer.id);
                      }
                    }}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}