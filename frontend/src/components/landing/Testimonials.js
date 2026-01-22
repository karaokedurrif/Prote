import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui';

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    { key: 'user1', avatar: '👩‍💼' },
    { key: 'user2', avatar: '👨‍💼' },
    { key: 'user3', avatar: '👩‍✈️' }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('landing.testimonials.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(({ key, avatar }) => (
            <Card key={key} className="text-center bg-gradient-to-br from-gray-50 to-white">
              <div className="text-6xl mb-4">{avatar}</div>
              <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">
                "{t(`landing.testimonials.${key}.text`)}"
              </p>
              <div className="border-t pt-4">
                <p className="font-bold text-gray-900">
                  {t(`landing.testimonials.${key}.name`)}
                </p>
                <p className="text-sm text-gray-500">
                  {t(`landing.testimonials.${key}.role`)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
