import { useState, useEffect, useMemo } from 'react';
import UserCard from './components/UserCard';
import FriendFormModal from './components/FriendFormModal';
import GroupTabs from './components/GroupTabs';
import StatsView from './components/StatsView';
import SearchBar from './components/SearchBar';
import DataManagement from './components/DataManagement';
import { GENDER_OPTIONS, MBTI_TAGS } from './constants';
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
        {
          id: '1',
          name: '小王',
          gender: '男',
          mbti: 'INTJ',
          age: 25,
          birthDate: '2000-01-15',
          nationality: '中国',
          province: '北京',
          education: '本科',
          groups: ['公司'],
          avatar: '🧙‍♂️',
          tags: ['建筑师', '战略性', '独立'],
          createdAt: now - 10000000, // 较早添加
          isPinned: false,
        },
        {
          id: '2',
          name: '小李',
          gender: '女',
          mbti: 'INFJ',
          age: 24,
          birthDate: '2001-05-20',
          nationality: '中国',
          province: '上海',
          education: '硕士',
          groups: ['大学同学'],
          avatar: '🧚‍♀️',
          tags: ['提倡者', '理想主义', '深刻'],
          createdAt: now - 5000000, // 中间添加
          isPinned: false,
        },
        {
          id: '3',
          name: '小张',
          gender: '男',
          mbti: 'ISTJ',
          age: 28,
          birthDate: '1997-08-10',
          nationality: '中国',
          province: '广东',
          education: '本科',
          groups: ['家人'],
          avatar: '📋',
          tags: ['物流师', '负责', '务实'],
          createdAt: now - 3000000, // 较晚添加
          isPinned: false,
        },
        {
          id: '4',
          name: '小陈',
          gender: '男',
          mbti: 'ISTP',
          age: 26,
          birthDate: '1999-03-25',
          nationality: '中国',
          province: '浙江',
          education: '大专',
          groups: ['公司'],
          avatar: '🔧',
          tags: ['鉴赏家', '灵活', '动手'],
          createdAt: now - 1000000, // 最新添加
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
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* 标题和数据管理按钮 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            MBTI 人格卡片
          </h1>
          <DataManagement friends={friends} onImport={handleImport} />
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

        {/* 统计面板 */}
        <div className="mb-4">
          <StatsView
            friends={filteredFriends}
            groupName={activeGroup}
            isCollapsed={isStatsCollapsed}
            onToggle={() => setIsStatsCollapsed(!isStatsCollapsed)}
          />
        </div>

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
