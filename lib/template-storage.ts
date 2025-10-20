"use client";

import { ContractTemplate, defaultSections, commonSections } from './template-types';

const TEMPLATES_KEY = 'contract_templates';

export const templateStorage = {
  getAll: (): ContractTemplate[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(TEMPLATES_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Date型を復元
        return parsed.map((t: unknown) => {
          const template = t as Record<string, unknown>;
          return {
            ...template,
            createdAt: new Date(template.createdAt as string),
            updatedAt: new Date(template.updatedAt as string)
          } as ContractTemplate;
        });
      } catch (error) {
        console.error('Error parsing templates:', error);
        return [
          createDefaultTemplate('advertising'),
          createDefaultTemplate('consulting')
        ];
      }
    }
    // デフォルトテンプレートを返す
    return [
      createDefaultTemplate('advertising'),
      createDefaultTemplate('consulting')
    ];
  },

  getById: (id: string): ContractTemplate | undefined => {
    const templates = templateStorage.getAll();
    return templates.find(t => t.id === id);
  },

  getByType: (type: 'advertising' | 'consulting'): ContractTemplate => {
    const templates = templateStorage.getAll();
    console.log('All templates:', templates);
    const template = templates.find(t => t.type === type);
    console.log(`Getting template for type ${type}:`, template);
    return template || createDefaultTemplate(type);
  },

  save: (template: ContractTemplate): void => {
    const templates = templateStorage.getAll();
    // IDまたはタイプで既存のテンプレートを探す
    const index = templates.findIndex(t => 
      t.id === template.id || t.type === template.type
    );
    
    const templateToSave = {
      ...template,
      createdAt: template.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    console.log('Saving template:', templateToSave);
    console.log('Found at index:', index);
    
    if (index >= 0) {
      // 既存のテンプレートを更新（IDを保持）
      templates[index] = {
        ...templateToSave,
        id: templates[index].id // 既存のIDを保持
      };
    } else {
      templates.push(templateToSave);
    }
    
    // Date型を文字列に変換してから保存
    const templatesWithStringDates = templates.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }));
    
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templatesWithStringDates));
    console.log('Templates saved to localStorage:', templatesWithStringDates);
    
    // カスタムイベントを発火して変更を通知
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('template-updated'));
    }
  },

  delete: (id: string): void => {
    const templates = templateStorage.getAll();
    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  },

  reset: (type: 'advertising' | 'consulting'): void => {
    const templates = templateStorage.getAll();
    const filtered = templates.filter(t => t.type !== type);
    const newTemplate = createDefaultTemplate(type);
    filtered.push(newTemplate);
    
    // Date型を文字列に変換してから保存
    const templatesWithStringDates = filtered.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }));
    
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templatesWithStringDates));
    
    // カスタムイベントを発火して変更を通知
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('template-updated'));
    }
  }
};

function createDefaultTemplate(type: 'advertising' | 'consulting'): ContractTemplate {
  const typeSections = defaultSections[type];
  const allSections = [...typeSections, ...commonSections];
  
  return {
    id: `default-${type}-${Date.now()}`,
    name: type === 'advertising' ? '広告運用代行契約書' : '内製化支援・コンサル契約書',
    type,
    title: '業務委託契約書',
    preamble: '{customerName}（以下「甲」という。）と{companyName}（以下「乙」という。）とは、次の通り業務委託契約（以下「本契約」という。）を締結する。',
    sections: allSections,
    conclusion: '本契約締結の証として本契約書２通を作成し、甲乙双方が各自署名又は記名押印の上、それぞれ１通を保有する。',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}