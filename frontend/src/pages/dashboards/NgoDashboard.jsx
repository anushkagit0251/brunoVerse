import React, { useState, useEffect } from 'react';
import { Building2, LifeBuoy, Users, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { rescueApi } from '../../api/rescueApi';
import RescueDetailModal from '../../components/modals/RescueDetailModal';
import ReportAnimalModal from '../../components/modals/ReportAnimalModal';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [rescues, setRescues] = useState([]);
  const [stats, setStats] = useState({ pendingCases: 0, activeRescues: 0, completed: 0, totalAnimalsHelped: 0 });
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    loadNgoData();
  }, [user]);

  const loadNgoData = async () => {
    try {
      const [allRescues, statsData] = await Promise.all([
        rescueApi.getRescues(),
        rescueApi.getStats()
      ]);
      setRescues(allRescues || []);
      setStats(statsData || {});
    } catch (err) {
      console.error('Failed to load NGO data:', err);
    }
  };

  return (
    <div className="content-body">
      <section className="hero-card hero-rescuer">
        <div className="hero-left">
          <div className="hero-avatar-art" style={{ background: '#E2ECE5' }}>
            <Building2 size={48} color="var(--primary)" />
          </div>
          <div className="hero-text">
            <h1>Good morning, {user?.name || 'NGO Partner'}!</h1>
            <p>Shelter Management & Community Welfare Portal</p>
          </div>
        </div>
        <div className="hero-quote-box">
          <span>Uniting for</span>
          <span>Animal Welfare ♥</span>
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-card" style={{ background: '#FFF1EE' }}>
          <div className="stat-icon-wrap" style={{ background: '#FEE2E2', color: '#DC2626' }}><LifeBuoy size={24} /></div>
          <div className="stat-info"><span className="stat-title">Pending Inflow</span><span className="stat-number">{stats.pendingCases}</span></div>
        </div>
        <div className="stat-card" style={{ background: '#EDF7EE' }}>
          <div className="stat-icon-wrap" style={{ background: '#DCFCE7', color: '#16A34A' }}><Users size={24} /></div>
          <div className="stat-info"><span className="stat-title">Active Sheltered</span><span className="stat-number">{stats.activeRescues}</span></div>
        </div>
        <div className="stat-card" style={{ background: '#F0EEFB' }}>
          <div className="stat-icon-wrap" style={{ background: '#EDE9FE', color: '#7C3AED' }}><CheckCircle2 size={24} /></div>
          <div className="stat-info"><span className="stat-title">Successful Adoptions</span><span className="stat-number">{stats.completed}</span></div>
        </div>
        <div className="stat-card" style={{ background: '#EBF5FF' }}>
          <div className="stat-icon-wrap" style={{ background: '#DBEAFE', color: '#2563EB' }}><HeartHandshake size={24} /></div>
          <div className="stat-info"><span className="stat-title">Total Animals Saved</span><span className="stat-number">{stats.totalAnimalsHelped}</span></div>
        </div>
      </section>

      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Shelter Operations & Rescue Inflow</h2>
          <button className="btn-pill-primary" onClick={() => setShowReport(true)}>+ Report Direct Intake</button>
        </div>
        <div className="rescue-requests-list">
          {rescues.slice(0, 6).map((c) => (
            <div key={c.id} className="rescue-case-card" onClick={() => setSelectedRescue(c)} style={{ cursor: 'pointer' }}>
              <div className="rescue-case-left">
                <img src={c.photoUrl} alt={c.animalType} className="rescue-case-img" />
                <div className="rescue-case-info">
                  <span className="rescue-case-title">{c.animalType}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.location} • Status: {c.status}</span>
                </div>
              </div>
              <button className="btn-pill-sm">Manage Case</button>
            </div>
          ))}
        </div>
      </div>

      <RescueDetailModal rescue={selectedRescue} isOpen={!!selectedRescue} onClose={() => setSelectedRescue(null)} onStatusUpdated={loadNgoData} />
      <ReportAnimalModal isOpen={showReport} onClose={() => setShowReport(false)} onReportSuccess={loadNgoData} />
    </div>
  );
}
