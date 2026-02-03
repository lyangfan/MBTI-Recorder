function GroupTabs({ groups, activeGroup, onSelect, groupingDimension, onDimensionChange }) {
  return (
    <div className="mb-4">
      {/* 维度切换器 - 独立的突出控件 */}
      <div className="bg-white rounded-2xl shadow-lg mb-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">查看方式：</span>
          <div className="inline-flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-full p-1 shadow-inner">
            <button
              onClick={() => onDimensionChange('custom')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                groupingDimension === 'custom'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              按分组
            </button>
            <button
              onClick={() => onDimensionChange('gender')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                groupingDimension === 'gender'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              按性别
            </button>
          </div>
        </div>
      </div>

      {/* 分组标签横向滚动容器 */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="flex overflow-x-auto scrollbar-hide gap-2 p-3">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => onSelect(group)}
              className={`
                px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200
                ${activeGroup === group
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {group}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroupTabs;
