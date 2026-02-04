import { useMemo, useState, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { MBTI_AVATAR, MBTI_RELATIONSHIPS } from '../constants';

function RelationshipGraph({ friends = [], groups = [], activeGroup = '全部' }) {
  // 本地分组筛选状态
  const [selectedGroup, setSelectedGroup] = useState('全部');

  // 当外部 activeGroup 变化时，同步到本地 selectedGroup
  useEffect(() => {
    setSelectedGroup(activeGroup);
  }, [activeGroup]);

  // 截图相关
  const chartRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // 根据选中的分组过滤好友
  const filteredFriends = useMemo(() => {
    if (selectedGroup === '全部') {
      return friends;
    }
    return friends.filter(f => (f.groups || []).includes(selectedGroup));
  }, [friends, selectedGroup]);

  // 构建关系网络数据
  const { nodes, links } = useMemo(() => {
    // 创建节点
    const nodes = filteredFriends.map((friend, index) => ({
      id: friend.id,
      name: friend.name,
      value: friend.mbti,
      symbolSize: 60,
      symbol: `image://${MBTI_AVATAR[friend.mbti]}`,
      category: friend.mbti,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10,
      },
      label: {
        show: true,
        position: 'bottom',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        formatter: friend.name,
      },
    }));

    // 创建边(基于MBTI兼容性)
    const links = [];
    const linkSet = new Set(); // 避免重复边

    for (let i = 0; i < filteredFriends.length; i++) {
      for (let j = i + 1; j < filteredFriends.length; j++) {
        const friendA = filteredFriends[i];
        const friendB = filteredFriends[j];
        const linkKey = `${friendA.id}-${friendB.id}`;

        // 检查A的好友是否在B的bestMatch中
        const relationshipA = MBTI_RELATIONSHIPS[friendA.mbti];
        const relationshipB = MBTI_RELATIONSHIPS[friendB.mbti];

        let linkType = null;
        let label = '';

        // 检查最佳匹配
        if (
          relationshipA &&
          relationshipA.bestMatch &&
          relationshipA.bestMatch.includes(friendB.mbti)
        ) {
          linkType = 'bestMatch';
          label = '最佳匹配';
        } else if (
          relationshipB &&
          relationshipB.bestMatch &&
          relationshipB.bestMatch.includes(friendA.mbti)
        ) {
          linkType = 'bestMatch';
          label = '最佳匹配';
        }

        // 检查挑战性组合
        if (!linkType) {
          if (
            relationshipA &&
            relationshipA.challenging &&
            relationshipA.challenging.includes(friendB.mbti)
          ) {
            linkType = 'challenging';
            label = '需要磨合';
          } else if (
            relationshipB &&
            relationshipB.challenging &&
            relationshipB.challenging.includes(friendA.mbti)
          ) {
            linkType = 'challenging';
            label = '需要磨合';
          }
        }

        // 如果有关系则添加边
        if (linkType && !linkSet.has(linkKey)) {
          linkSet.add(linkKey);

          const isBestMatch = linkType === 'bestMatch';

          links.push({
            source: friendA.id,
            target: friendB.id,
            label: {
              show: false,
              formatter: label,
            },
            lineStyle: {
              color: isBestMatch ? '#ef4444' : '#94a3b8',
              width: isBestMatch ? 3 : 2,
              type: isBestMatch ? 'solid' : 'dashed',
              curveness: 0.2,
              opacity: 0.6,
            },
            emphasis: {
              lineStyle: {
                width: isBestMatch ? 4 : 3,
                opacity: 1,
              },
              label: {
                show: true,
                fontSize: 11,
                fontWeight: 'bold',
                color: isBestMatch ? '#ef4444' : '#64748b',
              },
            },
          });
        }
      }
    }

    return { nodes, links };
  }, [filteredFriends]);

  // 生成截图
  const handleGenerateImage = () => {
    if (!chartRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      // 获取 ECharts 实例
      const echartsInstance = chartRef.current.getEchartsInstance();

      // 在截图前重置视图，确保所有节点都在可见区域内
      echartsInstance.dispatchAction({
        type: 'restore',
      });

      // 等待一小段时间让视图更新完成
      setTimeout(() => {
        // 使用 ECharts 内置的 getDataURL 方法
        const url = echartsInstance.getDataURL({
          type: 'png',
          pixelRatio: 2, // 提高清晰度
          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        });

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `mbti-relationship-${selectedGroup}-${Date.now()}.png`;
        link.href = url;
        link.click();

        setIsCapturing(false);
      }, 300);
    } catch (error) {
      console.error('生成图片失败:', error);
      setIsCapturing(false);
      alert('生成图片失败，请重试');
    }
  };

  // ECharts配置
  const getOption = () => ({
    title: {
      text: `好友关系网络图 (${filteredFriends.length}人)${selectedGroup !== '全部' ? ` · ${selectedGroup}` : ''}`,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
      },
    },

    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.dataType === 'node') {
          const friend = filteredFriends.find(f => f.id === params.data.id);
          if (!friend) return params.name;

          const relationship = MBTI_RELATIONSHIPS[friend.mbti];
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${friend.name}</div>
              <div style="font-size: 12px; color: #666;">
                MBTI: ${friend.mbti}<br/>
                年龄: ${friend.age || '?'}岁<br/>
                地点: ${friend.province || '未知'}${friend.city ? ' · ' + friend.city : ''}
              </div>
              ${relationship ? `
                <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
                  <div style="font-size: 11px; color: #ef4444; font-weight: bold;">
                    ❤️ 最佳匹配: ${relationship.bestMatch.join(', ')}
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        } else if (params.dataType === 'edge') {
          const source = filteredFriends.find(f => f.id === params.data.source);
          const target = filteredFriends.find(f => f.id === params.data.target);
          return `
            <div style="padding: 6px; font-size: 12px;">
              ${source?.name || '?'} ↔ ${target?.name || '?'}<br/>
              <span style="color: #ef4444;">${params.data.label.formatter}</span>
            </div>
          `;
        }
        return '';
      },
    },

    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        roam: true,
        label: {
          show: true,
          position: 'bottom',
          fontSize: 12,
        },
        labelLayout: {
          hideOverlap: true,
        },
        force: {
          repulsion: filteredFriends.length > 20 ? 300 : 400, // 增加排斥力，让节点更分散
          edgeLength: [100, 200], // 增加边的长度范围
          gravity: 0.2, // 增加重力，让节点更紧凑地聚拢
          friction: 0.6, // 增加摩擦力，让节点更快停止运动
          layoutAnimation: true,
        },
        // 去掉箭头，因为 MBTI 关系是双向的
        edgeSymbol: ['none', 'none'],
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4,
          },
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3,
        },
      },
    ],
  });

  if (filteredFriends.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p>
            {selectedGroup === '全部'
              ? '还没有好友数据，无法生成关系网络图'
              : `「${selectedGroup}」分组暂无成员`}
          </p>
        </div>
      </div>
    );
  }

  if (nodes.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>
            {selectedGroup === '全部'
              ? '至少需要 2 位好友才能生成关系网络图'
              : `「${selectedGroup}」分组至少需要 2 位好友才能生成关系网络图`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* 标题栏 */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">🕸️ 好友关系网络图</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            基于 MBTI 兼容性的人际关系可视化 · 鼠标滚轮缩放 · 拖拽节点调整
          </p>
        </div>
        {/* 截图按钮 */}
        <button
          onClick={handleGenerateImage}
          disabled={isCapturing}
          className={`p-2 rounded-full transition-all ${
            isCapturing
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
      </div>

      {/* 分组筛选器 */}
      {groups.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex-shrink-0">分组筛选：</span>
            {groups.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedGroup === group
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {group === '全部' ? `全部 (${friends.length}人)` : `${group} (${friends.filter(f => (f.groups || []).includes(group)).length}人)`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 图例说明 */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">连线说明：</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-300">实线 = 最佳匹配</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-slate-400" style={{ borderStyle: 'dashed' }}></div>
            <span className="text-gray-600 dark:text-gray-300">虚线 = 需要磨合</span>
          </div>
        </div>
      </div>

      {/* ECharts 图表 */}
      <div className="relative" style={{ height: '600px' }}>
        <ReactECharts
          ref={chartRef}
          option={getOption()}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          onEvents={{
            'finished': () => {
              // 图表渲染完成后，停止力导向布局动画
              if (chartRef.current) {
                const echartsInstance = chartRef.current.getEchartsInstance();
                echartsInstance.dispatchAction({
                  type: 'stopLayout'
                });
              }
            }
          }}
        />
      </div>

      {/* 统计信息 */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{nodes.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">节点数</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {links.filter(l => l.lineStyle.type === 'solid').length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300">最佳匹配</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {links.filter(l => l.lineStyle.type === 'dashed').length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300">挑战性组合</p>
        </div>
      </div>
    </div>
  );
}

export default RelationshipGraph;
