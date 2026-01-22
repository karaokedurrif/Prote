import React from 'react';
import { useTranslation } from 'react-i18next';

const Differentiators = () => {
  const { t } = useTranslation();

  const items = [
    { key: 'ai', icon: '🤖', gradient: 'from-purple-500 to-pink-500' },
    { key: 'satellite', icon: '🛰️', gradient: 'from-blue-500 to-cyan-500' },
    { key: 'mesh', icon: '📡', gradient: 'from-green-500 to-emerald-500' },
    { key: 'rural', icon: '🏔️', gradient: 'from-orange-500 to-red-500' },
    { key: 'saas', icon: '☁️', gradient: 'from-indigo-500 to-blue-500' },
    { key: 'open', icon: '🔓', gradient: 'from-yellow-500 to-orange-500' }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            {t('landing.differentiators.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ key, icon, gradient }) => (
            <div 
              key={key}
              className={`bg-gradient-to-br ${gradient} p-6 rounded-xl shadow-xl hover:scale-105 transition-transform`}
            >
              <div className="text-5xl mb-3">{icon}</div>
              <p className="text-lg font-semibold">
                {t(`landing.differentiators.${key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Differentiators;
