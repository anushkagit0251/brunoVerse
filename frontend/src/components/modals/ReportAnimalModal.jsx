import React, { useState, useRef } from 'react';
import { 
  X, Megaphone, Loader2, Camera, Upload, MapPin, Phone, 
  AlertTriangle, Trash2, CheckCircle2, Sparkles, BookOpen, 
  ExternalLink, ShieldCheck, RefreshCw, Info, HelpCircle
} from 'lucide-react';
import { rescueApi } from '../../api/rescueApi';
import { uploadApi } from '../../api/uploadApi';
import { aiApi } from '../../api/aiApi';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../utils/url';
import { parseApiError } from '../../utils/errorHandler';

export default function ReportAnimalModal({ isOpen, onClose, onReportSuccess }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const activeAiRequestRef = useRef(0);

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

  // AI Rescue Assistant State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [userManuallyEditedDesc, setUserManuallyEditedDesc] = useState(false);
  const [aiDraftApplied, setAiDraftApplied] = useState(false);

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

  // Trigger AI Image Analysis for selected photo
  const triggerAiAnalysis = async (file) => {
    if (!file) return;
    const currentRequestId = ++activeAiRequestRef.current;

    setAiAnalyzing(true);
    setAiError(null);

    try {
      const data = await aiApi.analyzeAnimalImage(file);
      
      // Ignore if user has since selected another photo or removed image
      if (currentRequestId !== activeAiRequestRef.current) return;

      setAiResult(data);

      // Auto-suggest animal type if user hasn't explicitly set another
      if (data.apparentAnimalType && animalType === 'Dog') {
        const typeNormalized = data.apparentAnimalType.trim();
        if (['Dog', 'Cat', 'Cow', 'Bird', 'Puppies', 'Kitten', 'Other'].includes(typeNormalized)) {
          setAnimalType(typeNormalized);
        }
      }

      // Auto-suggest urgency if currently default
      if (data.suggestedUrgency && urgency === 'CRITICAL') {
        setUrgency(data.suggestedUrgency);
      }

      // Auto-populate description if user has not typed custom text yet
      if (data.generatedDescription) {
        if (!userManuallyEditedDesc && (!description.trim() || aiDraftApplied)) {
          setDescription(data.generatedDescription);
          setAiDraftApplied(true);
        }
      }

    } catch (err) {
      if (currentRequestId !== activeAiRequestRef.current) return;
      console.warn('AI rescue photo inspection error:', err);
      setAiError(parseApiError(err, 'AI photo inspection was temporarily unavailable. You can still describe the situation manually.'));
    } finally {
      if (currentRequestId === activeAiRequestRef.current) {
        setAiAnalyzing(false);
      }
    }
  };

  // Image File Handling (JPG, PNG, JPEG, WEBP)
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/i)) {
      alert('Invalid file format. Please upload JPG, PNG, JPEG, or WEBP.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Run AI Visual Analysis
    triggerAiAnalysis(file);
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
    activeAiRequestRef.current++;
    setImageFile(null);
    setImagePreview(null);
    setAiAnalyzing(false);
    setAiResult(null);
    setAiError(null);
    setAiDraftApplied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const applyAiDraftToDescription = () => {
    if (aiResult?.generatedDescription) {
      setDescription(aiResult.generatedDescription);
      setAiDraftApplied(true);
      setUserManuallyEditedDesc(false);
    }
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
          uploadedPhotoUrl = getAssetUrl(uploadRes.url);
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

      const effectiveReporterId = user?.userId || user?.id;
      await rescueApi.createRescue(payload, effectiveReporterId);

      if (onReportSuccess) onReportSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit rescue report:', err);
      const msg = parseApiError(err, 'Failed to submit report. Please check backend connection.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '680px', 
          width: '95%', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          padding: '28px', 
          borderRadius: '24px',
          background: '#FFFCF7',
          border: '1px solid #E7E0D5',
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={22} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>Report an Animal in Need</h2>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* SECTION 1: Photograph Upload & Live AI Vision Analysis */}
          <div className="form-group" style={{ background: '#F7F2E8', padding: '16px', borderRadius: '18px', border: '1px solid #E7E0D5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={16} style={{ color: 'var(--primary)' }} />
                <span>Animal Photograph (Required for AI Triage)</span>
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => triggerAiAnalysis(imageFile)}
                  disabled={aiAnalyzing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} className={aiAnalyzing ? 'animate-spin' : ''} />
                  <span>Re-analyze Photo</span>
                </button>
              )}
            </div>

            {imagePreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '14px', overflow: 'hidden', border: '2px solid var(--primary)', background: '#000' }}>
                  <img src={imagePreview} alt="Animal Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Change Photo</span>
                  </button>

                  {/* Analyzing Overlay Badge */}
                  {aiAnalyzing && (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      right: '10px',
                      background: 'rgba(33, 78, 61, 0.9)',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      backdropFilter: 'blur(6px)'
                    }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>BrunoVerse AI is inspecting visible trauma observations...</span>
                    </div>
                  )}
                </div>

                {/* AI Analysis Outcome Card */}
                {aiResult && !aiAnalyzing && (
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5F0E5',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    boxShadow: '0 2px 8px rgba(33, 78, 61, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: '#E5F0E5', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={14} />
                        </div>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--primary)' }}>
                          AI Triage Assessment
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#EEF7F0',
                        color: 'var(--primary)',
                        padding: '3px 8px',
                        borderRadius: '10px'
                      }}>
                        Review & Edit Before Submitting
                      </span>
                    </div>

                    {/* Observations List */}
                    {aiResult.observations && aiResult.observations.length > 0 && (
                      <div style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '3px', fontSize: '11.5px', textTransform: 'uppercase' }}>
                          Visual Observations:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                          {aiResult.observations.map((obs, idx) => (
                            <li key={idx} style={{ marginBottom: '2px' }}>{obs}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Uncertainties / Honest Medical Disclaimer */}
                    {aiResult.uncertainties && aiResult.uncertainties.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', background: '#FBFBFA', padding: '8px 12px', borderRadius: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
                        <span><strong>Disclaimer:</strong> {aiResult.uncertainties.join(' ')}</span>
                      </div>
                    )}

                    {/* Safety Guidance */}
                    {aiResult.safetyGuidance && aiResult.safetyGuidance.length > 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', color: '#92400E' }}>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                          <AlertTriangle size={14} />
                          <span>On-Scene Safety Precautions:</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                          {aiResult.safetyGuidance.map((sg, idx) => (
                            <li key={idx}>{sg}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Real Learning Guides */}
                    {aiResult.recommendedLessons && aiResult.recommendedLessons.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BookOpen size={14} />
                          <span>Recommended Learning & Triage Protocols:</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                          {aiResult.recommendedLessons.map((lesson) => (
                            <a
                              key={lesson.id}
                              href={lesson.link || `/learning?topic=${lesson.id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                borderRadius: '10px',
                                background: '#F7F2E8',
                                border: '1px solid #E7E0D5',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {lesson.image && (
                                <img
                                  src={lesson.image}
                                  alt={lesson.title}
                                  style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                />
                              )}
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                  {lesson.category}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lesson.title}
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lesson.relevanceReason}
                                </div>
                              </div>
                              <ExternalLink size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiError && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FEE2E2', fontSize: '12px', color: '#991B1B' }}>
                    {aiError}
                  </div>
                )}
              </div>
            ) : (
              /* Drag & Drop Photo Selection Box */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed var(--primary)' : '2px dashed #D6CEC3',
                  borderRadius: '16px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: isDragging ? '#EEF7F0' : '#FFFCF7',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#EEF7F0', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Upload size={22} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Click to Browse or Drag Animal Photo Here
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  PNG, JPG, JPEG, WEBP (Max 15MB) — BrunoVerse AI will automatically analyze visible distress
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '10px',
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Select Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      border: '1px solid #D6CEC3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={14} />
                    <span>Capture Camera</span>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) processImageFile(e.target.files[0]);
              }}
            />
            <input
              type="file"
              ref={cameraInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) processImageFile(e.target.files[0]);
              }}
            />
          </div>

          {/* Row: Animal Type & Urgency */}
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

          {/* Row: Condition & Reporter Phone */}
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

          {/* Detailed Description with AI Auto-Fill badge and preservation */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Detailed Incident Description *</label>
              {aiDraftApplied && (
                <span style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} />
                  <span>AI-generated draft — please review and edit</span>
                </span>
              )}
            </div>

            {/* If user typed custom text and AI draft is available */}
            {userManuallyEditedDesc && aiResult?.generatedDescription && (
              <div style={{
                marginBottom: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: '#F7F2E8',
                border: '1px solid #E7E0D5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-main)' }}>AI has generated an incident description from your photo.</span>
                <button
                  type="button"
                  onClick={applyAiDraftToDescription}
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Apply AI Draft
                </button>
              </div>
            )}

            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe animal appearance, behavior, exact spot, proximity to landmarks, or whether water/food was given..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setUserManuallyEditedDesc(true);
              }}
              required
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={submitting}
              style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || uploadingImage}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#DC2626',
                borderColor: '#DC2626'
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Submitting Rescue SOS...</span>
                </>
              ) : (
                <>
                  <Megaphone size={18} />
                  <span>Broadcast SOS Rescue Alert</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
