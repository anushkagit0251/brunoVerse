import React, { useState, useRef } from 'react';
import { X, PawPrint, Loader2, Camera, Upload, Trash2 } from 'lucide-react';
import { animalApi } from '../../api/animalApi';
import { uploadApi } from '../../api/uploadApi';
import { useAuth } from '../../context/AuthContext';

export default function AddPetModal({ isOpen, onClose, onPetAdded }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'DOG',
    breed: '',
    age: '',
    gender: 'Male',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      setError('Please enter pet name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalPhotoUrl = null;

      // Upload image to backend
      if (imageFile) {
        try {
          const uploadRes = await uploadApi.uploadFile(imageFile);
          finalPhotoUrl = uploadRes.url.startsWith('http')
            ? uploadRes.url
            : `${window.location.origin.includes('localhost') ? 'http://localhost:8080' : ''}${uploadRes.url}`;
        } catch (uploadErr) {
          console.warn('Backend image upload fallback to preview data URL:', uploadErr);
          finalPhotoUrl = imagePreview;
        }
      }

      if (!finalPhotoUrl) {
        finalPhotoUrl = formData.type === 'CAT'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
      }

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || 'Mixed Breed',
        age: parseInt(formData.age) || 1,
        gender: formData.gender,
        photoUrl: finalPhotoUrl
      };

      await animalApi.createAnimal(payload, user.userId);
      onPetAdded();
      onClose();
    } catch (err) {
      console.error('Failed to create pet:', err);
      setError('Failed to save pet. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '22px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawPrint size={20} />
            </div>
            <h2 className="modal-title">Add a Pet Companion</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

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
                  <span>Remove</span>
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
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Species / Type</label>
              <select 
                className="form-select" 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
              />
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
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Save Pet Companion</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
