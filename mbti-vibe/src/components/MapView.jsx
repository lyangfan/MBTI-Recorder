import { useState, useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { ChevronLeft, MapPin, Users } from 'lucide-react';
import { MBTI_AVATAR, MBTI_DETAILS } from '../constants';

// 省份代码映射（用于加载省份地图）
const PROVINCE_CODE_MAP = {
  '北京': '110000', '天津': '120000', '上海': '310000', '重庆': '500000',
  '河北': '130000', '山西': '140000', '辽宁': '210000', '吉林': '220000',
  '黑龙江': '230000', '江苏': '320000', '浙江': '330000', '安徽': '340000',
  '福建': '350000', '江西': '360000', '山东': '370000', '河南': '410000',
  '湖北': '420000', '湖南': '430000', '广东': '440000', '海南': '460000',
  '四川': '510000', '贵州': '520000', '云南': '530000', '陕西': '610000',
  '甘肃': '620000', '青海': '630000', '广西': '450000', '西藏': '540000',
  '宁夏': '640000', '新疆': '650000', '内蒙古': '150000',
  '香港': '810000', '澳门': '820000', '台湾': '710000',
};

// 省份名称映射（将我们的简称映射到地图的完整名称）
const PROVINCE_NAME_MAP = {
  '北京': '北京市',
  '天津': '天津市',
  '上海': '上海市',
  '重庆': '重庆市',
  '河北': '河北省',
  '山西': '山西省',
  '辽宁': '辽宁省',
  '吉林': '吉林省',
  '黑龙江': '黑龙江省',
  '江苏': '江苏省',
  '浙江': '浙江省',
  '安徽': '安徽省',
  '福建': '福建省',
  '江西': '江西省',
  '山东': '山东省',
  '河南': '河南省',
  '湖北': '湖北省',
  '湖南': '湖南省',
  '广东': '广东省',
  '海南': '海南省',
  '四川': '四川省',
  '贵州': '贵州省',
  '云南': '云南省',
  '陕西': '陕西省',
  '甘肃': '甘肃省',
  '青海': '青海省',
  '广西': '广西壮族自治区',
  '西藏': '西藏自治区',
  '宁夏': '宁夏回族自治区',
  '新疆': '新疆维吾尔自治区',
  '内蒙古': '内蒙古自治区',
  '香港': '香港特别行政区',
  '澳门': '澳门特别行政区',
  '台湾': '台湾省',
};

// 反向映射（完整名称到简称）
const PROVINCE_REVERSE_MAP = Object.entries(PROVINCE_NAME_MAP).reduce((acc, [short, full]) => {
  acc[full] = short;
  return acc;
}, {});

// MBTI 分组颜色
const MBTI_GROUP_COLORS = {
  '分析家': '#9333ea', // purple
  '外交家': '#22c55e', // green
  '守护者': '#3b82f6', // blue
  '探险家': '#eab308', // yellow
};

function getMBTIGroup(mbti, MBTI_GROUPS) {
  return Object.keys(MBTI_GROUPS).find(group =>
    MBTI_GROUPS[group].includes(mbti)
  ) || '守护者';
}

// 获取 MBTI 中文名称
function getMBTIName(mbti) {
  return MBTI_DETAILS[mbti]?.name || mbti;
}

function MapView({ friends = [], MBTI_GROUPS }) {
  const [mapLevel, setMapLevel] = useState('province'); // 'province' | 'city'
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0); // 用于强制刷新地图
  const chartRef = useRef(null);

  // 统计各省市的好友数据
  const locationStats = useMemo(() => {
    const stats = {};

    friends.forEach(friend => {
      const location = mapLevel === 'province' ? friend.province : friend.city;
      if (!location) return;

      const mbtiName = MBTI_DETAILS[friend.mbti]?.name || friend.mbti;

      if (!stats[location]) {
        stats[location] = {
          total: 0,
          mbtiTypes: {}, // 具体的 MBTI 类型统计
          friends: [],
        };
      }

      stats[location].total++;

      // 统计具体 MBTI 类型
      if (!stats[location].mbtiTypes[mbtiName]) {
        stats[location].mbtiTypes[mbtiName] = 0;
      }
      stats[location].mbtiTypes[mbtiName]++;

      stats[location].friends.push(friend);
    });

    return stats;
  }, [friends, mapLevel]);

  // 加载地图数据
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        let url;
        if (mapLevel === 'province') {
          url = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
        } else if (selectedProvince) {
          const code = PROVINCE_CODE_MAP[selectedProvince];
          url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // 注册地图
        echarts.registerMap(mapLevel === 'province' ? 'china' : selectedProvince, data);

        setMapData(data);
        setMapKey(prev => prev + 1);
      } catch (error) {
        console.error('加载地图数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [mapLevel, selectedProvince]);

  // 准备 ECharts 配置
  const getOption = () => {
    const data = Object.entries(locationStats).map(([name, stats]) => {
      // 将省份简称转换为地图需要的完整名称
      const mapName = mapLevel === 'province' ? (PROVINCE_NAME_MAP[name] || name) : name;
      return {
        name: mapName,
        value: stats.total,
        mbtiTypes: stats.mbtiTypes,
        friends: stats.friends,
        originalName: name, // 保存原始名称用于显示
      };
    });

    console.log('地图数据:', data); // 调试日志

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (!params.data) return params.name;

          const { name, value, mbtiTypes, originalName } = params.data;
          const displayName = originalName || name;
          const mbtiBars = Object.entries(mbtiTypes)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]) // 按人数降序排列
            .map(([type, count]) => `<span style="color: #666;">•</span> ${type}: ${count}人`)
            .join('<br/>');

          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${displayName}</div>
              <div style="font-size: 12px; color: #666;">好友总数: ${value} 人</div>
              <div style="margin-top: 4px; font-size: 11px; line-height: 1.6;">${mbtiBars}</div>
            </div>
          `;
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(d => d.value), 1),
        left: '20',
        bottom: '20',
        text: ['多', '少'],
        calculable: true,
        inRange: {
          color: ['#dbeafe', '#1d4ed8'],
        },
      },
      series: [
        {
          name: '好友分布',
          type: 'map',
          map: mapLevel === 'province' ? 'china' : selectedProvince,
          roam: true,
          scaleLimit: { min: 0.8, max: 3 },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            areaColor: '#f3f4f6',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          select: {
            itemStyle: {
              areaColor: '#fbbf24',
            },
          },
          data: data,
        },
      ],
    };
  };

  // 返回省级视图
  const handleBack = () => {
    setSelectedProvince(null);
    setMapLevel('province');
  };

  // 获取选中地区的好友详情
  const selectedLocationFriends = useMemo(() => {
    if (mapLevel === 'province') {
      // 在省级视图，不显示好友列表
      return [];
    }

    // 在市级视图，显示选中省份的所有好友
    const location = selectedProvince;
    return locationStats[location]?.friends || [];
  }, [locationStats, selectedProvince, mapLevel]);

  // 在省级视图点击后显示该省的好友
  const [previewProvince, setPreviewProvince] = useState(null);
  const previewFriends = useMemo(() => {
    if (!previewProvince) return [];
    return locationStats[previewProvince]?.friends || [];
  }, [locationStats, previewProvince]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-500" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {mapLevel === 'city' ? `${selectedProvince} - 城市分布` : '全国省份分布'}
            </h2>
            <p className="text-sm text-gray-500">
              好友地理分布 · {mapLevel === 'province' ? '点击省份查看城市' : '点击返回全国'}
            </p>
          </div>
        </div>

        {mapLevel === 'city' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">返回全国</span>
          </button>
        )}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">加载地图数据中...</p>
          </div>
        </div>
      )}

      {/* 地图 */}
      {!loading && mapData && (
        <div className="relative" style={{ height: '500px' }}>
          <ReactECharts
            ref={chartRef}
            key={mapKey}
            option={getOption()}
            onEvents={{
              click: (params) => {
                // 点击进入城市视图
                if (mapLevel === 'province' && params.data) {
                  const provinceName = PROVINCE_REVERSE_MAP[params.name] || params.name;
                  if (PROVINCE_CODE_MAP[provinceName]) {
                    setSelectedProvince(provinceName);
                    setMapLevel('city');
                    setPreviewProvince(null);
                  }
                }
              },
              mouseover: (params) => {
                // 鼠标悬停预览省份好友（仅在省级视图）
                if (mapLevel === 'province' && params.data) {
                  const provinceName = PROVINCE_REVERSE_MAP[params.name] || params.name;
                  setPreviewProvince(provinceName);
                }
              },
            }}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      )}

      {/* 省份好友预览列表（仅在省级视图且选中了省份时显示） */}
      {mapLevel === 'province' && previewProvince && previewFriends.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-500" size={20} />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{previewProvince}的好友</h3>
                <p className="text-sm text-gray-500">共 {previewFriends.length} 位</p>
              </div>
            </div>
            <button
              onClick={() => setPreviewProvince(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {previewFriends.map((friend) => {
              const group = getMBTIGroup(friend.mbti, MBTI_GROUPS);
              const colorClass = {
                '分析家': 'from-purple-500 to-purple-600',
                '外交家': 'from-green-500 to-green-600',
                '守护者': 'from-blue-500 to-blue-600',
                '探险家': 'from-yellow-400 to-yellow-500',
              }[group];

              const textColor = group === '探险家' ? 'text-gray-900' : 'text-white';
              const mbtiName = getMBTIName(friend.mbti);

              return (
                <div
                  key={friend.id}
                  className={`bg-gradient-to-br ${colorClass} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={MBTI_AVATAR[friend.mbti]}
                      alt={friend.mbti}
                      className="w-12 h-12 object-contain flex-shrink-0 bg-white/20 rounded-lg p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold ${textColor} truncate`}>{friend.name}</p>
                      <p className={`text-sm ${textColor} opacity-90`}>
                        {mbtiName} · {friend.age || '?'}岁
                      </p>
                      <p className={`text-xs ${textColor} opacity-75`}>
                        {friend.city || friend.province || '未知'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 城市视图的好友列表 */}
      {mapLevel === 'city' && selectedLocationFriends.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-green-500" size={20} />
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedProvince}的好友</h3>
              <p className="text-sm text-gray-500">共 {selectedLocationFriends.length} 位</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedLocationFriends.map((friend) => {
              const group = getMBTIGroup(friend.mbti, MBTI_GROUPS);
              const colorClass = {
                '分析家': 'from-purple-500 to-purple-600',
                '外交家': 'from-green-500 to-green-600',
                '守护者': 'from-blue-500 to-blue-600',
                '探险家': 'from-yellow-400 to-yellow-500',
              }[group];

              const textColor = group === '探险家' ? 'text-gray-900' : 'text-white';
              const mbtiName = getMBTIName(friend.mbti);

              return (
                <div
                  key={friend.id}
                  className={`bg-gradient-to-br ${colorClass} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={MBTI_AVATAR[friend.mbti]}
                      alt={friend.mbti}
                      className="w-12 h-12 object-contain flex-shrink-0 bg-white/20 rounded-lg p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold ${textColor} truncate`}>{friend.name}</p>
                      <p className={`text-sm ${textColor} opacity-90`}>
                        {mbtiName} · {friend.age || '?'}岁
                      </p>
                      <p className={`text-xs ${textColor} opacity-75`}>
                        {friend.city || friend.province || '未知'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-blue-500" size={20} />
            <span className="text-sm font-medium text-gray-600">覆盖地区</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{Object.keys(locationStats).length} 个</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-purple-500" size={20} />
            <span className="text-sm font-medium text-gray-600">总好友数</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{friends.length} 位</p>
        </div>
      </div>

      {/* MBTI 分组说明 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-700 mb-2">卡片颜色代表 MBTI 四大分组：</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(MBTI_GROUP_COLORS).map(([group, color]) => (
            <div key={group} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
              <span className="text-sm text-gray-600">{group}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapView;
