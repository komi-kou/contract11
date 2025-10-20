"use client";

import { useState, useEffect } from 'react';
import { ContractTemplate, ContractSection } from '@/lib/template-types';
import { templateStorage } from '@/lib/template-storage';
import { FileEdit, Save, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'advertising' | 'consulting';
  onSave?: () => void;
}

export default function TemplateEditor({ isOpen, onClose, type, onSave }: TemplateEditorProps) {
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplate();
    }
  }, [isOpen, type]);

  const loadTemplate = () => {
    try {
      const loaded = templateStorage.getByType(type);
      console.log('Loaded template:', loaded);
      setTemplate(loaded);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSaveTemplate = () => {
    if (!template) {
      console.error('No template to save');
      return;
    }
    console.log('Saving template:', template);
    try {
      templateStorage.save(template);
      if (onSave) onSave();
      alert('テンプレートを保存しました');
      // 保存後は自動でエディターを閉じる
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('テンプレートの保存に失敗しました');
    }
  };

  const handleResetTemplate = () => {
    if (confirm('デフォルトのテンプレートに戻しますか？編集内容は失われます。')) {
      templateStorage.reset(type);
      loadTemplate();
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateSection = (sectionId: string, updates: Partial<ContractSection>) => {
    if (!template) return;
    console.log('Updating section:', sectionId, updates);
    const updatedSections = template.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    setTemplate({ ...template, sections: updatedSections });
  };

  const addSection = () => {
    if (!template) return;
    const newSection: ContractSection = {
      id: `custom-${Date.now()}`,
      title: '新しい条項',
      number: `第${template.sections.length + 1}条`,
      content: '条項の内容を入力してください',
      isEditable: true
    };
    setTemplate({
      ...template,
      sections: [...template.sections, newSection]
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!template) return;
    if (confirm('この条項を削除しますか？')) {
      const updatedSections = template.sections.filter(s => s.id !== sectionId);
      // 条項番号を振り直す
      const renumberedSections = updatedSections.map((section, index) => ({
        ...section,
        number: `第${index + 1}条`
      }));
      setTemplate({ ...template, sections: renumberedSections });
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!template) return;
    const sections = [...template.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    
    // 条項番号を振り直す
    const renumberedSections = sections.map((section, i) => ({
      ...section,
      number: `第${i + 1}条`
    }));
    
    setTemplate({ ...template, sections: renumberedSections });
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <FileEdit className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              {type === 'advertising' ? '広告運用代行' : '内製化支援・コンサル'}契約書テンプレート編集
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 基本情報 */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                契約書タイトル
              </label>
              <input
                type="text"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                前文
              </label>
              <textarea
                value={template.preamble}
                onChange={(e) => setTemplate({ ...template, preamble: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="変数: {customerName}, {companyName}"
              />
            </div>
          </div>

          {/* 条項一覧 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">条項一覧</h3>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                条項を追加
              </button>
            </div>

            {template.sections.map((section, index) => (
              <div key={section.id} className="border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="font-medium">{section.number}</span>
                    <span>{section.title}</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="上に移動"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === template.sections.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="下に移動"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedSections.has(section.id) && (
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        条項タイトル
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        条項内容
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => updateSection(section.id, { content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={8}
                        placeholder="変数: {startDate}, {endDate}, {period}, {amount}, {customerName}, {companyName}"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        利用可能な変数: {'{startDate}'}, {'{endDate}'}, {'{period}'}, {'{amount}'}, {'{customerName}'}, {'{companyName}'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 後文 */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              後文
            </label>
            <textarea
              value={template.conclusion}
              onChange={(e) => setTemplate({ ...template, conclusion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handleResetTemplate}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            デフォルトに戻す
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}