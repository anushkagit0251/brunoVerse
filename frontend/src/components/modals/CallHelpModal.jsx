import React from 'react';
import { X, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function CallHelpModal({ provider, isOpen, onClose }) {
  if (!isOpen || !provider) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>{provider.name}</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{provider.type} • {provider.distance}</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#FAFCFA', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>ADDRESS / LOCATION</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{provider.address || 'Noida NCR Region'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>DIRECT CONTACT</div>
              {provider.phone ? (
                <a href={`tel:${provider.phone}`} style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                  {provider.phone}
                </a>
              ) : (
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone not listed</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(provider.name + ' ' + (provider.address || 'Noida'))}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={15} />
            <span>Open in Google Maps</span>
          </a>

          {provider.phone ? (
            <a 
              href={`tel:${provider.phone}`}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Phone size={15} />
              <span>Call Now</span>
            </a>
          ) : (
            <button 
              type="button"
              disabled
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.6, cursor: 'not-allowed' }}
            >
              <Phone size={15} />
              <span>No Direct Line</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
