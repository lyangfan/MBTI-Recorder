import { useState, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import html2canvas from 'html2canvas';

// MBTI 分组定义
const MBTI_GROUPS = {
  分析家: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  外交家: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  守护者: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  探险家: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
};

// 与卡片颜色系统保持一致
const GROUP_COLORS = {
  分析家: '#9333ea', // purple-600
  外交家: '#16a34a', // green-600
  守护者: '#2563eb', // blue-600
  探险家: '#ca8a04', // yellow-600
};

// ==================== 颜色映射策略 ====================

// 方案 1: 同色系方案（基于四大阵营，增强对比度）
const MBTI_TYPE_COLORS_MONOCHROMATIC = {
  // 分析家 (NT) - 紫色系：从深紫到浅紫，梯度明显
  INTJ: '#6b21a8', // purple-900 (最深)
  INTP: '#7c3aed', // purple-700
  ENTJ: '#9333ea', // purple-600
  ENTP: '#c084fc', // purple-400 (最浅)

  // 外交家 (NF) - 绿色系：从深绿到浅绿
  INFJ: '#14532d', // green-900 (最深)
  INFP: '#16a34a', // green-600
  ENFJ: '#22c55e', // green-500
  ENFP: '#86efac', // green-300 (最浅)

  // 守护者 (SJ) - 蓝色系：从深蓝到浅蓝
  ISTJ: '#1e3a8a', // blue-900 (最深)
  ISFJ: '#2563eb', // blue-600
  ESTJ: '#3b82f6', // blue-500
  ESFJ: '#93c5fd', // blue-300 (最浅)

  // 探险家 (SP) - 黄色/橙色系：从深橙到明黄
  ISTP: '#9a3412', // orange-900 (最深)
  ISFP: '#ea580c', // orange-600
  ESTP: '#f59e0b', // amber-500
  ESFP: '#fde047', // yellow-300 (最浅)
};

// 方案 2: 高对比度彩色方案（Recharts 风格，便于区分）
const MBTI_TYPE_COLORS_COLORFUL = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666',
  '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
  '#ea7ccc', '#5D9CEC', '#AC92EC', '#4FC1E9',
  '#A0D468', '#FFCE54', '#FC6E51', '#D770AD'
].reduce((acc, color, index) => {
  const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
  if (types[index]) {
    acc[types[index]] = color;
  }
  return acc;
}, {});

// 获取类型颜色的函数
function getMBTITypeColor(mbti, colorScheme = 'monochromatic') {
  if (colorScheme === 'colorful') {
    return MBTI_TYPE_COLORS_COLORFUL[mbti] || '#9ca3af';
  }
  return MBTI_TYPE_COLORS_MONOCHROMATIC[mbti] || '#9ca3af';
}

function getMBTIGroup(mbti) {
  return Object.keys(MBTI_GROUPS).find(group =>
    MBTI_GROUPS[group].includes(mbti)
  ) || '守护者';
}

