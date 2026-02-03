import { Download, Upload } from 'lucide-react';

function DataManagement({ friends, onImport }) {
  // 导出数据为 JSON 文件
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(friends, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mbti_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`成功导出 ${friends.length} 位好友的数据！`);
    } catch (error) {
      alert('导出失败：' + error.message);
    }
  };

  // 导入数据
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // 验证数据格式
        if (!Array.isArray(importedData)) {
          throw new Error('数据格式错误：应该是数组格式');
        }

        // 验证数据结构
        const isValid = importedData.every(item =>
          item.id && item.name && item.mbti && item.gender
        );

        if (!isValid) {
          throw new Error('数据格式错误：缺少必要字段（id、name、mbti、gender）');
        }

        // 询问用户是否覆盖
        const confirmed = confirm(
          `找到 ${importedData.length} 位好友的数据。\n\n` +
          `当前有 ${friends.length} 位好友。\n\n` +
          `是否要覆盖现有数据？\n` +
          `点击"确定"覆盖，点击"取消"取消导入。`
        );

        if (confirmed) {
          onImport(importedData);
          alert(`成功导入 ${importedData.length} 位好友的数据！`);
        }
      } catch (error) {
        alert('导入失败：' + error.message);
      }
    };

    reader.readAsText(file);
    // 清空 input 以便可以重复选择同一文件
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      {/* 导出按钮 */}
      <button
        onClick={handleExport}
        disabled={friends.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        title="导出数据到 JSON 文件"
      >
        <Download size={16} />
        <span>导出</span>
      </button>

      {/* 导入按钮 */}
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-700 cursor-pointer shadow-sm">
        <Upload size={16} />
        <span>导入</span>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}

export default DataManagement;
