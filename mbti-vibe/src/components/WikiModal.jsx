import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { MBTI_DETAILS } from '../constants';

function WikiModal({ mbti, onClose }) {
  if (!mbti) return null;

  const details = MBTI_DETAILS[mbti];

  // 如果没有该类型的详细信息，显示占位符
  if (!details) {
    return createPortal(
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white rounded-t-3xl px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{mbti}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center">该类型的详细介绍正在编写中...</p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div
        className={`bg-gradient-to-br ${details.colorClass} rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/10 backdrop-blur-sm rounded-t-3xl px-6 py-4 border-b border-white/20 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{mbti}</h2>
            <p className="text-white/80 text-sm">{details.englishName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-white space-y-6">
          {/* 标题和标签 */}
          <div>
            <h3 className="text-3xl font-bold mb-3">{details.name}</h3>
            <div className="flex flex-wrap gap-2">
              {details.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 简介 */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span>📜</span>
              <span>简介</span>
            </h4>
            <p className="text-white/90 leading-relaxed">{details.description}</p>
          </div>

          {/* 能量来源 */}
          <div className="bg-white/10 rounded-2xl p-4">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span>⚡</span>
              <span>能量来源</span>
            </h4>
            <p className="text-white/90">{details.energy}</p>
          </div>

          {/* 警告 */}
          {details.warnings && details.warnings.length > 0 && (
            <div className="bg-red-500/20 rounded-2xl p-4 border border-red-400/30">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>警告</span>
              </h4>
              <ul className="space-y-2 text-white/90">
                {details.warnings.map((warning, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 使用指南 */}
          {details.guide && details.guide.length > 0 && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <span>❤️</span>
                <span>使用指南</span>
              </h4>
              <ul className="space-y-3 text-white/90">
                {details.guide.map((item, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 经典口头禅 */}
          {details.quotes && (
            <div className="bg-white/10 rounded-2xl p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <span>💬</span>
                <span>经典口头禅</span>
              </h4>
              <p className="text-white/90 italic text-sm">{details.quotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default WikiModal;
