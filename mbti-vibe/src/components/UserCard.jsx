import { useState } from 'react';
import WikiModal from './WikiModal';
import CompatibilityModal from './CompatibilityModal';
import { MBTI_AVATAR, getZodiac } from '../constants';

// MBTI 类型分组
const MBTI_GROUPS = {
  分析家: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  外交家: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  守护者: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  探险家: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
};

// 颜色配置：基于 MBTI 类型和性别
// 返回 { gradient: string, textColor: string }
function getColorConfig(mbti, gender) {
  const group = Object.keys(MBTI_GROUPS).find(g =>
    MBTI_GROUPS[g].includes(mbti)
  ) || '守护者';

  // 根据性别确定深浅
  const isMale = gender === '男';
  const isFemale = gender === '女';

  // 颜色映射表
  const colorMap = {
    分析家: {
      base: 'purple',
      male: { gradient: 'from-purple-600 to-purple-700', text: 'text-white' },
      female: { gradient: 'from-purple-300 to-purple-400', text: 'text-gray-900' },
      other: { gradient: 'from-purple-400 to-purple-600', text: 'text-white' },
    },
    外交家: {
      base: 'green',
      male: { gradient: 'from-green-600 to-green-700', text: 'text-white' },
      female: { gradient: 'from-green-300 to-green-400', text: 'text-gray-900' },
      other: { gradient: 'from-green-400 to-green-600', text: 'text-white' },
    },
    守护者: {
      base: 'blue',
      male: { gradient: 'from-blue-600 to-blue-700', text: 'text-white' },
      female: { gradient: 'from-blue-300 to-blue-400', text: 'text-gray-900' },
      other: { gradient: 'from-blue-400 to-blue-600', text: 'text-white' },
    },
    探险家: {
      base: 'yellow',
      // 黄色本身较浅，所以使用更深的色调
      male: { gradient: 'from-yellow-500 to-yellow-600', text: 'text-white' },
      female: { gradient: 'from-yellow-300 to-yellow-400', text: 'text-gray-900' },
      other: { gradient: 'from-yellow-400 to-yellow-500', text: 'text-gray-900' },
    },
  };

  const config = colorMap[group];

  if (isMale) return config.male;
  if (isFemale) return config.female;
  return config.other;
}

function getMBTIGroup(mbti) {
  return Object.keys(MBTI_GROUPS).find(group =>
    MBTI_GROUPS[group].includes(mbti)
  ) || '守护者';
}

function UserCard({ id, mbti, name, avatar, tags, gender, groups = [], friends = [], isPinned = false, onEdit, onDelete, onTogglePin, birthDate, createdAt }) {
  const group = getMBTIGroup(mbti);
  const colorConfig = getColorConfig(mbti, gender);
  const [isPressed, setIsPressed] = useState(false);
  const [showWiki, setShowWiki] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(false);

  // 计算星座
  const zodiac = getZodiac(birthDate);

  // 检查是否是新添加的好友（24小时内）
  const isNew = createdAt && (Date.now() - createdAt) < 24 * 60 * 60 * 1000;

  // 分组标签显示逻辑：最多显示2个，超过的显示"+N"
  const displayGroups = groups.slice(0, 2);
  const remainingCount = groups.length - 2;

  // 统一的标签背景样式（所有性别一致）
  const tagBg = 'bg-white/20 dark:bg-white/10';
  const groupTagBg = 'bg-white/25 dark:bg-white/15';

  // 统一的标签文字颜色（所有性别一致，使用白色带阴影确保可读性）
  const tagText = 'text-white drop-shadow-sm';

  return (
    <div
      className={`
        bg-gradient-to-br ${colorConfig.gradient}
        rounded-2xl
        p-4
        shadow-lg
        cursor-pointer
        transition-transform duration-150
        hover:shadow-xl
        ${isPressed ? 'scale-95' : 'scale-100'}
        relative
        dark:shadow-gray-900/50
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* NEW 徽章 */}
      {isNew && (
        <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
          NEW
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden">
          <img
            src={MBTI_AVATAR[mbti] || '/assets/avatars/INTJ.svg'}
            alt={mbti}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* MBTI Type */}
          <div
            className={`${colorConfig.text} text-2xl font-bold tracking-wider mb-1 cursor-pointer hover:underline hover:underline-offset-4 transition-all`}
            onClick={(e) => {
              e.stopPropagation();
              setShowWiki(true);
            }}
            title="点击查看详细说明"
          >
            {mbti}
          </div>

          {/* Name */}
          <div className={`${colorConfig.text} text-base font-medium mb-1 truncate`}>
            {name}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, index) => {
              return (
                <span
                  key={index}
                  className={`${tagBg} ${tagText} text-xs px-2 py-0.5 rounded-full`}
                >
                  {tag}
                </span>
              );
            })}

            {/* 星座标签 */}
            {zodiac && zodiac !== '未知' && (
              <span
                className={`${tagBg} ${tagText} text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5`}
              >
                <span className="text-xs">⭐</span>
                {zodiac}
              </span>
            )}
          </div>

          {/* 分组标签 */}
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {displayGroups.map((group) => {
                return (
                  <span
                    key={group}
                    className={`${groupTagBg} ${tagText} text-xs px-1.5 py-0.5 rounded-md font-medium`}
                  >
                    {group}
                  </span>
                );
              })}
              {remainingCount > 0 && (
                <span className={`${tagText} text-xs px-1.5 py-0.5 rounded-md font-medium opacity-80`}>
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className={`bg-current/10 hover:bg-current/20 ${colorConfig.text} p-2 rounded-full transition-colors`}
            title="编辑"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="bg-current/10 hover:bg-red-500/70 p-2 rounded-full transition-colors"
            style={{ color: gender === '女' ? '#991b1b' : 'white' }}
            title="删除"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Compatibility Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCompatibility(true);
            }}
            className="bg-current/10 hover:bg-pink-500/70 p-2 rounded-full transition-colors"
            style={{ color: gender === '女' ? '#be185d' : 'white' }}
            title="查看兼容性"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Pin Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(id);
            }}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isPinned
                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                : 'bg-current/10 hover:bg-yellow-400/70'
            }`}
            style={isPinned ? {} : { color: gender === '女' ? '#ca8a04' : 'white' }}
            title={isPinned ? "取消置顶" : "置顶"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill={isPinned ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 17l5-5V5H7v7l5 5z"/>
              <path d="M7 5h10"/>
            </svg>
          </button>
        </div>
      </div>

      {/* WikiModal */}
      {showWiki && (
        <WikiModal
          mbti={mbti}
          onClose={() => setShowWiki(false)}
        />
      )}

      {/* CompatibilityModal */}
      {showCompatibility && (
        <CompatibilityModal
          mbti={mbti}
          friends={friends}
          onClose={() => setShowCompatibility(false)}
        />
      )}
    </div>
  );
}

export default UserCard;
