"use client";

import { Customer, ContractData } from '@/lib/types';
import { ContractTemplate } from '@/lib/template-types';
import { templateStorage } from '@/lib/template-storage';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface TemplateContractPreviewProps {
  customer: Customer;
  contractData: ContractData;
  companyInfo?: {
    name: string;
    representative: string;
    address: string;
  };
}

export default function TemplateContractPreview({ customer, contractData, companyInfo }: TemplateContractPreviewProps) {
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadedTemplate = templateStorage.getByType(contractData.contractType);
    console.log('Loading template in preview:', loadedTemplate);
    setTemplate(loadedTemplate);
  }, [contractData.contractType, refreshKey]);

  // LocalStorageの変更を監視
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, reloading template');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    // カスタムイベントも監視（同一ウィンドウ内の変更用）
    window.addEventListener('template-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('template-updated', handleStorageChange);
    };
  }, []);

  if (!template) return <div>テンプレートを読み込み中...</div>;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'yyyy年M月d日', { locale: ja });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  const contractPeriod = contractData.endDate ? 
    Math.ceil((new Date(contractData.endDate).getTime() - new Date(contractData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 3;

  // テンプレート変数を実際の値に置換
  const replaceVariables = (text: string): string => {
    return text
      .replace(/{customerName}/g, customer.companyName)
      .replace(/{companyName}/g, companyInfo?.name || '〇〇')
      .replace(/{startDate}/g, formatDate(contractData.startDate))
      .replace(/{endDate}/g, contractData.endDate ? formatDate(contractData.endDate) : `${formatDate(contractData.startDate)}から${contractPeriod}カ月後`)
      .replace(/{period}/g, contractPeriod.toString())
      .replace(/{amount}/g, formatAmount(contractData.amount || 0))
      .replace(/{customerAddress}/g, customer.address)
      .replace(/{customerRepresentative}/g, customer.representative)
      .replace(/{companyAddress}/g, companyInfo?.address || '')
      .replace(/{companyRepresentative}/g, companyInfo?.representative || '');
  };

  return (
    <div 
      id="contract-content" 
      className="bg-white p-8 max-w-4xl mx-auto" 
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000'
      }}
    >
      {/* タイトル */}
      <div className="contract-section">
        <h1 className="text-2xl font-bold text-center mb-8">{template.title}</h1>
        
        {/* 前文 */}
        <div className="mb-6 text-sm leading-relaxed">
          <p className="mb-4">{replaceVariables(template.preamble)}</p>
        </div>
      </div>

      {/* 条項 */}
      <div className="space-y-6 text-sm leading-relaxed">
        {template.sections.map((section) => (
          <section key={section.id} className="contract-section">
            <h2 className="font-bold mb-2">{section.number}（{section.title}）</h2>
            <div className="whitespace-pre-wrap">{replaceVariables(section.content)}</div>
          </section>
        ))}

        {/* 特記事項 */}
        {contractData.specialNotes && (
          <section className="contract-section bg-yellow-50 p-4 rounded-lg mt-6">
            <h2 className="font-bold mb-2">特記事項</h2>
            <p className="whitespace-pre-wrap">{contractData.specialNotes}</p>
          </section>
        )}
      </div>

      {/* 後文と署名欄 */}
      <div className="contract-section mt-12 pt-8 border-t">
        <p className="mb-8">{replaceVariables(template.conclusion)}</p>
        
        <div className="mt-8 space-y-8">
          <div>
            <p className="text-right mb-8">{formatDate(contractData.startDate)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold mb-4">【甲】</p>
              <div className="space-y-2">
                <p>住所</p>
                <p className="ml-4 border-b border-gray-300 pb-1">{customer.address}</p>
                <p className="mt-4">名前</p>
                <p className="ml-4 border-b border-gray-300 pb-1">{customer.companyName}</p>
                <p className="ml-4">{customer.representative} <span className="ml-8">印</span></p>
              </div>
            </div>
            
            <div>
              <p className="font-bold mb-4">【乙】</p>
              <div className="space-y-2">
                <p>住所</p>
                <p className="ml-4 border-b border-gray-300 pb-1">{companyInfo?.address || ''}</p>
                <p className="mt-4">名前</p>
                <p className="ml-4 border-b border-gray-300 pb-1">{companyInfo?.name || ''}</p>
                <p className="ml-4">{companyInfo?.representative || ''} <span className="ml-8">印</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}