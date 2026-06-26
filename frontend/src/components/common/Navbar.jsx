// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import logo from '../../assets/images/vote_logo1.png';

const formatAddress = (addr) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const NavLink = ({ onClick, children, active }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
      active ? 'text-white' : 'text-white/50 hover:text-white/85'
    }`}
  >
    {children}
    {active && (
      <motion.span
        layoutId="nav-indicator"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400"
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}
  </button>
);

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const { isConnected, connectWallet, loading, address } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleConnectWallet = async () => {
    const result = await connectWallet();
    if (!result.success) console.error('Wallet connection failed:', result.message);
  };

  const navLinks = isAuthenticated
    ? [
        { label: t('nav.dashboard'), path: '/dashboard' },
        { label: t('nav.vote'),      path: '/vote' },
        { label: t('nav.profile'),   path: '/profile' },
        { label: t('nav.results'),   path: '/results' },
      ]
    : [];

  return (
    <nav
      className="fixed top-0 w-full z-50"
      style={{
        background: 'linear-gradient(to right, rgba(10,15,40,0.97), rgba(5,10,30,0.97))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Top accent line — mirrors hero's blue scan line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="w-full px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(37,99,235,0.18)',
                border: '1px solid rgba(59,130,246,0.28)',
              }}
            >
              <img src={logo} alt="eVote" className="h-6 w-6 object-contain" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              {t('app.title')}
            </span>
          </Link>

          {/* Center Nav */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  active={location.pathname === link.path}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher />

            {/* Wallet */}
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 disabled:opacity-40"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
                {loading ? 'Connecting...' : t('nav.connectWallet')}
              </button>
            ) : (
              <div
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium"
                style={{
                  border: '1px solid rgba(52,211,153,0.25)',
                  borderRadius: '10px',
                  background: 'rgba(52,211,153,0.08)',
                  color: 'rgba(110,231,183,0.9)',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {formatAddress(address)}
              </div>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white/40 hover:text-red-400 transition-colors duration-200"
              >
                {t('nav.logout')}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors duration-200"
              >
                {t('nav.login')}
              </Link>
            )}

            {!isAuthenticated && (
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                >
                  {t('nav.register')}
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden"
            style={{
              background: 'rgba(8,12,35,0.99)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="block w-full text-left px-3 py-3 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: location.pathname === link.path ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    background: location.pathname === link.path ? 'rgba(255,255,255,0.05)' : 'transparent',
                  }}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-5 mt-2 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <LanguageSwitcher />

                {!isConnected ? (
                  <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="w-full py-2.5 text-sm font-medium text-white/55 rounded-xl transition-colors disabled:opacity-40"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
                  >
                    {loading ? 'Connecting...' : t('nav.connectWallet')}
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
                    style={{
                      border: '1px solid rgba(52,211,153,0.25)',
                      background: 'rgba(52,211,153,0.08)',
                      color: 'rgba(110,231,183,0.9)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {formatAddress(address)}
                  </div>
                )}

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-sm font-medium rounded-xl transition-colors"
                    style={{
                      color: 'rgba(248,113,113,0.8)',
                      border: '1px solid rgba(248,113,113,0.15)',
                      background: 'rgba(248,113,113,0.05)',
                    }}
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="w-full py-2.5 text-sm font-medium text-center rounded-xl transition-colors"
                      style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-2.5 text-sm font-semibold text-center text-white rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;