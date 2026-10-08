import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  PawPrint, 
  CheckCircle2, 
  Heart, 
  MapPin, 
  ArrowRight, 
  Megaphone, 
  Stethoscope, 
  Building2, 
  Clock, 
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rescueApi } from '../../api/rescueApi';
import { activityApi } from '../../api/activityApi';
import { messageApi } from '../../api/messageApi';
import { helpApi } from '../../api/helpApi';
import RescuerHeroArt from '../../components/illustrations/RescuerHeroArt';
import RescueBannerArt from '../../components/illustrations/RescueBannerArt';
import LeafletMap from '../../components/common/LeafletMap';
import RescueDetailModal from '../../components/modals/RescueDetailModal';
import ReportAnimalModal from '../../components/modals/ReportAnimalModal';
import CallHelpModal from '../../components/modals/CallHelpModal';

export default function RescuerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingCases: 0, activeRescues: 0, completed: 0, totalAnimalsHelped: 0 });
  const [rescues, setRescues] = useState([]);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    loadRescuerData();
  }, [user]);

  const loadRescuerData = async () => {
    setLoading(true);
    try {
      const [statsData, rescuesData, activitiesData, messagesData, providersData] = await Promise.all([
        rescueApi.getStats().catch(() => ({ pendingCases: 0, activeRescues: 0, completed: 0, totalAnimalsHelped: 0 })),
        rescueApi.getRescues('PENDING').catch(() => []),
        activityApi.getAll().catch(() => []),
        messageApi.getAll().catch(() => []),
        helpApi.getAll().catch(() => [])
      ]);

      setStats({
        pendingCases: statsData?.pendingCases ?? 0,
        activeRescues: statsData?.activeRescues ?? 0,
        completed: statsData?.completed ?? 0,
        totalAnimalsHelped: statsData?.totalAnimalsHelped ?? 0
      });
      setRescues(rescuesData || []);
      setActivities(activitiesData || []);
      setMessages(messagesData || []);
      setProviders(providersData || []);
    } catch (err) {
      console.error('Failed to load rescuer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFirstName = () => {
    if (!user?.name) return 'Rescuer';
    return user.name.split(' ')[0];
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return <span className="badge-pill badge-urgent">Urgent</span>;
      case 'HIGH':
        return <span className="badge-pill badge-lavender">Medical Help</span>;
      case 'MEDIUM':
        return <span className="badge-pill badge-amber">Needs Shelter</span>;
      default:
        return <span className="badge-pill badge-blue">Food Needed</span>;
    }
  };

  // Rescue map pins
  const rescueMarkers = rescues.map((r, index) => ({
    id: r.id,
    lat: 28.5355 + (index * 0.011 - 0.005),
    lng: 77.3910 + (index * 0.013 - 0.007),
    title: `${r.animalType}: ${r.description?.slice(0, 30) || 'Rescue'}`,
    subtitle: r.location,
    urgency: r.urgency
  }));

  return (
    <div className="dashboard-content-layout">
      {/* 1. Hero Card matching IMAGE 2 (RIGHT) */}
      <section className="hero-banner-card">
        <div className="hero-banner-inner">
          <div className="hero-art-wrapper">
            <RescuerHeroArt />
          </div>
          
          <div className="hero-greeting-text">
            <h1 className="hero-title">Good morning, {getFirstName()}!</h1>
            <p className="hero-subtitle">
              Together we can save more lives <span className="heart-pink">♥</span>
            </p>
          </div>

          <div className="hero-handwritten-note">
            <p className="note-line-1">Every</p>
            <p className="note-line-2">life matters</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
              <PawPrint size={18} fill="#2d6a4f" color="#2d6a4f" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Top Stat Cards (4 compact cards in a row) */}
      <section className="quick-actions-grid stats-grid">
        <div className="stat-card stat-peach">
          <div className="stat-icon-circle bg-peach-icon">
            <AlertTriangle size={18} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Cases</span>
            <span className="stat-value">{stats.pendingCases}</span>
          </div>
        </div>

        <div className="stat-card stat-sage">
          <div className="stat-icon-circle bg-sage-icon">
            <PawPrint size={18} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Rescues</span>
            <span className="stat-value">{stats.activeRescues}</span>
          </div>
        </div>

        <div className="stat-card stat-lavender">
          <div className="stat-icon-circle bg-lavender-icon">
            <CheckCircle2 size={18} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon-circle bg-blue-icon">
            <Heart size={18} strokeWidth={2.2} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Animals Helped</span>
            <span className="stat-value">{stats.totalAnimalsHelped}</span>
          </div>
        </div>
      </section>

      {/* 3. Main Dashboard Grid: Left (Requests & Timeline) + Right (Actions, Map, Messages) */}
      <div className="rescuer-main-grid">
        {/* Left Column (Approx 65%) */}
        <div className="rescuer-left-col">
          {/* Nearby Rescue Requests */}
          <section className="section-panel">
            <div className="section-panel-header">
              <h2 className="section-panel-title">Nearby Rescue Requests</h2>
              <span className="section-view-all" onClick={() => navigate('/cases')}>
                View All <ArrowRight size={13} />
              </span>
            </div>

            <div className="rescue-requests-list">
              {rescues.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No active pending rescue requests in your area right now.
                </div>
              ) : (
                rescues.slice(0, 4).map((r) => (
                  <div key={r.id} className="rescue-request-row">
                    <div className="rescue-thumb-wrap">
                      <img 
                        src={r.photoUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=150'} 
                        alt={r.animalType} 
                      />
                    </div>

                    <div className="rescue-info-col">
                      <div className="rescue-title-badge-line">
                        <span className="rescue-item-title">
                          {r.animalType} ({r.description?.slice(0, 16) || 'Needs assistance'})
                        </span>
                        {getUrgencyBadge(r.urgency)}
                      </div>
                      <div className="rescue-location-line">
                        <MapPin size={13} className="text-muted" />
                        <span>{r.location || 'Sector 15, Noida • 1.2 km'}</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-view-details"
                      onClick={() => setSelectedRescue(r)}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Activity (Vertical Timeline) */}
          <section className="section-panel">
            <div className="section-panel-header">
              <h2 className="section-panel-title">Recent Activity</h2>
            </div>

            <div className="activity-timeline-container">
              {activities.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No recent activities recorded.
                </div>
              ) : (
                activities.slice(0, 4).map((act, idx) => (
                  <div key={act.id || idx} className="timeline-item-row">
                    <div className="timeline-indicator-col">
                      <div className="timeline-check-circle">
                        <CheckCircle2 size={14} />
                      </div>
                      {idx < 3 && <div className="timeline-connecting-line" />}
                    </div>
                    <div className="timeline-content-col">
                      <p className="timeline-text">{act.description || act.text}</p>
                      <span className="timeline-time">{act.timeAgo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Bottom Rescuer Banner */}
          <div className="rescuer-bottom-banner">
            <div className="bottom-banner-content">
              <div className="bottom-banner-badge">
                <PawPrint size={20} />
              </div>
              <div className="bottom-banner-text">
                <h3 className="bottom-banner-title">Every rescue matters</h3>
                <p className="bottom-banner-subtitle">Report. Connect. Save.</p>
              </div>
              <button 
                type="button" 
                className="btn-opportunities"
                onClick={() => navigate('/cases')}
              >
                <span>View Opportunities</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="bottom-banner-art">
              <RescueBannerArt />
            </div>
          </div>
        </div>

        {/* Right Column (Approx 35%) */}
        <div className="rescuer-right-col">
          {/* Quick Actions (4 compact colored cards in 2x2 grid) */}
          <section className="section-panel">
            <div className="section-panel-header">
              <h2 className="section-panel-title">Quick Actions</h2>
            </div>

            <div className="rescuer-actions-2x2">
              <div className="action-pill-card action-peach" onClick={() => setShowReport(true)}>
                <div className="action-icon-circle bg-peach-icon">
                  <Megaphone size={18} strokeWidth={2.2} />
                </div>
                <span className="action-card-label">Report a Case</span>
              </div>

              <div className="action-pill-card action-sage" onClick={() => {
                if (providers.length > 0) setSelectedProvider(providers[0]);
              }}>
                <div className="action-icon-circle bg-sage-icon">
                  <MapPin size={18} strokeWidth={2.2} />
                </div>
                <span className="action-card-label">Find Nearby Help</span>
              </div>

              <div className="action-pill-card action-lavender" onClick={() => {
                const vet = providers.find(p => p.type?.toLowerCase().includes('vet')) || providers[0];
                if (vet) setSelectedProvider(vet);
              }}>
                <div className="action-icon-circle bg-lavender-icon">
                  <Stethoscope size={18} strokeWidth={2.2} />
                </div>
                <span className="action-card-label">Contact Vet</span>
              </div>

              <div className="action-pill-card action-blue" onClick={() => {
                const ngo = providers.find(p => p.type?.toLowerCase().includes('shelter') || p.type?.toLowerCase().includes('ngo')) || providers[0];
                if (ngo) setSelectedProvider(ngo);
              }}>
                <div className="action-icon-circle bg-blue-icon">
                  <Building2 size={18} strokeWidth={2.2} />
                </div>
                <span className="action-card-label">Connect with NGO</span>
              </div>
            </div>
          </section>

          {/* Active Rescue Map */}
          <section className="section-panel">
            <div className="section-panel-header">
              <h2 className="section-panel-title">Active Rescue Map</h2>
            </div>

            <div className="active-map-wrapper">
              <LeafletMap
                center={[28.5355, 77.3910]}
                zoom={13}
                markers={rescueMarkers}
                height="170px"
              />
              <button 
                type="button" 
                className="btn-map-overlay"
                onClick={() => navigate('/cases')}
              >
                <span>View Full Map</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </section>

          {/* Messages Preview */}
          <section className="section-panel">
            <div className="section-panel-header">
              <h2 className="section-panel-title">Messages</h2>
              <span className="section-view-all" onClick={() => navigate('/messages')}>
                View All <ArrowRight size={13} />
              </span>
            </div>

            <div className="messages-list-preview">
              {messages.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No messages yet.
                </div>
              ) : (
                messages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="message-preview-item">
                    <img 
                      src={msg.avatarUrl || msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                      alt={msg.senderName} 
                      className="msg-avatar-circle" 
                    />
                    <div className="msg-content-block">
                      <div className="msg-sender-line">
                        <span className="msg-sender-name">{msg.senderName}</span>
                        <span className="msg-sender-role">({msg.senderRole})</span>
                      </div>
                      <p className="msg-preview-text">{msg.messagePreview || msg.text}</p>
                      <span className="msg-time-stamp">{msg.timeAgo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {selectedRescue && (
        <RescueDetailModal
          isOpen={!!selectedRescue}
          rescue={selectedRescue}
          onClose={() => setSelectedRescue(null)}
          onStatusChange={loadRescuerData}
        />
      )}

      {showReport && (
        <ReportAnimalModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          onReported={loadRescuerData}
        />
      )}

      {selectedProvider && (
        <CallHelpModal
          isOpen={!!selectedProvider}
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}
