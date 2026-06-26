// frontend/src/pages/Profile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { authAPI } from '../api/auth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import VoterCardVerification from '../components/auth/VoterCardVerification';

const GlassCard = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(12px)',
    }}
  >
    {children}
  </div>
);

const StatusBadge = ({ ok, trueLabel, falseLabel }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
    style={
      ok
        ? { background: 'rgba(34,197,94,0.12)', color: 'rgba(134,239,172,0.9)', border: '1px solid rgba(34,197,94,0.2)' }
        : { background: 'rgba(245,158,11,0.12)', color: 'rgba(253,211,77,0.9)', border: '1px solid rgba(245,158,11,0.2)' }
    }
  >
    <span className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? '#22C55E' : '#F59E0B' }} />
    {ok ? trueLabel : falseLabel}
  </span>
);

const InfoRow = ({ label, value, mono }) => (
  <div
    className="flex items-center justify-between py-3.5 px-5"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
  >
    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
      {label}
    </span>
    <span className={`text-sm font-medium text-white/80 ${mono ? 'font-mono text-xs' : ''}`}>
      {value || <span style={{ color: 'rgba(255,255,255,0.25)' }}>Not set</span>}
    </span>
  </div>
);

const InputField = ({ label, type = 'text', value, onChange, required }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 text-sm text-white rounded-xl outline-none transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        caretColor: '#60a5fa',
      }}
      onFocus={e => {
        e.target.style.border = '1px solid rgba(96,165,250,0.5)';
        e.target.style.background = 'rgba(255,255,255,0.07)';
      }}
      onBlur={e => {
        e.target.style.border = '1px solid rgba(255,255,255,0.1)';
        e.target.style.background = 'rgba(255,255,255,0.05)';
      }}
    />
  </div>
);

// Avatar initials
const Avatar = ({ name }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(37,99,235,0.6), rgba(124,58,237,0.6))',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {initials}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { address, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showVoterVerification, setShowVoterVerification] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await authAPI.updateProfile(updateForm);
      if (response.success) {
        setSuccess('Profile updated successfully');
        updateUser(response);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const walletDisplay = isConnected && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #020818 0%, #050d1a 50%, #040a16 100%)' }}
    >
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pt-28 pb-16">

        {/* Page header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase mb-3" style={{ color: 'rgba(147,197,253,0.7)' }}>
            <span className="w-4 h-px bg-blue-400/60" />
            Account
          </span>
          <h1 className="text-3xl font-black text-white">My Profile</h1>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-5"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(252,165,165,0.9)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-5"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: 'rgba(134,239,172,0.9)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {success}
          </div>
        )}

        {/* Identity card */}
        <GlassCard className="mb-4">
          <div className="flex items-center gap-5 p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Avatar name={user?.name} />
            <div className="flex-1 min-w-0">
              <p className="text-xl font-black text-white truncate">{user?.name || 'Anonymous'}</p>
              <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{user?.email || '—'}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <StatusBadge ok={user?.isVerified} trueLabel="Verified" falseLabel="Pending verification" />
                <StatusBadge ok={user?.hasVoted} trueLabel="Voted" falseLabel="Not voted" />
                {isConnected && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(52,211,153,0.1)', color: 'rgba(110,231,183,0.9)', border: '1px solid rgba(52,211,153,0.2)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Wallet connected
                  </span>
                )}
              </div>
            </div>

            {/* Edit toggle */}
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setUpdateForm({ name: user?.name || '', email: user?.email || '' });
                }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                Edit
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-shrink-0 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200"
                style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Info rows or Edit form */}
          {!isEditing ? (
            <div>
              <InfoRow label="Full Name" value={user?.name} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="NRN ID" value={user?.nrnId} />
              <InfoRow
                label="Wallet"
                value={walletDisplay}
                mono
              />
              <div
                className="flex items-center justify-between py-3.5 px-5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Verification
                </span>
                <StatusBadge ok={user?.isVerified} trueLabel="Verified" falseLabel="Pending" />
              </div>
              <div className="flex items-center justify-between py-3.5 px-5">
                <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Vote Status
                </span>
                <StatusBadge ok={user?.hasVoted} trueLabel="Submitted" falseLabel="Not yet voted" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <InputField
                label="Full Name"
                value={updateForm.name}
                onChange={e => setUpdateForm({ ...updateForm, name: e.target.value })}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={updateForm.email}
                onChange={e => setUpdateForm({ ...updateForm, email: e.target.value })}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          )}
        </GlassCard>

        {/* Voter verification CTA — only if not voted */}
        {!user?.hasVoted && (
          <GlassCard>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="3" y="2" width="12" height="14" rx="2" stroke="rgba(134,239,172,0.8)" strokeWidth="1.5"/>
                    <path d="M6 9l2 2 4-4" stroke="rgba(134,239,172,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Verify your voter card</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Upload your voter card and verify your identity to cast your vote.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!user?.nrnId || user.nrnId === 'N/A') {
                    setError('Please complete your profile with NRN ID first');
                    setTimeout(() => setError(''), 3000);
                    return;
                  }
                  setShowVoterVerification(true);
                }}
                className="mt-5 w-full py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.8), rgba(34,197,94,0.8))', border: '1px solid rgba(34,197,94,0.3)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Verify voter card to vote
              </button>
            </div>
          </GlassCard>
        )}
      </main>

      <Footer />

      {/* Modal */}
      {showVoterVerification && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: '#050d1a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <VoterCardVerification
              user={user}
              onVerified={(data) => {
                localStorage.setItem('voterData', JSON.stringify({ ...data, faceDescriptor: data.faceDescriptor }));
                localStorage.setItem('voterId', data.voterId);
                setShowVoterVerification(false);
                navigate('/vote');
              }}
              onCancel={() => setShowVoterVerification(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;