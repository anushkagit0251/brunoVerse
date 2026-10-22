import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Calendar, Stethoscope, CheckCircle, Plus, Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { medicalApi } from '../../api/medicalApi';
import { animalApi } from '../../api/animalApi';
import { uploadApi } from '../../api/uploadApi';
import { getAssetUrl } from '../../utils/url';

export default function PetDetailModal({ pet, isOpen, onClose, onPetDeleted, onPetUpdated }) {
  const [currentPet, setCurrentPet] = useState(pet);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDoctor, setNewDoctor] = useState('Dr. Sharma');
  const [deleting, setDeleting] = useState(false);

  // Photo management state
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (pet) {
      setCurrentPet(pet);
      if (isOpen) {
        loadRecords();
      }
    }
  }, [pet, isOpen]);

  const loadRecords = async () => {
    if (!currentPet?.id) return;
    setLoadingRecords(true);
    try {
      const records = await medicalApi.getByAnimal(currentPet.id);
      setMedicalRecords(records || []);
    } catch (err) {
      console.error('Failed to load medical records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentPet?.id) return;
    try {
      await medicalApi.createRecord({
        title: newTitle.trim(),
        description: newDesc.trim(),
        doctorName: newDoctor.trim(),
        recordDate: new Date().toISOString().split('T')[0]
      }, currentPet.id);
      setNewTitle('');
      setNewDesc('');
      setShowAddRecord(false);
      loadRecords();
    } catch (err) {
      console.error('Failed to add record:', err);
    }
  };

  // Replace / Upload Photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentPet?.id) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert('Please upload a valid image file (JPG, PNG, JPEG, WEBP).');
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploadRes = await uploadApi.uploadFile(file);
      const photoUrl = getAssetUrl(uploadRes.url);

      const updated = await animalApi.updateAnimal(currentPet.id, { photoUrl });
      setCurrentPet(prev => ({ ...prev, photoUrl }));
      if (onPetUpdated) onPetUpdated(updated);
    } catch (err) {
      console.error('Failed to update pet photo:', err);
      alert('Failed to upload image to backend.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Delete / Remove Photo
  const handleDeletePhoto = async () => {
    if (!currentPet?.id) return;
    if (!window.confirm('Are you sure you want to remove this pet image?')) return;

    setUploadingPhoto(true);
    try {
      await animalApi.updateAnimal(currentPet.id, { photoUrl: '' });
      setCurrentPet(prev => ({ ...prev, photoUrl: '' }));
      if (onPetUpdated) onPetUpdated({ ...currentPet, photoUrl: '' });
    } catch (err) {
      console.error('Failed to remove photo:', err);
      alert('Failed to remove image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePet = async () => {
    if (!currentPet?.id) return;
    if (!window.confirm(`Are you sure you want to remove ${currentPet.name}?`)) return;
    setDeleting(true);
    try {
      await animalApi.deleteAnimal(currentPet.id);
      if (onPetDeleted) onPetDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to delete pet:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !currentPet) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '600px', borderRadius: '22px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="modal-title">{currentPet.name}</h2>
            <span className="badge badge-healthy">Healthy</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Pet Header Card with Photo Controls (Upload, Replace, Delete) */}
        <div style={{ display: 'flex', gap: '18px', background: '#F8FAF8', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', background: '#EAF0EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploadingPhoto ? (
                <Loader2 size={30} className="animate-spin" color="var(--primary)" />
              ) : (
                <img 
                  src={currentPet.photoUrl || (currentPet.type === 'CAT' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200')} 
                  alt={currentPet.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace pet photo"
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '-6px',
                width: '30px',
                height: '30px',
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
              <Camera size={14} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handlePhotoUpload}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{currentPet.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {currentPet.type} • {currentPet.breed || 'Standard'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Age: {currentPet.age} {currentPet.age === 1 ? 'year' : 'years'} • Gender: {currentPet.gender || 'Not specified'}
            </div>

            {/* Photo Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Upload size={12} />
                <span>Replace Photo</span>
              </button>

              {currentPet.photoUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={uploadingPhoto}
                  style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Trash2 size={12} />
                  <span>Delete Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Medical Records Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              Medical Records & Vaccinations
            </span>
            <button 
              onClick={() => setShowAddRecord(!showAddRecord)} 
              className="btn-pill-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} />
              <span>Add Record</span>
            </button>
          </div>

          {showAddRecord && (
            <form onSubmit={handleAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#F0F7F2', padding: '14px', borderRadius: '14px', border: '1px solid #D2E6D8' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Record / Vaccine title (e.g. Rabies Vaccine)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Description / Dosage notes"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Doctor Name (e.g. Dr. Sharma)"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  Save
                </button>
              </div>
            </form>
          )}

          {loadingRecords ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading records...</div>
          ) : medicalRecords.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', background: '#FAFCFA', borderRadius: '12px', border: '1px dashed var(--border-light)', color: 'var(--text-muted)', fontSize: '13px' }}>
              No medical records logged yet for {currentPet.name}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {medicalRecords.map((rec) => (
                <div key={rec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFCFA', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{rec.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.doctorName ? `Dr: ${rec.doctorName} • ` : ''}{rec.recordDate || 'Scheduled'}</div>
                    </div>
                  </div>
                  <span className="badge badge-healthy" style={{ fontSize: '10px' }}>Verified</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', marginTop: '10px', borderTop: '1px solid var(--border-light)' }}>
          <button 
            onClick={handleDeletePet} 
            disabled={deleting}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red-text)', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Trash2 size={16} />
            <span>Remove Pet</span>
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
