"use client";

import { Trash2 } from 'lucide-react';

export default function DebugButton() {
  const clearAllData = () => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      localStorage.clear();
      alert('すべてのデータを削除しました。ページをリロードしてください。');
      window.location.reload();
    }
  };

  return (
    <button
      onClick={clearAllData}
      className="fixed bottom-6 left-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors z-40"
      title="データをリセット（デバッグ用）"
    >
      <Trash2 className="w-6 h-6" />
    </button>
  );
}