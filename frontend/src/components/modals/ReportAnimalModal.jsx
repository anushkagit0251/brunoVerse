import React, { useState, useRef } from 'react';
import { X, Megaphone, Loader2, Camera, Upload, MapPin, Phone, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { rescueApi } from '../../api/rescueApi';
import { uploadApi } from '../../api/uploadApi';
import { useAuth } from '../../context/AuthContext';

export default function ReportAnimalModal({ isOpen, onClose, onReportSuccess }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [animalType, setAnimalType] = useState('Dog');
  const [condition, setCondition] = useState('Injured / Bleeding');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: null, lng: null });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [urgency, setUrgency] = useState('CRITICAL');

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // GPS Geolocation Handler
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoordinates({ lat, lng });
        if (!location) {
          setLocation(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } else if (!location.includes('GPS')) {
          setLocation(`${location} (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not fetch GPS coordinates. Please enter location manually.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Image File Handling (JPG, PNG, JPEG, WEBP)
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Invalid file format. Please upload JPG, PNG, JPEG, or WEBP.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) {
      setError('Please provide condition details and location.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let uploadedPhotoUrl = null;

      // 1. Upload photo to backend if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await uploadApi.uploadFile(imageFile);
          uploadedPhotoUrl = uploadRes.url.startsWith('http')
            ? uploadRes.url
            : `${window.location.origin.includes('localhost') ? 'http://localhost:8080' : ''}${uploadRes.url}`;
        } catch (uploadErr) {
          console.warn('Backend image upload fallback to preview data URL:', uploadErr);
          uploadedPhotoUrl = imagePreview;
        } finally {
          setUploadingImage(false);
        }
      }

      // Default animal photos fallback
      const defaultPhotos = {
        'Dog': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
        'Cat': 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
        'Cow': 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
        'Bird': 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?auto=format&fit=crop&w=600&q=80',
        'Puppies': 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=600&q=80',
      };

      const finalPhotoUrl = uploadedPhotoUrl || defaultPhotos[animalType] || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80';

      const payload = {
        animalType,
        condition,
        description: description.trim(),
        location: location.trim(),
        phone: phone.trim(),
        urgency,
        photoUrl: finalPhotoUrl,
        latitude: gpsCoordinates.lat,
        longitude: gpsCoordinates.lng
      };

      await rescueApi.createRescue(payload, user?.userId);

      if (onReportSuccess) onReportSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit rescue report:', err);
      setError('Failed to submit report. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', borderRadius: '24px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>Report an Animal in Need</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Instantly broadcast SOS to nearby rescuers, shelters & vets</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Animal Type & Urgency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Animal Type *</label>
              <select className="form-select" value={animalType} onChange={(e) => setAnimalType(e.target.value)}>
                <option value="Dog">Dog (Stray or Pet)</option>
                <option value="Cat">Cat / Kitten</option>
                <option value="Cow">Cow / Bull</option>
                <option value="Bird">Bird (Injured / Dehydrated)</option>
                <option value="Puppies">Puppies (Abandoned Litter)</option>
                <option value="Kitten">Kittens (Orphaned)</option>
                <option value="Other">Other Wildlife / Stray</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency Level *</label>
              <select className="form-select" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="CRITICAL">Critical (Life-threatening / Severe trauma)</option>
                <option value="HIGH">High (Fracture / Open wound / Deep pain)</option>
                <option value="MEDIUM">Medium (Sick / Weak / Dehydrated)</option>
                <option value="LOW">Low (Abandoned / Needs shelter or foster)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Condition & Reporter Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Condition *</label>
              <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="Injured / Bleeding">Injured / Bleeding</option>
                <option value="Hit by Vehicle / Fracture">Hit by Vehicle / Fracture</option>
                <option value="Severe Infection / Maggot Wound">Severe Infection / Maggot Wound</option>
                <option value="Dehydrated / Starving">Dehydrated / Starving</option>
                <option value="Abandoned Litter">Abandoned Litter</option>
                <option value="Trapped / In Drainage">Trapped / In Drainage</option>
                <option value="Cruelty / Abuse">Cruelty / Abuse</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone (For Rescuer Call) *</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & GPS Button */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Location & Landmarks *</label>
              <button
                type="button"
                onClick={handleGetGpsLocation}
                disabled={gpsLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EEF7F0',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  borderRadius: '10px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {gpsLoading ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
                <span>{gpsCoordinates.lat ? 'GPS Added ✓' : 'Use Current GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Near Gate 3, Sector 15 Metro Station, Noida"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe animal appearance, behavior, exact spot, proximity to landmarks, or whether water/food was given..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Image Upload Area (Drag & Drop, Camera, File Browse) */}
          <div className="form-group">
            <label className="form-label">Animal Photo (Gallery, Mobile Camera, JPG, PNG, WEBP)</label>

            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                <img src={imagePreview} alt="Animal Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(220, 38, 38, 0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed var(--primary)' : '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: isDragging ? '#EEF7F0' : '#F8FAFC',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', color: 'var(--text-secondary)' }}>
                  <Upload size={22} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Drag & Drop animal photo here, or browse files
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Supports JPG, PNG, JPEG, WEBP (Max 10MB)
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                  >
                    <Upload size={14} />
                    <span>Browse Gallery</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => cameraInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                  >
                    <Camera size={14} />
                    <span>Use Camera</span>
                  </button>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => processImageFile(e.target.files?.[0])}
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => processImageFile(e.target.files?.[0])}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ background: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14.5px', fontWeight: 800 }}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
              <span>{submitting ? 'Broadcasting SOS...' : 'Submit Rescue Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
