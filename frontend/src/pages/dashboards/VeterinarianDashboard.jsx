import React, { useState, useEffect } from 'react';
import { Stethoscope, PawPrint, Calendar, AlertCircle, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { animalApi } from '../../api/animalApi';
import { rescueApi } from '../../api/rescueApi';
import PetDetailModal from '../../components/modals/PetDetailModal';
import RescueDetailModal from '../../components/modals/RescueDetailModal';

export default function VeterinarianDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [emergencyCases, setEmergencyCases] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedRescue, setSelectedRescue] = useState(null);

  useEffect(() => {
    loadVetData();
  }, [user]);

  const loadVetData = async () => {
    try {
      const [allAnimals, criticalRescues] = await Promise.all([
        animalApi.getAllAnimals(),
        rescueApi.getRescues('PENDING')
      ]);
      setPatients(allAnimals || []);
      setEmergencyCases(criticalRescues || []);
    } catch (err) {
      console.error('Failed to load vet data:', err);
    }
  };

  return (
    <div className="content-body">
      {/* Vet Hero */}
      <section className="hero-card hero-owner">
        <div className="hero-left">
          <div className="hero-avatar-art" style={{ background: '#E0E7FF' }}>
            <Stethoscope size={48} color="#4F46E5" />
          </div>
          <div className="hero-text">
            <h1>Good morning, {user?.name || 'Doctor'}!</h1>
            <p>Veterinary Care & Clinical Records Portal • BrunoVerse</p>
          </div>
        </div>
        <div className="hero-quote-box">
          <span>Healing paws</span>
          <span>Saving lives ♥</span>
        </div>
      </section>

      {/* Vet Stat Cards */}
      <section className="stats-row">
        <div className="stat-card" style={{ background: '#EEF2FF', border: '1px solid #E0E7FF' }}>
          <div className="stat-icon-wrap" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
            <PawPrint size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Registered Patients</span>
            <span className="stat-number">{patients.length}</span>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
          <div className="stat-icon-wrap" style={{ background: '#FDE68A', color: '#D97706' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Medical Alerts</span>
            <span className="stat-number">{emergencyCases.length}</span>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#DCFCE7', border: '1px solid #BBF7D0' }}>
          <div className="stat-icon-wrap" style={{ background: '#BBF7D0', color: '#16A34A' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Consultations Done</span>
            <span className="stat-number">18</span>
          </div>
        </div>

        <div className="stat-card" style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}>
          <div className="stat-icon-wrap" style={{ background: '#E2E8F0', color: '#475569' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-title">Upcoming Appointments</span>
            <span className="stat-number">4</span>
          </div>
        </div>
      </section>

      {/* Patients & Emergency Cases */}
      <div className="dashboard-grid">
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Animal Patients & Medical History</h2>
          </div>
          <div className="pets-carousel">
            {patients.map((pet) => (
              <div key={pet.id} className="pet-card" onClick={() => setSelectedPet(pet)}>
                <div className="pet-img-wrap">
                  <img src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'} alt={pet.name} />
                </div>
                <div className="pet-card-title">
                  <span className="pet-name">{pet.name}</span>
                  <span className="pet-gender-badge">{pet.gender === 'Female' ? '♀' : '♂'}</span>
                </div>
                <div className="pet-details-text">{pet.type} • Owner: {pet.owner?.name || 'Owner'}</div>
                <button className="btn-pill-sm" style={{ marginTop: '4px' }}>Open Chart</button>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Critical Rescue Consultations</h2>
          </div>
          <div className="rescue-requests-list">
            {emergencyCases.slice(0, 4).map((c) => (
              <div key={c.id} className="rescue-case-card" onClick={() => setSelectedRescue(c)} style={{ cursor: 'pointer' }}>
                <div className="rescue-case-left">
                  <img src={c.photoUrl} alt={c.animalType} className="rescue-case-img" />
                  <div className="rescue-case-info">
                    <span className="rescue-case-title">{c.animalType}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.location}</span>
                  </div>
                </div>
                <button className="btn-pill-sm">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PetDetailModal pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} onPetDeleted={loadVetData} />
      <RescueDetailModal rescue={selectedRescue} isOpen={!!selectedRescue} onClose={() => setSelectedRescue(null)} onStatusUpdated={loadVetData} />
    </div>
  );
}
