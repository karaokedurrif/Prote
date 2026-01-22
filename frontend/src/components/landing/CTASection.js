import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          {t('landing.cta.title')}
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          {t('landing.cta.subtitle')}
        </p>
        <Link to="/register-trial">
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-xl px-10 py-5 text-xl"
          >
            {t('landing.cta.button')} →
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CTASection;
