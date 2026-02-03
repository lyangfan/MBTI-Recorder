import { Search } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'recent', label: '最近添加' },
  { value: 'ageAsc', label: '年龄 (小→大)' },
  { value: 'ageDesc', label: '年龄 (大→小)' },
];

function SearchBar({ searchQuery, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
      <div className="flex gap-3">
        {/* 搜索输入框 */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索名字、MBTI、籍贯、学历..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* 排序下拉菜单 */}
        <div className="flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm cursor-pointer"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 搜索提示 */}
      {searchQuery && (
        <p className="mt-2 text-xs text-gray-500">
          搜索结果：匹配"{searchQuery}"的好友
        </p>
      )}
    </div>
  );
}

export default SearchBar;
