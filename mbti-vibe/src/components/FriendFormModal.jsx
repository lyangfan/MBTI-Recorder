import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { MBTI_AVATAR, MBTI_GROUPS, getZodiac } from '../constants';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

// MBTI 分组颜色映射
const GROUP_COLORS = {
  '分析家': {
    bg: 'bg-purple-500',
    hover: 'hover:bg-purple-600',
    text: 'text-white',
    selected: 'ring-purple-500'
  },
  '外交家': {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    text: 'text-white',
    selected: 'ring-green-500'
  },
  '守护者': {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    text: 'text-white',
    selected: 'ring-blue-500'
  },
  '探险家': {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    text: 'text-white',
    selected: 'ring-yellow-500'
  },
};

// 获取 MBTI 类型的分组
function getMBTIGroup(mbti) {
  return Object.keys(MBTI_GROUPS).find(group =>
    MBTI_GROUPS[group].includes(mbti)
  ) || '守护者';
}

const NATIONALITIES = [
  '中国',
  '美国',
  '英国',
  '日本',
  '韩国',
  '德国',
  '法国',
  '加拿大',
  '澳大利亚',
  '新加坡',
  '其他',
];

const PROVINCES = [
  '北京', '上海', '天津', '重庆',
  '河北', '山西', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '海南',
  '四川', '贵州', '云南', '陕西', '甘肃', '青海',
  '广西', '西藏', '宁夏', '新疆', '内蒙古',
  '香港', '澳门', '台湾',
];

// 计算年龄的辅助函数
function calculateAge(birthDate) {
  if (!birthDate) return '';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const EDUCATION_OPTIONS = [
  '高中',
  '大专',
  '本科',
  '硕士',
  '博士',
  '其他',
];

function FriendFormModal({ isOpen, onClose, onSubmit, friend, friends = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    mbti: 'INTJ',
    birthDate: '',
    nationality: '中国',
    province: '北京',
    education: '本科',
    groups: [],
  });

  const [newGroupInput, setNewGroupInput] = useState('');

  // 从所有好友中提取已有的分组标签（用于推荐）
  const allExistingGroups = useMemo(() => {
    const groups = new Set();
    friends.forEach(f => {
      (f.groups || []).forEach(g => groups.add(g));
    });
    return Array.from(groups).sort();
  }, [friends]);

  // 当编辑现有好友时，填充表单
  useEffect(() => {
    if (friend) {
      setFormData({
        name: friend.name || '',
        gender: friend.gender || '男',
        mbti: friend.mbti || 'INTJ',
        birthDate: friend.birthDate || '',
        nationality: friend.nationality || '中国',
        province: friend.province || '北京',
        education: friend.education || '本科',
        groups: friend.groups || [],
      });
    } else {
      // 重置表单
      setFormData({
        name: '',
        gender: '男',
        mbti: 'INTJ',
        birthDate: '',
        nationality: '中国',
        province: '北京',
        education: '本科',
        groups: [],
      });
    }
    setNewGroupInput('');
  }, [friend, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      age: calculateAge(formData.birthDate),
      id: friend?.id || Date.now().toString(),
    });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 添加新分组标签
  const handleAddGroup = () => {
    const trimmedGroup = newGroupInput.trim();
    if (trimmedGroup && !formData.groups.includes(trimmedGroup)) {
      setFormData(prev => ({
        ...prev,
        groups: [...prev.groups, trimmedGroup]
      }));
      setNewGroupInput('');
    }
  };

  // 删除分组标签
  const handleRemoveGroup = (groupToRemove) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g !== groupToRemove)
    }));
  };

  // 点击推荐标签添加
  const handleAddRecommendedGroup = (group) => {
    if (!formData.groups.includes(group)) {
      setFormData(prev => ({
        ...prev,
        groups: [...prev.groups, group]
      }));
    }
  };

  // 回车键添加标签
  const handleGroupInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGroup();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-3xl px-6 py-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {friend ? '编辑好友' : '添加好友'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 名字 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              名字 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="请输入名字"
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              性别 *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="男"
                  checked={formData.gender === '男'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">男</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="女"
                  checked={formData.gender === '女'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">女</span>
              </label>
            </div>
          </div>

          {/* MBTI - Text Button Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              MBTI 类型 * (点击文字选择)
            </label>

            {/* MBTI 文字按钮网格 */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {MBTI_TYPES.map(type => {
                const group = getMBTIGroup(type);
                const colors = GROUP_COLORS[group];
                const isSelected = formData.mbti === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange('mbti', type)}
                    className={`
                      ${colors.bg} ${colors.hover} ${colors.text}
                      px-3 py-2 rounded-lg font-bold text-sm
                      transition-all duration-200
                      ${isSelected ? `ring-2 ring-offset-2 ${colors.selected}` : 'opacity-80 hover:opacity-100'}
                    `}
                    title={group}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* 选中类型预览 */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <img
                src={MBTI_AVATAR[formData.mbti]}
                alt={formData.mbti}
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">已选择</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">{formData.mbti}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{getMBTIGroup(formData.mbti)}</p>
              </div>
            </div>
          </div>

          {/* 出生日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              出生日期 *
            </label>
            <input
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {formData.birthDate && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  年龄：<span className="font-medium text-gray-800 dark:text-white">{calculateAge(formData.birthDate)} 岁</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
                  <span>⭐</span>
                  {getZodiac(formData.birthDate)}
                </span>
              </div>
            )}
          </div>

          {/* 国籍 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              国籍 *
            </label>
            <select
              required
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800"
            >
              {NATIONALITIES.map(nation => (
                <option key={nation} value={nation}>{nation}</option>
              ))}
            </select>
          </div>

          {/* 省份（仅中国显示） */}
          {formData.nationality === '中国' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                省份 *
              </label>
              <select
                required
                value={formData.province}
                onChange={(e) => handleChange('province', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800"
              >
                {PROVINCES.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
          )}

          {/* 学历 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              学历
            </label>
            <select
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800"
            >
              {EDUCATION_OPTIONS.map(education => (
                <option key={education} value={education}>{education}</option>
              ))}
            </select>
          </div>

          {/* 分组标签管理 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              分组标签
            </label>

            {/* 已选标签显示区 */}
            {formData.groups.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.groups.map((group) => (
                  <span
                    key={group}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {group}
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(group)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 输入区 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupInput}
                onChange={(e) => setNewGroupInput(e.target.value)}
                onKeyDown={handleGroupInputKeyDown}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="输入新标签名称"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium"
              >
                添加
              </button>
            </div>

            {/* 推荐标签区 */}
            {allExistingGroups.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">推荐标签（点击添加）：</p>
                <div className="flex flex-wrap gap-2">
                  {allExistingGroups
                    .filter(g => !formData.groups.includes(g))
                    .slice(0, 10)
                    .map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => handleAddRecommendedGroup(group)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 transition"
                      >
                        + {group}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-700 transition font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg"
            >
              {friend ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FriendFormModal;
