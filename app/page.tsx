"use client";

import { useState, useEffect } from 'react';
import { Customer, ContractData } from '@/lib/types';
import { customerStorage } from '@/lib/storage';
import CustomerForm from '@/components/CustomerForm';
import CustomerList from '@/components/CustomerList';
import ContractForm from '@/components/ContractForm';
import ContractPreview from '@/components/ContractPreview';
import TemplateContractPreview from '@/components/TemplateContractPreview';
import TemplateEditor from '@/components/TemplateEditor';
import { generatePDF } from '@/lib/pdf-generator';
import CompanySettings from '@/components/CompanySettings';
import DebugButton from '@/components/DebugButton';
import DebugLocalStorage from '@/components/DebugLocalStorage';
import ContractHistory from '@/components/ContractHistory';
import { contractHistoryStorage, createContractHistory } from '@/lib/contract-history';
import { Users, FileText, Plus, Download, X, Menu, FileEdit, History, Save, FolderOpen } from 'lucide-react';

type View = 'customers' | 'add-customer' | 'edit-customer' | 'create-contract' | 'preview-contract' | 'history';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [templateType, setTemplateType] = useState<'advertising' | 'consulting'>('advertising');
  const [useTemplate, setUseTemplate] = useState(true);
  const [templateUpdateKey, setTemplateUpdateKey] = useState(0);
  const [companyInfo, setCompanyInfo] = useState({
    name: '株式会社サンプル',
    representative: '山田太郎',
    address: '東京都新宿区西新宿1-1-1'
  });

  useEffect(() => {
    loadCustomers();
    // LocalStorageから自社情報を読み込む
    const savedCompanyInfo = localStorage.getItem('company_info');
    if (savedCompanyInfo) {
      setCompanyInfo(JSON.parse(savedCompanyInfo));
    }

    // テンプレート更新イベントをリッスン
    const handleTemplateUpdate = () => {
      console.log('Template update detected in main page');
      setTemplateUpdateKey(prev => prev + 1);
    };

    window.addEventListener('template-updated', handleTemplateUpdate);

    return () => {
      window.removeEventListener('template-updated', handleTemplateUpdate);
    };
  }, []);

  const loadCustomers = () => {
    const loaded = customerStorage.getAll();
    setCustomers(loaded);
  };

  const handleSaveCustomer = (customer: Customer) => {
    customerStorage.save(customer);
    loadCustomers();
    setCurrentView('customers');
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    customerStorage.delete(id);
    loadCustomers();
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('edit-customer');
  };

  const handleCreateContract = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('create-contract');
  };

  const handleGenerateContract = (data: ContractData) => {
    setContractData(data);
    setCurrentView('preview-contract');
  };

  const handleDownloadPDF = async () => {
    if (!contractData || !selectedCustomer) return;
    
    try {
      const filename = `契約書_${selectedCustomer.companyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      await generatePDF('contract-content', filename);
    } catch (error) {
      alert('PDF生成に失敗しました');
      console.error(error);
    }
  };

  const handleSaveCompanyInfo = (info: typeof companyInfo) => {
    setCompanyInfo(info);
    localStorage.setItem('company_info', JSON.stringify(info));
  };

  const openTemplateEditor = (type: 'advertising' | 'consulting') => {
    setTemplateType(type);
    setTemplateEditorOpen(true);
  };

  const handleSaveContract = () => {
    if (!contractData || !selectedCustomer) {
      alert('契約情報が不足しています');
      return;
    }

    const history = createContractHistory(selectedCustomer, contractData);
    contractHistoryStorage.save(history);
    alert('契約書を保存しました');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">契約書作成ツール</h1>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <nav className="hidden md:flex gap-4">
              <button
                onClick={() => setCurrentView('customers')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'customers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                顧客管理
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'history' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                月別履歴
              </button>
              <button
                onClick={() => setCurrentView('add-customer')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                新規顧客
              </button>
            </nav>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-3 border-t">
              <button
                onClick={() => {
                  setCurrentView('customers');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'customers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                顧客管理
              </button>
              <button
                onClick={() => {
                  setCurrentView('history');
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 mt-2 rounded-lg transition-colors ${
                  currentView === 'history' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                月別履歴
              </button>
              <button
                onClick={() => {
                  setCurrentView('add-customer');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 mt-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                新規顧客登録
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">顧客一覧</h2>
              <CustomerList
                customers={customers}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                onCreateContract={handleCreateContract}
              />
            </div>
          </div>
        )}

        {currentView === 'add-customer' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">新規顧客登録</h2>
                <button
                  onClick={() => setCurrentView('customers')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CustomerForm
                onSubmit={handleSaveCustomer}
                onCancel={() => setCurrentView('customers')}
              />
            </div>
          </div>
        )}

        {currentView === 'edit-customer' && selectedCustomer && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">顧客情報編集</h2>
                <button
                  onClick={() => {
                    setCurrentView('customers');
                    setSelectedCustomer(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CustomerForm
                initialData={selectedCustomer}
                onSubmit={handleSaveCustomer}
                onCancel={() => {
                  setCurrentView('customers');
                  setSelectedCustomer(null);
                }}
              />
            </div>
          </div>
        )}

        {currentView === 'create-contract' && selectedCustomer && (
          <div className="max-w-3xl mx-auto">
            <ContractForm
              customer={selectedCustomer}
              onGenerate={handleGenerateContract}
              onCancel={() => {
                setCurrentView('customers');
                setSelectedCustomer(null);
              }}
            />
          </div>
        )}

        {currentView === 'preview-contract' && selectedCustomer && contractData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">契約書プレビュー</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSaveContract}
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    title="履歴に保存"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => openTemplateEditor(contractData.contractType)}
                    className="flex-1 sm:flex-none bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    title="テンプレート編集"
                  >
                    <FileEdit className="w-4 h-4" />
                    編集
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('customers');
                      setSelectedCustomer(null);
                      setContractData(null);
                    }}
                    className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    戻る
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <TemplateContractPreview
                key={templateUpdateKey}
                customer={selectedCustomer}
                contractData={contractData}
                companyInfo={companyInfo}
              />
            </div>
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <FolderOpen className="w-7 h-7 text-purple-600" />
                月別契約書履歴
              </h2>
              <ContractHistory
                onSelectContract={(contract) => {
                  // 選択された契約書を再度開く機能（将来実装）
                  console.log('Selected contract:', contract);
                  alert(`契約書: ${contract.customerName}\n開始日: ${contract.startDate}\n金額: ${contract.amount}円`);
                }}
              />
            </div>
          </div>
        )}
      </main>

      <CompanySettings
        companyInfo={companyInfo}
        onSave={handleSaveCompanyInfo}
      />

      <DebugButton />
      <DebugLocalStorage />

      <TemplateEditor
        isOpen={templateEditorOpen}
        onClose={() => setTemplateEditorOpen(false)}
        type={templateType}
        onSave={() => {
          // テンプレートが保存されたら、template-updatedイベントは
          // templateStorage.save()内で自動的に発火される
          console.log('Template saved, event dispatched');
        }}
      />
    </div>
  );
}
