// HeroSection_v1_bg.jsx — Background image version
// Drop-in replacement. Keeps all your imports, context hooks, and i18n keys.

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';

import backgroundImage from '../../assets/images/bck3.jpg';

const STAGGER = 0.12;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stats = [
  { value: '7.5M+', labelKey: 'hero.statsNRN' },
  { value: '112', labelKey: 'hero.statsCountries' },
  { value: '100%', labelKey: 'hero.statsTransparent' },
];

// Thin animated line accent
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent pointer-events-none"
    initial={{ top: '20%', opacity: 0 }}
    animate={{ top: ['20%', '80%', '20%'], opacity: [0, 0.7, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
  />
);

const HeroSection = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isConnected, connectWallet } = useWeb3();

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Layered overlays — cinematic grade */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

      {/* Subtle blue chromatic accent — left bleed */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-60" />

      {/* Scan line ambient animation */}
      <ScanLine />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Top gradient to blend with navbar */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-20 w-full max-w-screen-xl mx-auto px-6 md:px-12 lg:px-20 pt-28 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div variants={item} className="mb-6">
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] uppercase text-blue-300/90">
              <span className="w-5 h-px bg-blue-400" />
              {t('hero.badge')}
              <span className="w-5 h-px bg-blue-400" />
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-black leading-[0.92] tracking-tight text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
          >
            {t('hero.title')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {t('hero.titleHighlight')}
            </span>
            <span className="block text-white/75 font-light mt-1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
              {t('hero.subtitle')}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={item}
            className="mt-7 text-base lg:text-lg text-white/60 leading-relaxed max-w-xl"
          >
            {t('hero.description')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            {!isAuthenticated ? (
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors overflow-hidden group"
                >
                  <span className="relative z-10">{t('hero.cta')}</span>
                  <motion.span
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {t('hero.ctaDashboard')}
                </motion.button>
              </Link>
            )}

            {!isConnected && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={connectWallet}
                className="flex items-center gap-2 px-7 py-3.5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white text-sm font-medium rounded-xl transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('hero.ctaWallet')}
              </motion.button>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div variants={item} className="mt-14 flex items-center gap-0">
            {stats.map((stat, idx) => (
              <React.Fragment key={idx}>
                <div className="text-center px-6 first:pl-0">
                  <p className="text-3xl font-black text-white tabular-nums">{stat.value}</p>
                  <p className="text-xs text-white/45 mt-1 uppercase tracking-widest">{t(stat.labelKey)}</p>
                </div>
                {idx < stats.length - 1 && (
                  <div className="h-8 w-px bg-white/15" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade to section below */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Corner bracket decoration — subtle civic motif */}
      <div className="absolute top-32 right-10 hidden lg:block opacity-20 pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M0 20 L0 0 L20 0" stroke="white" strokeWidth="1.5" />
          <path d="M60 0 L80 0 L80 20" stroke="white" strokeWidth="1.5" />
          <path d="M80 60 L80 80 L60 80" stroke="white" strokeWidth="1.5" />
          <path d="M20 80 L0 80 L0 60" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-10 hidden lg:block opacity-15 pointer-events-none">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M0 12 L0 0 L12 0" stroke="white" strokeWidth="1" />
          <path d="M36 0 L48 0 L48 12" stroke="white" strokeWidth="1" />
          <path d="M48 36 L48 48 L36 48" stroke="white" strokeWidth="1" />
          <path d="M12 48 L0 48 L0 36" stroke="white" strokeWidth="1" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;