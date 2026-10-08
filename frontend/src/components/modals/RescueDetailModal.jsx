import React, { useState } from 'react';
import { X, MapPin, AlertCircle, Clock, CheckCircle2, User, Phone, Play, Check } from 'lucide-react';
import { rescueApi } from '../../api/rescueApi';
import { activityApi } from '../../api/activityApi';
import { useAuth } from '../../context/AuthContext';

export default function RescueDetailModal({ rescue, isOpen, onClose, onStatusUpdated }) {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !rescue) return null;

  const isRescuer = user?.role === 'RESCUER' || user?.role === 'VOLUNTEER';

  const handleUpdateStatus = async (newStatus) => {
    setLoadingAction(true);
    try {
      await rescueApi.updateStatus(rescue.id, newStatus, user?.userId);

      // Log activity
      try {
        await activityApi.create({
          description: `You marked '${rescue.animalType}' as ${newStatus.toLowerCase().replace('_', ' ')}`,
          timeAgo: 'Just now'
        });
      } catch (e) {
        // Ignore activity log failure
      }

      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update rescue status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const getUrgencyBadge = (u) => {
    switch (u) {
      case 'CRITICAL': return <span className="badge badge-urgent">Critical</span>;
      case 'HIGH': return <span className="badge badge-medical">Urgent</span>;
      case 'MEDIUM': return <span className="badge badge-shelter">Needs Help</span>;
      default: return <span className="badge badge-food">Low Priority</span>;
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'COMPLETED': return <span className="badge badge-healthy">Completed</span>;
      case 'IN_PROGRESS': return <span className="badge badge-medical">In Progress</span>;
      case 'ACCEPTED': return <span className="badge badge-food">Accepted</span>;
      case 'PENDING':
      default: return <span className="badge badge-urgent">Pending</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '560px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="modal-title">{rescue.animalType}</h2>
            {getUrgencyBadge(rescue.urgency)}
            {getStatusBadge(rescue.status)}
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Rescue Image & Details */}
        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', background: '#E2ECE5' }}>
          <img 
            src={rescue.photoUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'} 
            alt={rescue.animalType} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            <MapPin size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600 }}>{rescue.location}</span>
          </div>

          <div style={{ background: '#FAFCFA', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>CASE DESCRIPTION</div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {rescue.description}
            </p>
          </div>

          {/* Reporter & Assignment Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#F8FAF8', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>REPORTED BY</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {rescue.reportedBy?.name || 'Community Member'}
              </div>
              {rescue.reportedBy?.phone && (
                <div style={{ fontSize: '12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Phone size={12} /> {rescue.reportedBy.phone}
                </div>
              )}
            </div>

            <div style={{ padding: '12px', borderRadius: '12px', background: '#F8FAF8', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>ASSIGNED RESCUER</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {rescue.assignedRescuer?.name || 'Unassigned (Waiting for Rescuer)'}
              </div>
            </div>
          </div>
        </div>

        {/* Rescuer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>

          {isRescuer && rescue.status !== 'COMPLETED' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {rescue.status === 'PENDING' && (
                <button 
                  className="btn-primary" 
                  disabled={loadingAction}
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Accept Case</span>
                </button>
              )}

              {(rescue.status === 'ACCEPTED' || rescue.status === 'PENDING') && (
                <button 
                  className="btn-primary" 
                  disabled={loadingAction}
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  style={{ background: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Play size={16} />
                  <span>Start Rescue</span>
                </button>
              )}

              {rescue.status === 'IN_PROGRESS' && (
                <button 
                  className="btn-primary" 
                  disabled={loadingAction}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  style={{ background: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} />
                  <span>Mark Completed</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
