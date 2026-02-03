import { useState } from 'react';
import WikiModal from './WikiModal';
import { MBTI_AVATAR } from '../constants';

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

function UserCard({ id, mbti, name, avatar, tags, gender, groups = [], onEdit, onDelete }) {
  const group = getMBTIGroup(mbti);
  const colorConfig = getColorConfig(mbti, gender);
  const [isPressed, setIsPressed] = useState(false);
  const [showWiki, setShowWiki] = useState(false);

  // 分组标签显示逻辑：最多显示2个，超过的显示"+N"
  const displayGroups = groups.slice(0, 2);
  const remainingCount = groups.length - 2;

  return (
    <div
      className={`
        bg-gradient-to-br ${colorConfig.gradient}
        rounded-3xl
        p-6
        shadow-lg
        cursor-pointer
        transition-transform duration-150
        hover:shadow-xl
        ${isPressed ? 'scale-95' : 'scale-100'}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className="flex items-center gap-7">
        {/* Avatar */}
        <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden">
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
            className={`${colorConfig.text} text-3xl font-bold tracking-wider mb-2 cursor-pointer hover:underline hover:underline-offset-4 transition-all`}
            onClick={(e) => {
              e.stopPropagation();
              setShowWiki(true);
            }}
            title="点击查看详细说明"
          >
            {mbti}
          </div>

          {/* Name */}
          <div className={`${colorConfig.text} text-lg font-medium mb-1 truncate`}>
            {name}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => {
              // 根据背景深浅调整标签样式
              const isLightBg = gender === '女';
              const tagBg = isLightBg ? 'bg-black/10' : 'bg-white/20';
              const tagText = colorConfig.text;

              return (
                <span
                  key={index}
                  className={`${tagBg} ${tagText} text-xs px-2 py-1 rounded-full`}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          {/* 分组标签 */}
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {displayGroups.map((group) => {
                const isLightBg = gender === '女';
                const groupTagBg = isLightBg ? 'bg-black/15' : 'bg-white/25';
                return (
                  <span
                    key={group}
                    className={`${groupTagBg} ${colorConfig.text} text-xs px-2 py-0.5 rounded-md font-medium`}
                  >
                    {group}
                  </span>
                );
              })}
              {remainingCount > 0 && (
                <span className={`${colorConfig.text} text-xs px-2 py-0.5 rounded-md font-medium opacity-80`}>
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
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
        </div>
      </div>

      {/* WikiModal */}
      {showWiki && (
        <WikiModal
          mbti={mbti}
          onClose={() => setShowWiki(false)}
        />
      )}
    </div>
  );
}

export default UserCard;
