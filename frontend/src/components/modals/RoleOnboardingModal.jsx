import React, { useState } from 'react';
import { X, PawPrint, ShieldCheck, Heart, Stethoscope, Building2, UserCheck, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { parseApiError, logError } from '../../utils/errorHandler';

export default function RoleOnboardingModal({ initialData, onSuccess, onClose }) {
  const { loginWithGoogle } = useAuth();
  const [role, setRole] = useState('PET_OWNER');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('PREFER_NOT_TO_SAY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      id: 'PET_OWNER',
      title: 'Pet Owner',
      desc: 'I have pets and want to track their health, vaccines, and find nearby help.',
      icon: Heart,
      color: '#eef7f0',
      iconColor: '#2d6a4f'
    },
    {
      id: 'RESCUER',
      title: 'Animal Rescuer',
      desc: 'I rescue injured or stray animals, coordinate cases, and save lives.',
      icon: ShieldCheck,
      color: '#fff1e8',
      iconColor: '#ea580c'
    },
    {
      id: 'VETERINARIAN',
      title: 'Veterinarian',
      desc: 'I provide medical consultations, diagnosis, and treatment for animals.',
      icon: Stethoscope,
      color: '#f2effc',
      iconColor: '#7c3aed'
    },
    {
      id: 'NGO',
      title: 'NGO / Animal Shelter',
      desc: 'We operate shelters, manage volunteer networks, and run feeding drives.',
      icon: Building2,
      color: '#edf4fc',
      iconColor: '#2563eb'
    },
    {
      id: 'VOLUNTEER',
      title: 'Community Volunteer',
      desc: 'I help with community feeding, fostering, and on-ground rescue assistance.',
      icon: UserCheck,
      color: '#fef3c7',
      iconColor: '#d97706'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await loginWithGoogle({
        credential: initialData.credential,
        onboardingToken: initialData.onboardingToken,
        email: initialData.email,
        name: initialData.name,
        picture: initialData.picture,
        role,
        phone,
        gender
      });
      onSuccess(user);
    } catch (err) {
      logError('Google role onboarding', err);
      const msg = parseApiError(err, 'Failed to complete profile. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '580px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef7f0', color: '#2d6a4f', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <PawPrint size={14} />
              <span>Welcome to BrunoVerse</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1c4e3b' }}>
              Choose Your Role, {initialData.name?.split(' ')[0] || 'Friend'}!
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Select how you plan to use BrunoVerse to personalize your dashboard.
            </p>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #2d6a4f' : '1px solid #e2e8f0',
                    background: isSelected ? '#f5faf6' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={r.iconColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{r.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{r.desc}</div>
                  </div>
                  <input
                    type="radio"
                    name="selectedRole"
                    checked={isSelected}
                    onChange={() => setRole(r.id)}
                    style={{ accentColor: '#2d6a4f', width: '18px', height: '18px' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Gender Selection Requirement 2 */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Gender (For avatar selection) *</label>
            <div style={{ display: 'flex', gap: '14px', background: '#F8FAF8', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="onboardingGender" 
                  value="MALE" 
                  checked={gender === 'MALE'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="onboardingGender" 
                  value="FEMALE" 
                  checked={gender === 'FEMALE'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="onboardingGender" 
                  value="PREFER_NOT_TO_SAY" 
                  checked={gender === 'PREFER_NOT_TO_SAY'}
                  onChange={(e) => setGender(e.target.value)}
                />
                Prefer not to say
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Phone Number (Optional for SOS & Rescues)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Start My Journey</span>}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
