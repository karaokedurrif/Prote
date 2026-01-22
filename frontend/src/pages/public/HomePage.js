/**
 * Landing Page Profesional de ResqNet
 * Sistema SaaS para Protección Civil
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import Differentiators from '../../components/landing/Differentiators';
import Testimonials from '../../components/landing/Testimonials';
import CTASection from '../../components/landing/CTASection';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* What is ResqNet */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('landing.what.title')}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {t('landing.what.description')}
          </p>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Differentiators */}
      <Differentiators />

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <CTASection />
    </div>
  );
};

export default HomePage;
