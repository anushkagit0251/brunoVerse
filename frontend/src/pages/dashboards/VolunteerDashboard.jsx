import React, { useState, useEffect } from 'react';
import { HeartHandshake, MapPin, LifeBuoy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rescueApi } from '../../api/rescueApi';
import { helpApi } from '../../api/helpApi';
import RescueDetailModal from '../../components/modals/RescueDetailModal';
import ReportAnimalModal from '../../components/modals/ReportAnimalModal';
import CallHelpModal from '../../components/modals/CallHelpModal';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [rescues, setRescues] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    loadVolunteerData();
  }, [user]);

  const loadVolunteerData = async () => {
    try {
      const [pendingRescues, providersData] = await Promise.all([
        rescueApi.getRescues('PENDING'),
        helpApi.getAll()
      ]);
      setRescues(pendingRescues || []);
      setProviders(providersData || []);
    } catch (err) {
      console.error('Failed to load volunteer data:', err);
    }
  };

  return (
    <div className="content-body">
      <section className="hero-card hero-owner">
        <div className="hero-left">
          <div className="hero-avatar-art" style={{ background: '#DCFCE7' }}>
            <HeartHandshake size={48} color="var(--primary)" />
          </div>
          <div className="hero-text">
            <h1>Good morning, {user?.name || 'Volunteer'}!</h1>
            <p>Every small effort feeds a hungry stray and saves a life ♥</p>
          </div>
        </div>
        <div className="hero-quote-box">
          <span>Community Compassion</span>
          <span>In Action ♥</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Nearby Rescue Alerts (Assistance Needed)</h2>
            <button className="btn-pill-primary" onClick={() => setShowReport(true)}>Report Stray</button>
          </div>
          <div className="rescue-requests-list">
            {rescues.map((c) => (
              <div key={c.id} className="rescue-case-card" onClick={() => setSelectedRescue(c)} style={{ cursor: 'pointer' }}>
                <div className="rescue-case-left">
                  <img src={c.photoUrl} alt={c.animalType} className="rescue-case-img" />
                  <div className="rescue-case-info">
                    <span className="rescue-case-title">{c.animalType}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.location}</span>
                  </div>
                </div>
                <button className="btn-pill-sm">Volunteer to Assist</button>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Shelters & Clinics Nearby</h2>
          </div>
          <div className="help-providers-list">
            {providers.map((p) => (
              <div key={p.id} className="help-provider-item">
                <div className="provider-info-left">
                  <div>
                    <h4 style={{ fontSize: '13px' }}>{p.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.distance} • {p.type}</p>
                  </div>
                </div>
                <button className="btn-pill-sm" onClick={() => setSelectedProvider(p)}>Contact</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RescueDetailModal rescue={selectedRescue} isOpen={!!selectedRescue} onClose={() => setSelectedRescue(null)} onStatusUpdated={loadVolunteerData} />
      <ReportAnimalModal isOpen={showReport} onClose={() => setShowReport(false)} onReportSuccess={loadVolunteerData} />
      <CallHelpModal provider={selectedProvider} isOpen={!!selectedProvider} onClose={() => setSelectedProvider(null)} />
    </div>
  );
}