function StatsView({ friends, groupName, isCollapsed, onToggle }) {
  // 视图模式：'group' 按四大阵营 | 'type' 按16种人格
  const [viewMode, setViewMode] = useState('group');
  // 颜色方案（仅在 type 模式下生效）：'monochromatic' 同色系 | 'colorful' 彩色
  const [colorScheme, setColorScheme] = useState('monochromatic');
  // 图片生成相关
  const statsRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 统计当前分组的 MBTI 分布
  const chartData = useMemo(() => {
    if (viewMode === 'group') {
      // ========== 模式 A: 按四大阵营统计 ==========
      // 统计 NT(紫), NF(绿), SJ(蓝), SP(黄) 的总数
      // Group 模式使用原有的 4 色系统，保持视觉统一
      const stats = friends.reduce((acc, friend) => {
        const group = getMBTIGroup(friend.mbti);
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});

      // 自动过滤：只显示数量 > 0 的阵营（reduce 只会统计实际存在的数据）
      return Object.entries(stats)
        .map(([name, value]) => ({
          name,
          value,
          color: GROUP_COLORS[name],
        }))
        .sort((a, b) => b.value - a.value); // 按数量降序排列
    } else {
      // ========== 模式 B: 按16种具体人格统计 ==========
      // 统计当前分组下，具体的 MBTI 类型数量（例如：INTJ: 3人, ENFP: 2人...）
      const stats = friends.reduce((acc, friend) => {
        const mbti = friend.mbti;
        acc[mbti] = (acc[mbti] || 0) + 1;
        return acc;
      }, {});

      // 自动过滤：只显示数量 > 0 的类型
      // 注意：reduce 只遍历 friends 中实际存在的朋友，所以 stats 中不会包含数量为 0 的类型
      // 这样可以避免图表出现大量空的切片
      return Object.entries(stats)
        .map(([name, value]) => ({
          name,
          value,
          // 根据颜色方案获取颜色：
          // - monochromatic: 同色系方案（NT紫/NF绿/SJ蓝/SP黄）
          // - colorful: 高对比度彩色方案
          color: getMBTITypeColor(name, colorScheme),
        }))
        .sort((a, b) => b.value - a.value); // 按数量降序排列
    }
  }, [friends, viewMode, colorScheme]);

  const totalCount = friends.length;

  // 生成分享图片
  const handleGenerateImage = async () => {
    if (!statsRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      // 等待图表完全渲染
      await new Promise(resolve => setTimeout(resolve, 500));

      // 检测当前是否为深色模式
      const isDarkMode = document.documentElement.classList.contains('dark');

      // 查找SVG元素
      const svgElement = statsRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error('未找到图表');
      }

      // 获取SVG的实际尺寸
      const svgRect = svgElement.getBoundingClientRect();
      const width = Math.max(svgRect.width, 600);
      const height = Math.max(svgRect.height, 400);

      // 序列化SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // 添加命名空间
      if (!svgString.includes('xmlns')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // 创建SVG Data URL（直接用dataURL，避免Blob兼容性问题）
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

      // 创建Canvas
      const canvas = document.createElement('canvas');
      const scale = 2;
      const extraHeight = 150; // 额外空间给图例和水印
      canvas.width = width * scale;
      canvas.height = (height + extraHeight) * scale;
      const ctx = canvas.getContext('2d');

      // 填充背景
      ctx.fillStyle = isDarkMode ? '#1f2937' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 加载并绘制SVG
      await new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          try {
            // 绘制SVG（居中）
            const svgWidth = svgRect.width || width;
            const svgHeight = svgRect.height || height;
            const x = ((width * scale) - (svgWidth * scale)) / 2;
            const y = 20 * scale;

            ctx.drawImage(img, x, y, svgWidth * scale, svgHeight * scale);
            resolve();
          } catch (e) {
            console.error('绘制SVG失败:', e);
            reject(e);
          }
        };

        img.onerror = (e) => {
          console.error('图片加载失败:', e);
          reject(new Error('图片加载失败'));
        };

        // 设置crossOrigin以避免跨域问题
        img.crossOrigin = 'anonymous';
        img.src = svgDataUrl;
      });

      // 绘制总人数（使用scale调整坐标）
      ctx.scale(scale, scale);
      const totalCountY = height + 40;
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText(`${totalCount}人`, width / 2, totalCountY);
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = isDarkMode ? '#9ca3af' : '#6b7280';
      ctx.fillText('总人数', width / 2, totalCountY + 20);

      // 绘制图例
      const legendY = totalCountY + 50;
      const legendItemWidth = 110;

      ctx.font = '12px Arial, sans-serif';

      chartData.forEach((item, index) => {
        const xPos = 20 + (index % 5) * legendItemWidth;
        const yPos = legendY + Math.floor(index / 5) * 25;

        if (yPos < height + extraHeight - 10) {
          // 绘制颜色点
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(xPos, yPos, 4, 0, 2 * Math.PI);
          ctx.fill();

          // 绘制文字
          ctx.fillStyle = isDarkMode ? '#e5e7eb' : '#374151';
          ctx.textAlign = 'left';
          ctx.fillText(`${item.name} ${item.value}人`, xPos + 10, yPos + 4);
        }
      });

      // 添加水印
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('MBTI图谱 - 社交分享', width / 2, height + extraHeight - 10);

      // 转换为图片并下载
      try {
        const dataUrl = canvas.toDataURL('image/png');

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `mbti-stats-${groupName}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

        setIsCapturing(false);
      } catch (e) {
        console.error('转换为图片失败:', e);
        throw new Error('生成图片失败');
      }
    } catch (error) {
      console.error('生成图片失败:', error);
      setIsCapturing(false);
      alert('生成图片失败：' + error.message);
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow flex items-center justify-center gap-2 text-gray-700 font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        查看统计
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          {groupName === '全部' ? '全部统计' : `${groupName} - 统计`}
        </h3>
        <div className="flex items-center gap-2">
          {/* 生成图片按钮 */}
          <button
            onClick={handleGenerateImage}
            disabled={isCapturing || totalCount === 0}
            className={`p-2 rounded-full transition-all ${
              isCapturing || totalCount === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isCapturing ? '生成中...' : '生成分享图片'}
          >
            {isCapturing ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 animate-spin"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="收起"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* View Mode Toggle - Segmented Control */}
      <div className="mb-4">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('group')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'group'
                ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            按四大阵营
          </button>
          <button
            onClick={() => setViewMode('type')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'type'
                ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            按具体人格
          </button>
        </div>
      </div>

      {/* Color Scheme Toggle - 仅在 Type 模式下显示 */}
      {viewMode === 'type' && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">配色方案：</span>
            <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setColorScheme('monochromatic')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  colorScheme === 'monochromatic'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                同色系
              </button>
              <button
                onClick={() => setColorScheme('colorful')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  colorScheme === 'colorful'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                彩色
              </button>
            </div>
          </div>
          {/* 颜色预览提示 */}
          <div className="mt-2 text-xs text-gray-500">
            {colorScheme === 'monochromatic'
              ? '同色系：NT(紫) NF(绿) SJ(蓝) SP(黄)，便于快速识别阵营归属'
              : '彩色：高对比度配色，便于区分各种类型'}
          </div>
        </div>
      )}

      {totalCount === 0 ? (
        <div className="text-center py-8 text-gray-500">
          该分组暂无数据
        </div>
      ) : (
        <div ref={statsRef} className="space-y-4">
          {/* 饼状图 - 居中 */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={viewMode === 'type' ? 1 : 2}
                  dataKey="value"
                  label={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const percentage = ((value / totalCount) * 100).toFixed(1);
                    return [`${value}人 (${percentage}%)`, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    padding: '8px 12px',
                    fontSize: '14px',
                  }}
                  itemStyle={{
                    color: '#1f2937',
                    fontWeight: '500',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 总人数和图例 - 横向排列 */}
          <div className="border-t border-gray-200 pt-4">
            {/* 总人数 - 紧凑卡片 */}
            <div className="flex justify-center mb-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl min-w-[100px]">
                <div className="text-3xl font-bold text-gray-800 dark:text-white">{totalCount}</div>
                <div className="text-xs text-gray-500">总人数</div>
                {viewMode === 'type' && chartData.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {chartData.length} 种类型
                  </div>
                )}
              </div>
            </div>

            {/* 图例 - 居中显示 */}
            <div className={`flex flex-wrap justify-center gap-2 ${viewMode === 'type' ? 'max-h-[180px] overflow-y-auto pr-2' : ''}`}>
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-700 font-medium">{item.name}</span>
                  <span className="text-xs font-bold text-gray-900 ml-1">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsView;
