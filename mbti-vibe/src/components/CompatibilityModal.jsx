import { createPortal } from 'react-dom';
import { X, Heart, Zap, Users } from 'lucide-react';
import { MBTI_RELATIONSHIPS, MBTI_AVATAR, MBTI_GROUPS } from '../constants';

function getMBTIGroup(mbti) {
  return Object.keys(MBTI_GROUPS).find(group =>
    MBTI_GROUPS[group].includes(mbti)
  ) || '守护者';
}

function CompatibilityModal({ mbti, friends = [], onClose }) {
  const relationship = MBTI_RELATIONSHIPS[mbti];

  if (!relationship) return null;

  const bestMatchFriends = friends.filter(f =>
    relationship.bestMatch.includes(f.mbti)
  );

  const challengingFriends = friends.filter(f =>
    relationship.challenging.includes(f.mbti)
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal 内容 */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <img
              src={MBTI_AVATAR[mbti]}
              alt={mbti}
              className="w-20 h-20 object-contain bg-white/20 rounded-xl p-2"
            />
            <div className="text-white">
              <h2 className="text-3xl font-bold">{mbti}</h2>
              <p className="text-lg opacity-90">{getMBTIGroup(mbti)}</p>
              <p className="text-sm mt-1 opacity-80">{relationship.label}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 最佳匹配 */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="text-pink-500" size={24} fill="currentColor" />
              <h3 className="text-xl font-bold text-gray-800">最佳匹配</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {relationship.bestMatch.map(type => {
                const group = getMBTIGroup(type);
                const colorClass = {
                  '分析家': 'bg-purple-500',
                  '外交家': 'bg-green-500',
                  '守护者': 'bg-blue-500',
                  '探险家': 'bg-yellow-500',
                }[group];

                return (
                  <div
                    key={type}
                    className={`${colorClass} text-white px-4 py-2 rounded-lg font-bold`}
                  >
                    {type}
                  </div>
                );
              })}
            </div>

            {bestMatchFriends.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">你的好友中有 {bestMatchFriends.length} 位最佳匹配：</p>
                <div className="space-y-2">
                  {bestMatchFriends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
                    >
                      <img
                        src={MBTI_AVATAR[friend.mbti]}
                        alt={friend.mbti}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{friend.name}</p>
                        <p className="text-sm text-gray-500">{friend.mbti}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">好友列表中暂无最佳匹配类型</p>
            )}
          </div>

          {/* 挑战性组合 */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-orange-500" size={24} fill="currentColor" />
              <h3 className="text-xl font-bold text-gray-800">挑战性组合</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {relationship.challenging.map(type => {
                const group = getMBTIGroup(type);
                const colorClass = {
                  '分析家': 'bg-purple-500',
                  '外交家': 'bg-green-500',
                  '守护者': 'bg-blue-500',
                  '探险家': 'bg-yellow-500',
                }[group];

                return (
                  <div
                    key={type}
                    className={`${colorClass} text-white px-4 py-2 rounded-lg font-bold opacity-70`}
                  >
                    {type}
                  </div>
                );
              })}
            </div>

            {challengingFriends.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">你的好友中有 {challengingFriends.length} 位挑战性组合：</p>
                <div className="space-y-2">
                  {challengingFriends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
                    >
                      <img
                        src={MBTI_AVATAR[friend.mbti]}
                        alt={friend.mbti}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{friend.name}</p>
                        <p className="text-sm text-gray-500">{friend.mbti}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 恋爱建议 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-blue-500" size={24} fill="currentColor" />
              <h3 className="text-xl font-bold text-gray-800">恋爱建议</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{relationship.advice}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CompatibilityModal;
