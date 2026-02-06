import { useState, useEffect, useMemo } from 'react';
import UserCard from './components/UserCard';
import FriendFormModal from './components/FriendFormModal';
import GroupTabs from './components/GroupTabs';
import StatsView from './components/StatsView';
import SearchBar from './components/SearchBar';
import DataManagement from './components/DataManagement';
import BirthdayWidget from './components/BirthdayWidget';
import MapView from './components/MapView';
import RelationshipGraph from './components/RelationshipGraph';
import { GENDER_OPTIONS, MBTI_TAGS, MBTI_GROUPS } from './constants';
import './App.css';

function App() {
  // 使用 useState 管理好友列表
  const [friends, setFriends] = useState([]);

  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState(null);

  // 分组和统计状态
  const [activeGroup, setActiveGroup] = useState('全部');
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  const [showBirthdayWidget, setShowBirthdayWidget] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  // 分组维度：'custom' 自定义分组 | 'gender' 性别
  const [groupingDimension, setGroupingDimension] = useState('custom');

  // 搜索和排序状态
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'ageAsc' | 'ageDesc'

  // 切换分组维度时，重置选中的分组为"全部"
  const handleDimensionChange = (newDimension) => {
    setGroupingDimension(newDimension);
    setActiveGroup('全部');
  };

  // 根据分组维度提取所有分组选项
  const groups = useMemo(() => {
    if (groupingDimension === 'custom') {
      // 自定义分组：从好友数据中提取所有 groups 数组并拍平去重
      const uniqueGroups = [...new Set(
        friends.flatMap(f => f.groups || []).filter(Boolean)
      )];
      return ['全部', ...uniqueGroups.sort()];
    } else {
      // 性别分组：使用常量中定义的 GENDER_OPTIONS
      return ['全部', ...GENDER_OPTIONS];
    }
  }, [friends, groupingDimension]);

  // 根据选中的分组和分组维度筛选好友
  const filteredFriends = useMemo(() => {
    let result = friends;

    // 1. 分组筛选
    if (activeGroup !== '全部') {
      if (groupingDimension === 'custom') {
        // 按自定义分组筛选（支持多个分组）
        result = result.filter(f => (f.groups || []).includes(activeGroup));
      } else {
        // 按性别筛选
        result = result.filter(f => f.gender === activeGroup);
      }
    }

    // 2. 搜索过滤（名字、MBTI、籍贯、学历）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => {
        const nameMatch = f.name?.toLowerCase().includes(query);
        const mbtiMatch = f.mbti?.toLowerCase().includes(query);
        const nationalityMatch = f.nationality?.toLowerCase().includes(query);
        const provinceMatch = f.province?.toLowerCase().includes(query);
        const educationMatch = f.education?.toLowerCase().includes(query);
        return nameMatch || mbtiMatch || nationalityMatch || provinceMatch || educationMatch;
      });
    }

    // 3. 排序（置顶优先）
    result = [...result].sort((a, b) => {
      // 首先按置顶状态排序（置顶的在前）
      const aPinned = a.isPinned || false;
      const bPinned = b.isPinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // 置顶状态相同时，再按其他条件排序
      if (sortBy === 'recent') {
        // 最近添加：按 createdAt 降序（新的在前）
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (sortBy === 'ageAsc') {
        // 年龄升序（小的在前）
        return (a.age || 0) - (b.age || 0);
      } else if (sortBy === 'ageDesc') {
        // 年龄降序（大的在前）
        return (b.age || 0) - (a.age || 0);
      }
      return 0;
    });

    return result;
  }, [friends, activeGroup, groupingDimension, searchQuery, sortBy]);

  // 初始化时从 localStorage 读取数据
  useEffect(() => {
    const storedFriends = localStorage.getItem('mbti-friends');
    if (storedFriends) {
      // 兼容旧数据格式
      const parsedFriends = JSON.parse(storedFriends).map(friend => {
        // 迁移 group -> groups
        const migratedFriend = {
          ...friend,
          nationality: friend.nationality || '中国',
          province: friend.province || friend.hometown || '北京',
          isPinned: friend.isPinned || false, // 确保旧数据有 isPinned 字段
        };

        // 如果有旧的 group 字段（字符串），转换为 groups 数组
        if (friend.group && !friend.groups) {
          migratedFriend.groups = [friend.group];
          delete migratedFriend.group;
        } else if (!friend.groups) {
          migratedFriend.groups = [];
        }

        return migratedFriend;
      });
      setFriends(parsedFriends);
    } else {
      // 如果没有存储的数据，使用默认演示数据
      const now = Date.now();
      const defaultFriends = [
        // 分析家组
        {
          id: '1',
          name: '小王',
          gender: '男',
          mbti: 'INTJ',
          age: 25,
          birthDate: '2000-01-15',
          nationality: '中国',
          province: '北京',
          city: '朝阳区',
          education: '本科',
          groups: ['公司'],
          avatar: '🧙‍♂️',
          tags: ['建筑师', '战略性', '独立'],
          createdAt: now - 10000000,
          isPinned: false,
        },
        {
          id: '2',
          name: '小赵',
          gender: '女',
          mbti: 'ENFP',
          age: 23,
          birthDate: '2002-03-10',
          nationality: '中国',
          province: '北京',
          city: '海淀区',
          education: '本科',
          groups: ['大学同学'],
          avatar: '🐕',
          tags: ['竞选者', '热情', '自由'],
          createdAt: now - 9000000,
          isPinned: false,
        },
        {
          id: '3',
          name: '小钱',
          gender: '女',
          mbti: 'ESFJ',
          age: 26,
          birthDate: '1999-05-18',
          nationality: '中国',
          province: '北京',
          city: '东城区',
          education: '硕士',
          groups: ['高中同学'],
          avatar: '👩‍💼',
          tags: ['执政官', '关怀', '合作'],
          createdAt: now - 8000000,
          isPinned: false,
        },

        // 外交家组
        {
          id: '4',
          name: '小李',
          gender: '女',
          mbti: 'INFJ',
          age: 24,
          birthDate: '2001-05-20',
          nationality: '中国',
          province: '上海',
          city: '浦东新区',
          education: '硕士',
          groups: ['大学同学'],
          avatar: '🧚‍♀️',
          tags: ['提倡者', '理想主义', '深刻'],
          createdAt: now - 7000000,
          isPinned: false,
        },
        {
          id: '5',
          name: '小孙',
          gender: '男',
          mbti: 'ENTP',
          age: 25,
          birthDate: '2000-08-12',
          nationality: '中国',
          province: '上海',
          city: '黄浦区',
          education: '本科',
          groups: ['公司'],
          avatar: '🎭',
          tags: ['辩论家', '创新', '挑战'],
          createdAt: now - 6000000,
          isPinned: false,
        },
        {
          id: '6',
          name: '小周',
          gender: '男',
          mbti: 'ESTP',
          age: 27,
          birthDate: '1998-11-25',
          nationality: '中国',
          province: '上海',
          city: '徐汇区',
          education: '大专',
          groups: ['高中同学'],
          avatar: '🎯',
          tags: ['企业家', '活力', '冒险'],
          createdAt: now - 5000000,
          isPinned: false,
        },

        // 守护者组
        {
          id: '7',
          name: '小张',
          gender: '男',
          mbti: 'ISTJ',
          age: 28,
          birthDate: '1997-08-10',
          nationality: '中国',
          province: '广东',
          city: '广州',
          education: '本科',
          groups: ['家人'],
          avatar: '📋',
          tags: ['物流师', '负责', '务实'],
          createdAt: now - 4000000,
          isPinned: false,
        },
        {
          id: '8',
          name: '小吴',
          gender: '女',
          mbti: 'ESFP',
          age: 22,
          birthDate: '2003-06-30',
          nationality: '中国',
          province: '广东',
          city: '深圳',
          education: '本科',
          groups: ['大学同学'],
          avatar: '🎪',
          tags: ['表演者', '娱乐', '自发'],
          createdAt: now - 3000000,
          isPinned: false,
        },
        {
          id: '9',
          name: '小郑',
          gender: '女',
          mbti: 'ENFP',
          age: 24,
          birthDate: '2001-09-15',
          nationality: '中国',
          province: '广东',
          city: '广州',
          education: '硕士',
          groups: ['公司'],
          avatar: '🌈',
          tags: ['竞选者', '热情', '自由'],
          createdAt: now - 2000000,
          isPinned: false,
        },

        // 探险家组
        {
          id: '10',
          name: '小陈',
          gender: '男',
          mbti: 'ISTP',
          age: 26,
          birthDate: '1999-03-25',
          nationality: '中国',
          province: '浙江',
          city: '杭州',
          education: '大专',
          groups: ['公司'],
          avatar: '🔧',
          tags: ['鉴赏家', '灵活', '动手'],
          createdAt: now - 1000000,
          isPinned: false,
        },
        {
          id: '11',
          name: '小冯',
          gender: '女',
          mbti: 'ESTJ',
          age: 29,
          birthDate: '1996-12-08',
          nationality: '中国',
          province: '浙江',
          city: '宁波',
          education: '本科',
          groups: ['家人'],
          avatar: '👔',
          tags: ['总经理', '高效', '组织'],
          createdAt: now - 500000,
          isPinned: false,
        },
        {
          id: '12',
          name: '小沈',
          gender: '女',
          mbti: 'INFP',
          age: 23,
          birthDate: '2002-07-22',
          nationality: '中国',
          province: '浙江',
          city: '杭州',
          education: '本科',
          groups: ['大学同学'],
          avatar: '🌸',
          tags: ['调停者', '和谐', '创意'],
          createdAt: now - 400000,
          isPinned: false,
        },

        // 添加更多测试数据
        {
          id: '13',
          name: '小韩',
          gender: '男',
          mbti: 'ISFJ',
          age: 27,
          birthDate: '1998-04-12',
          nationality: '中国',
          province: '四川',
          city: '成都',
          education: '本科',
          groups: ['高中同学'],
          avatar: '🛡️',
          tags: ['守卫者', '忠诚', '细致'],
          createdAt: now - 380000,
          isPinned: false,
        },
        {
          id: '14',
          name: '小杨',
          gender: '女',
          mbti: 'ISFP',
          age: 25,
          birthDate: '2000-10-08',
          nationality: '中国',
          province: '四川',
          city: '重庆',
          education: '硕士',
          groups: ['大学同学'],
          avatar: '🎨',
          tags: ['探险家', '艺术', '敏感'],
          createdAt: now - 360000,
          isPinned: false,
        },
        {
          id: '15',
          name: '小朱',
          gender: '男',
          mbti: 'INTP',
          age: 26,
          birthDate: '1999-02-28',
          nationality: '中国',
          province: '江苏',
          city: '南京',
          education: '博士',
          groups: ['公司'],
          avatar: '🔬',
          tags: ['逻辑学家', '分析', '好奇'],
          createdAt: now - 340000,
          isPinned: false,
        },
        {
          id: '16',
          name: '小秦',
          gender: '女',
          mbti: 'ESTP',
          age: 24,
          birthDate: '2001-06-15',
          nationality: '中国',
          province: '江苏',
          city: '苏州',
          education: '本科',
          groups: ['朋友'],
          avatar: '🏃‍♀️',
          tags: ['企业家', '活力', '冒险'],
          createdAt: now - 320000,
          isPinned: false,
        },
        {
          id: '17',
          name: '小许',
          gender: '男',
          mbti: 'ISTP',
          age: 29,
          birthDate: '1996-09-20',
          nationality: '中国',
          province: '湖北',
          city: '武汉',
          education: '大专',
          groups: ['公司'],
          avatar: '🔧',
          tags: ['鉴赏家', '灵活', '动手'],
          createdAt: now - 300000,
          isPinned: false,
        },
        {
          id: '18',
          name: '小何',
          gender: '女',
          mbti: 'ENTJ',
          age: 28,
          birthDate: '1997-11-05',
          nationality: '中国',
          province: '湖北',
          city: '武汉',
          education: '硕士',
          groups: ['大学同学'],
          avatar: '👑',
          tags: ['指挥官', '果断', '领导'],
          createdAt: now - 280000,
          isPinned: false,
        },
        {
          id: '19',
          name: '小谢',
          gender: '男',
          mbti: 'INFJ',
          age: 25,
          birthDate: '2000-03-18',
          nationality: '中国',
          province: '陕西',
          city: '西安',
          education: '本科',
          groups: ['朋友'],
          avatar: '🔮',
          tags: ['提倡者', '理想主义', '深刻'],
          createdAt: now - 260000,
          isPinned: false,
        },
        {
          id: '20',
          name: '小吕',
          gender: '女',
          mbti: 'ENFJ',
          age: 26,
          birthDate: '1999-07-30',
          nationality: '中国',
          province: '陕西',
          city: '西安',
          education: '硕士',
          groups: ['家人'],
          avatar: '🤝',
          tags: ['主人公', '魅力', '利他'],
          createdAt: now - 240000,
          isPinned: false,
        },
        {
          id: '21',
          name: '小施',
          gender: '男',
          mbti: 'ISFJ',
          age: 30,
          birthDate: '1995-05-22',
          nationality: '中国',
          province: '山东',
          city: '济南',
          education: '本科',
          groups: ['高中同学'],
          avatar: '🏠',
          tags: ['守卫者', '稳定', '照顾'],
          createdAt: now - 220000,
          isPinned: false,
        },
        {
          id: '22',
          name: '小田',
          gender: '女',
          mbti: 'ESFP',
          age: 23,
          birthDate: '2002-12-11',
          nationality: '中国',
          province: '山东',
          city: '青岛',
          education: '本科',
          groups: ['大学同学'],
          avatar: '🎭',
          tags: ['表演者', '有趣', '即时'],
          createdAt: now - 200000,
          isPinned: false,
        },
        {
          id: '23',
          name: '小孟',
          gender: '男',
          mbti: 'INFP',
          age: 27,
          birthDate: '1998-08-14',
          nationality: '中国',
          province: '福建',
          city: '厦门',
          education: '硕士',
          groups: ['朋友'],
          avatar: '🌊',
          tags: ['调停者', '诗意', '善解人意'],
          createdAt: now - 180000,
          isPinned: false,
        },
        {
          id: '24',
          name: '小贾',
          gender: '女',
          mbti: 'ESTJ',
          age: 29,
          birthDate: '1996-10-03',
          nationality: '中国',
          province: '福建',
          city: '福州',
          education: '本科',
          groups: ['公司'],
          avatar: '📊',
          tags: ['总经理', '管理', '传统'],
          createdAt: now - 160000,
          isPinned: false,
        },
        {
          id: '25',
          name: '小薛',
          gender: '男',
          mbti: 'ENTP',
          age: 24,
          birthDate: '2001-01-25',
          nationality: '中国',
          province: '天津',
          city: '天津',
          education: '本科',
          groups: ['大学同学'],
          avatar: '💡',
          tags: ['辩论家', '机智', '创新'],
          createdAt: now - 140000,
          isPinned: false,
        },
        {
          id: '26',
          name: '小雷',
          gender: '女',
          mbti: 'INTJ',
          age: 26,
          birthDate: '1999-06-08',
          nationality: '中国',
          province: '重庆',
          city: '重庆',
          education: '博士',
          groups: ['公司'],
          avatar: '🧩',
          tags: ['建筑师', '策略', '独立'],
          createdAt: now - 120000,
          isPinned: false,
        },
        {
          id: '27',
          name: '小金',
          gender: '男',
          mbti: 'ENFJ',
          age: 28,
          birthDate: '1997-09-17',
          nationality: '中国',
          province: '辽宁',
          city: '大连',
          education: '硕士',
          groups: ['家人'],
          avatar: '🌟',
          tags: ['主人公', '鼓舞', '合作'],
          createdAt: now - 100000,
          isPinned: false,
        },
        {
          id: '28',
          name: '小蔡',
          gender: '女',
          mbti: 'ISFP',
          age: 22,
          birthDate: '2003-04-05',
          nationality: '中国',
          province: '湖南',
          city: '长沙',
          education: '本科',
          groups: ['大学同学'],
          avatar: '🎭',
          tags: ['探险家', '随和', '艺术'],
          createdAt: now - 80000,
          isPinned: false,
        },
      ];
      setFriends(defaultFriends);
    }
  }, []);

  // 数据变化时自动保存到 localStorage
  useEffect(() => {
    if (friends.length > 0) {
      localStorage.setItem('mbti-friends', JSON.stringify(friends));
    }
  }, [friends]);

  // 处理编辑
  const handleEdit = (id) => {
    const friend = friends.find(f => f.id === id);
    if (friend) {
      setEditingFriend(friend);
      setIsModalOpen(true);
    }
  };

  // 处理删除（带二次确认）
  const handleDelete = (id) => {
    const friend = friends.find(f => f.id === id);
    if (!friend) return;

    const confirmed = window.confirm(`确定要删除「${friend.name}」吗？此操作不可撤销。`);
    if (confirmed) {
      setFriends(friends.filter(f => f.id !== id));
    }
  };

  // 切换置顶状态
  const handleTogglePin = (id) => {
    setFriends(friends.map(f =>
      f.id === id
        ? { ...f, isPinned: !f.isPinned }
        : f
    ));
  };

  // 打开添加好友模态框
  const handleAdd = () => {
    setEditingFriend(null);
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFriend(null);
  };

  // 提交表单（添加或编辑）
  const handleSubmit = (friendData) => {
    const newFriend = {
      ...friendData,
      tags: MBTI_TAGS[friendData.mbti] || ['未知'],
    };

    if (editingFriend) {
      // 编辑现有好友，保留原有的 createdAt
      const existingFriend = friends.find(f => f.id === editingFriend.id);
      setFriends(friends.map(f =>
        f.id === editingFriend.id
          ? { ...newFriend, createdAt: existingFriend?.createdAt || Date.now() }
          : f
      ));
    } else {
      // 添加新好友，添加 createdAt 时间戳
      setFriends([...friends, { ...newFriend, createdAt: Date.now() }]);
    }
  };

  // 导入数据
  const handleImport = (importedData) => {
    setFriends(importedData);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 transition-colors duration-300">
      <div className="max-w-md mx-auto">
        {/* 标题和数据管理按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              MBTI图谱
            </h1>
            {!showBirthdayWidget && (
              <button
                onClick={() => setShowBirthdayWidget(true)}
                className="mt-2 text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1"
              >
                🎂 查看近期生日
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DataManagement friends={friends} onImport={handleImport} />
          </div>
        </div>

        {/* 分组导航栏 */}
        <GroupTabs
          groups={groups}
          activeGroup={activeGroup}
          onSelect={setActiveGroup}
          groupingDimension={groupingDimension}
          onDimensionChange={handleDimensionChange}
        />

        {/* 搜索和排序栏 */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* 视图切换按钮 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            📋 列表
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              viewMode === 'map'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🗺️ 地图
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
              viewMode === 'graph'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            🕸️ 关系网
          </button>
        </div>

        {/* 统计面板 */}
        <div className="mb-4">
          <StatsView
            friends={filteredFriends}
            groupName={activeGroup}
            isCollapsed={isStatsCollapsed}
            onToggle={() => setIsStatsCollapsed(!isStatsCollapsed)}
          />
        </div>

        {/* 近期生日小组件 */}
        {showBirthdayWidget && (
          <BirthdayWidget
            friends={filteredFriends}
            onCollapse={() => setShowBirthdayWidget(false)}
          />
        )}

        {/* 列表或地图或网络图视图 */}
        {viewMode === 'list' ? (
          <>
            {/* 好友卡片列表 */}
            <div className="space-y-4">
              {filteredFriends.map((friend) => (
                <UserCard
                  key={friend.id}
                  id={friend.id}
                  mbti={friend.mbti}
                  name={friend.name}
                  avatar={friend.avatar}
                  tags={friend.tags}
                  gender={friend.gender}
                  groups={friend.groups || []}
                  friends={filteredFriends}
                  isPinned={friend.isPinned || false}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                  birthDate={friend.birthDate}
                  createdAt={friend.createdAt}
                />
              ))}
            </div>

            {/* 空状态提示 */}
            {filteredFriends.length === 0 && friends.length > 0 && (
              <div className="text-center py-12 text-gray-500">
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
                <p>「{activeGroup}」分组暂无成员</p>
              </div>
            )}
          </>
        ) : viewMode === 'map' ? (
          <MapView friends={filteredFriends} MBTI_GROUPS={MBTI_GROUPS} />
        ) : (
          <RelationshipGraph
            friends={filteredFriends}
            groups={groups}
            activeGroup={activeGroup}
            groupingDimension={groupingDimension}
          />
        )}
      </div>

      {/* 悬浮添加按钮 */}
      <button
        onClick={handleAdd}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title="添加好友"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* 添加/编辑好友模态框 */}
      <FriendFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        friend={editingFriend}
        friends={friends}
      />
    </div>
  );
}

export default App;
