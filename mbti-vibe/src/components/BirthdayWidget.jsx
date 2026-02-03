import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Cake, X } from 'lucide-react';
import { MBTI_AVATAR } from '../constants';

// 计算距离下一个生日还有多少天
function getDaysUntilNextBirthday(birthDate) {
  if (!birthDate) return null;

  const today = new Date();
  const birth = new Date(birthDate);

  // 今年的生日
  let thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

  // 如果今年的生日已经过了，计算明年的
  if (thisYearBirthday < today) {
    thisYearBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }

  // 计算天数差
  const diffTime = thisYearBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// 格式化生日显示（月-日）
function formatBirthdayDate(birthDate) {
  if (!birthDate) return '';
  const date = new Date(birthDate);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function BirthdayWidget({ friends = [], onCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 计算接下来 30 天内要过生日的好友
  const upcomingBirthdays = useMemo(() => {
    const birthdayList = friends.map(friend => {
      const daysUntil = getDaysUntilNextBirthday(friend.birthDate);
      const age = friend.age || 0;
      const nextAge = daysUntil !== null ? age + 1 : age;

      return {
        ...friend,
        daysUntil,
        nextAge,
        birthdayDate: formatBirthdayDate(friend.birthDate),
      };
    })
    .filter(f => f.daysUntil !== null && f.daysUntil <= 30) // 只显示 30 天内的
    .sort((a, b) => a.daysUntil - b.daysUntil); // 按天数升序排序

    return birthdayList;
  }, [friends]);

  // 如果没有要过生日的，不显示
  if (upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl shadow-lg p-5 mb-4 border border-pink-100">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-pink-500 p-2 rounded-full">
            <Cake className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">近期生日</h3>
            <p className="text-xs text-gray-500">接下来 30 天内有 {upcomingBirthdays.length} 位好友过生日</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
            title={isCollapsed ? "展开" : "收起"}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              title="隐藏"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 生日列表 */}
      {!isCollapsed && (
        <div className="space-y-3">
          {upcomingBirthdays.map((friend) => {
            const urgencyColor = friend.daysUntil <= 7 ? 'text-red-500' : 'text-orange-500';
            const urgencyBg = friend.daysUntil <= 7 ? 'bg-red-100' : 'bg-orange-100';

            return (
              <div
                key={friend.id}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 头像 */}
                <img
                  src={MBTI_AVATAR[friend.mbti]}
                  alt={friend.mbti}
                  className="w-12 h-12 object-contain flex-shrink-0"
                />

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800 truncate">{friend.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyBg} ${urgencyColor}`}>
                      {friend.daysUntil === 0 ? '今天' : friend.daysUntil === 1 ? '明天' : `${friend.daysUntil}天后`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {friend.birthdayDate} · 满 {friend.nextAge} 岁 · {friend.mbti}
                  </p>
                </div>

                {/* 蛋糕图标装饰 */}
                {friend.daysUntil <= 7 && (
                  <div className="text-2xl">🎂</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 今天生日特别提示 */}
      {!isCollapsed && upcomingBirthdays.some(f => f.daysUntil === 0) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg text-center">
          <p className="text-sm font-medium text-pink-700">
            🎉 今天有 {upcomingBirthdays.filter(f => f.daysUntil === 0).length} 位好友生日，记得送上祝福！
          </p>
        </div>
      )}
    </div>
  );
}

export default BirthdayWidget;
