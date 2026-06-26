// frontend/src/components/common/Footer.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗳️</span>
              <span className="text-xl font-bold">{t('app.title')}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#features" className="hover:text-white transition">
                  {t('footer.features')}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  {t('footer.howItWorks')}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  {t('footer.faq')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  {t('footer.helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-200">{t('footer.connect')}</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                🔗
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-2xl">
                ✉️
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              © 2025 {t('app.title')}. {t('footer.rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;