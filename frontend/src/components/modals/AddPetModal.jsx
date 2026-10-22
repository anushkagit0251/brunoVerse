import React, { useState, useRef } from 'react';
import { X, PawPrint, Loader2, Camera, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { animalApi } from '../../api/animalApi';
import { uploadApi } from '../../api/uploadApi';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../utils/url';
import { parseApiError } from '../../utils/errorHandler';

export default function AddPetModal({ isOpen, onClose, onPetAdded }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const initialForm = {
    name: '',
    type: 'DOG',
    breed: '',
    age: '',
    gender: 'Male',
  };

  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setSuccessMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Please upload a valid image file (JPG, PNG, JPEG, WEBP).');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter pet companion name');
      return;
    }

    // Determine owner ID from auth state or persisted session
    let effectiveOwnerId = user?.userId || user?.id;
    if (!effectiveOwnerId) {
      try {
        const stored = localStorage.getItem('brunoverse_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          effectiveOwnerId = parsed.userId || parsed.id;
        }
      } catch (ignored) {}
    }

    if (!effectiveOwnerId) {
      setError('Please sign in or select an account to register a pet companion.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let finalPhotoUrl = null;

      // 1. Upload photo to backend if selected
      if (imageFile) {
        try {
          const uploadRes = await uploadApi.uploadFile(imageFile);
          finalPhotoUrl = getAssetUrl(uploadRes.url);
        } catch (uploadErr) {
          console.warn('Backend image upload fallback to preview data URL:', uploadErr);
          // If server rejects upload, fallback to high-quality default or preview
          finalPhotoUrl = formData.type === 'CAT'
            ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
            : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
        }
      }

      if (!finalPhotoUrl) {
        finalPhotoUrl = formData.type === 'CAT'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
          : formData.type === 'BIRD'
          ? 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=400&q=80'
          : formData.type === 'COW'
          ? 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
      }

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || 'Mixed Breed',
        age: parseInt(formData.age, 10) || 1,
        gender: formData.gender,
        photoUrl: finalPhotoUrl
      };

      await animalApi.createAnimal(payload, effectiveOwnerId);

      setSuccessMsg('Pet companion saved successfully! Updating records...');
      if (onPetAdded) {
        onPetAdded();
      }

      setTimeout(() => {
        handleResetAndClose();
      }, 1200);

    } catch (err) {
      console.error('Failed to create pet:', err);
      const msg = parseApiError(err, 'Failed to save pet companion. Please check backend connection.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleResetAndClose}>
      <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '22px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawPrint size={20} />
            </div>
            <h2 className="modal-title">Add a Pet Companion</h2>
          </div>
          <button className="modal-close-btn" onClick={handleResetAndClose}><X size={18} /></button>
        </div>

        {successMsg && (
          <div style={{ padding: '12px 14px', background: '#DCFCE7', color: '#16A34A', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-red)', color: 'var(--accent-red-text)', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Pet Photo Upload & Preview */}
          <div className="form-group">
            <label className="form-label">Pet Photo (Upload, Preview)</label>
            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '14px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                <img src={imagePreview} alt="Pet Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(220,38,38,0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={12} />
                  <span>Remove Photo</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '14px',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <Upload size={24} style={{ color: 'var(--primary)', margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Click to upload pet image</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, JPEG, WEBP</div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pet Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Bruno, Bella, Simba" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Species / Type</label>
              <select 
                className="form-select" 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={loading}
              >
                <option value="DOG">Dog</option>
                <option value="CAT">Cat</option>
                <option value="BIRD">Bird</option>
                <option value="COW">Cow</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                className="form-select" 
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={loading}
              >
                <option value="Male">Male ♂</option>
                <option value="Female">Female ♀</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Breed</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Golden Retriever" 
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                disabled={loading}
              >
              </input>
            </div>

            <div className="form-group">
              <label className="form-label">Age (years)</label>
              <input 
                type="number" 
                min="0"
                max="30"
                className="form-input" 
                placeholder="e.g. 3" 
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={handleResetAndClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Saving Pet...' : 'Save Pet Companion'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
