import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Shield, Save, CheckCircle2, LogOut, Camera, Upload, MapPin, FileText, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { uploadApi } from '../api/uploadApi';
import { useNavigate } from 'react-router-dom';
import { getUserAvatar } from '../utils/avatar';

export default function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'PREFER_NOT_TO_SAY');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Profile Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Please upload a valid image file (JPG, PNG, JPEG, or WEBP).');
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const res = await uploadApi.uploadFile(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${window.location.origin.includes('localhost') ? 'http://localhost:8080' : ''}${res.url}`;
      setAvatarUrl(fullUrl);
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      // Fallback preview locally using FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.userId) return;
    setSaving(true);
    setSavedSuccess(false);
    setErrorMsg('');

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        gender,
        avatarUrl,
        address: address.trim(),
        bio: bio.trim()
      };

      const updated = await userApi.update(user.userId, payload);
      
      updateUserProfile({
        name: updated.name,
        phone: updated.phone,
        gender: updated.gender,
        avatarUrl: updated.avatarUrl,
        address: updated.address,
        bio: updated.bio
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg('Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentPreviewAvatar = getUserAvatar({
    avatarUrl,
    gender,
    name
  });

  return (
    <div className="content-body" style={{ maxWidth: '820px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>Account Profile & Settings</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Update your personal profile, gender preferences, avatar, and contact information
          </p>
        </div>
      </div>

      <div className="section-card" style={{ padding: '28px', borderRadius: '24px' }}>
        {/* Profile Header & Avatar Upload Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '92px', height: '92px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary)', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploadingImage ? (
                <Loader2 size={32} className="animate-spin" color="var(--primary)" />
              ) : (
                <img 
                  src={currentPreviewAvatar} 
                  alt={name || 'Profile'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new profile picture"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              onChange={handleImageFileChange} 
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{name || user?.name}</h2>
              <span className="badge badge-healthy" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ')?.toLowerCase()}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email}</div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={14} />
                <span>Change Photo</span>
              </button>

              {avatarUrl && (
                <button 
                  type="button" 
                  onClick={handleRemovePhoto}
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '10px', background: '#FEE2E2', color: '#DC2626', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                  <span>Remove Custom Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div style={{ marginTop: '18px', padding: '12px 16px', background: '#DCFCE7', color: '#16A34A', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>Profile successfully updated and saved in MySQL database!</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '18px', padding: '12px 16px', background: 'var(--accent-red)', color: 'var(--accent-red-text)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Ayushman Sharma" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Email (Read-only) */}
            <div className="form-group">
              <label className="form-label">Email Address (Registered)</label>
              <input 
                type="email" 
                className="form-input" 
                value={user?.email || ''} 
                disabled 
                style={{ background: '#F1F5F2', cursor: 'not-allowed' }}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input 
                type="tel" 
                className="form-input" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. +91 98765 43210" 
              />
            </div>
          </div>

          {/* Gender Requirement 2 */}
          <div className="form-group">
            <label className="form-label">Gender (Used for profile representation when no photo is uploaded) *</label>
            <div style={{ display: 'flex', gap: '20px', background: '#F8FAF8', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="profileGender" 
                  value="MALE" 
                  checked={gender === 'MALE'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>Male</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="profileGender" 
                  value="FEMALE" 
                  checked={gender === 'FEMALE'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>Female</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="profileGender" 
                  value="PREFER_NOT_TO_SAY" 
                  checked={gender === 'PREFER_NOT_TO_SAY'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>Prefer not to say</span>
              </label>
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Residential Address / City</label>
            <input 
              type="text" 
              className="form-input" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="e.g. Sector 15, Noida, Uttar Pradesh" 
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Bio / About Me</label>
            <textarea 
              className="form-textarea" 
              rows={3}
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell other animal lovers and rescuers about yourself..."
            />
          </div>

          <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: '12px' }}>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => { logout(); navigate('/welcome'); }}
              style={{ color: 'var(--accent-red-text)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={saving} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 700 }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
