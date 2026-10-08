import React, { useState, useEffect } from 'react';
import { LifeBuoy, MapPin, Megaphone, Plus } from 'lucide-react';
import { rescueApi } from '../api/rescueApi';
import RescueDetailModal from '../components/modals/RescueDetailModal';
import ReportAnimalModal from '../components/modals/ReportAnimalModal';

export default function RescueCasesPage() {
  const [rescues, setRescues] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadRescues();
  }, [filter]);

  const loadRescues = async () => {
    setLoading(true);
    try {
      const statusParam = filter === 'ALL' ? null : filter;
      const data = await rescueApi.getRescues(statusParam);
      setRescues(data || []);
    } catch (err) {
      console.error('Failed to load rescues:', err);
    } finally {
      setLoading(false);
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
    <div className="content-body">
      <div className="section-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Rescue Cases & Alerts</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time emergency distress reports across the region
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowReportModal(true)}
          style={{ background: 'var(--accent-red-text)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Megaphone size={18} />
          <span>Report an Animal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className="btn-pill-sm"
            style={{
              background: filter === status ? 'var(--primary)' : '#FFFFFF',
              color: filter === status ? '#FFFFFF' : 'var(--text-secondary)',
              borderColor: filter === status ? 'var(--primary)' : 'var(--border-light)'
            }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading cases from database...</div>
      ) : rescues.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-green)', color: 'var(--accent-green-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <LifeBuoy size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>No Cases Found</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '6px 0 16px' }}>
            There are currently no rescue requests matching this filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {rescues.map((caseItem) => (
            <div 
              key={caseItem.id} 
              className="section-card"
              onClick={() => setSelectedRescue(caseItem)}
              style={{ padding: '16px', cursor: 'pointer', gap: '12px' }}
            >
              <div style={{ width: '100%', height: '160px', borderRadius: '14px', overflow: 'hidden', background: '#EAF0EC' }}>
                <img 
                  src={caseItem.photoUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80'} 
                  alt={caseItem.animalType} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '17px', fontWeight: 800 }}>{caseItem.animalType}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {getUrgencyBadge(caseItem.urgency)}
                  {getStatusBadge(caseItem.status)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--primary)" />
                <span>{caseItem.location}</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {caseItem.description}
              </p>
              <button className="btn-pill-sm" style={{ alignSelf: 'flex-start', background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }}>
                View & Respond
              </button>
            </div>
          ))}
        </div>
      )}

      <RescueDetailModal 
        rescue={selectedRescue} 
        isOpen={!!selectedRescue} 
        onClose={() => setSelectedRescue(null)} 
        onStatusUpdated={loadRescues} 
      />

      <ReportAnimalModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onReportSuccess={loadRescues} 
      />
    </div>
  );
}
