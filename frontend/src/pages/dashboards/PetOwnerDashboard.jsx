import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  MapPin, 
  Stethoscope, 
  FileText, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Syringe, 
  Pill, 
  Calendar,
  Compass,
  PawPrint,
  Clock,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { animalApi } from '../../api/animalApi';
import { medicalApi } from '../../api/medicalApi';
import { helpApi } from '../../api/helpApi';
import { communityApi } from '../../api/communityApi';
import PetOwnerHeroArt from '../../components/illustrations/PetOwnerHeroArt';
import ReportBannerArt from '../../components/illustrations/ReportBannerArt';
import AskAiArt from '../../components/illustrations/AskAiArt';
import LeafletMap from '../../components/common/LeafletMap';
import AddPetModal from '../../components/modals/AddPetModal';
import PetDetailModal from '../../components/modals/PetDetailModal';
import ReportAnimalModal from '../../components/modals/ReportAnimalModal';
import AskAiModal from '../../components/modals/AskAiModal';
import CallHelpModal from '../../components/modals/CallHelpModal';

export default function PetOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddPet, setShowAddPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const [petsData, remindersData, providersData, communityData] = await Promise.all([
        animalApi.getAnimalsByOwner(user.userId).catch(() => []),
        medicalApi.getByOwner(user.userId).catch(() => []),
        helpApi.getAll().catch(() => []),
        communityApi.getAll().catch(() => [])
      ]);

      setPets(petsData || []);
      setReminders(remindersData || []);
      setProviders(providersData || []);
      setPosts(communityData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFirstName = () => {
    if (!user?.name) return 'Friend';
    return user.name.split(' ')[0];
  };

  // Map markers from providers
  const mapMarkers = providers.map((p, index) => ({
    id: p.id,
    lat: 28.5355 + (index * 0.012 - 0.006),
    lng: 77.3910 + (index * 0.015 - 0.008),
    title: p.name,
    subtitle: `${p.distance} • ${p.type}`,
    type: p.type?.toUpperCase()
  }));

  return (
    <div className="dashboard-content-layout">
      {/* 1. Hero Card matching IMAGE 2 (LEFT) */}
      <section className="hero-banner-card">
        <div className="hero-banner-inner">
          <div className="hero-art-wrapper">
            <PetOwnerHeroArt />
          </div>
          
          <div className="hero-greeting-text">
            <h1 className="hero-title">Good morning, {user?.name || 'Friend'}!</h1>
            <p className="hero-subtitle">
              Your little companions make the world brighter <span className="heart-pink">♥</span>
            </p>
          </div>

          <div className="hero-handwritten-note">
            <div className="note-sunburst">✦</div>
            <p className="note-line-1">Kindness</p>
            <p className="note-line-2">goes a long way</p>
            <p className="note-line-3">for them <span className="heart-pink">♥</span></p>
          </div>
        </div>
      </section>

      {/* 2. Quick Action Cards (4 compact colored cards) */}
      <section className="quick-actions-grid">
        <div className="action-pill-card action-peach" onClick={() => setShowReport(true)}>
          <div className="action-icon-circle bg-peach-icon">
            <Megaphone size={20} strokeWidth={2.2} />
          </div>
          <span className="action-card-label">Report an Animal in Need</span>
        </div>

        <div className="action-pill-card action-sage" onClick={() => navigate('/nearby-help')}>
          <div className="action-icon-circle bg-sage-icon">
            <MapPin size={20} strokeWidth={2.2} />
          </div>
          <span className="action-card-label">Find Nearby Help</span>
        </div>

        <div className="action-pill-card action-lavender" onClick={() => navigate('/nearby-help')}>
          <div className="action-icon-circle bg-lavender-icon">
            <Stethoscope size={20} strokeWidth={2.2} />
          </div>
          <span className="action-card-label">Book Veterinary Consultation</span>
        </div>

        <div className="action-pill-card action-blue" onClick={() => navigate('/pets')}>
          <div className="action-icon-circle bg-blue-icon">
            <FileText size={20} strokeWidth={2.2} />
          </div>
          <span className="action-card-label">View My Pet Records</span>
        </div>
      </section>

      {/* 3. Row 1: My Pets (Left) & Upcoming Reminders (Right) */}
      <div className="dashboard-two-col-row">
        {/* Left: My Pets Section */}
        <section className="section-panel pets-panel">
          <div className="section-panel-header">
            <h2 className="section-panel-title">My Pets</h2>
            <span className="section-view-all" onClick={() => navigate('/pets')}>
              View All <ArrowRight size={13} />
            </span>
          </div>

          <div className="pets-row-container">
            {pets.map((pet) => (
              <div 
                key={pet.id} 
                className="pet-item-card"
                onClick={() => setSelectedPet(pet)}
              >
                <div className="pet-avatar-wrapper">
                  <img 
                    src={pet.photoUrl || (pet.type === 'CAT' 
                      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80'
                      : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80')} 
                    alt={pet.name} 
                    className="pet-avatar-img"
                  />
                </div>
                <div className="pet-header-line">
                  <span className="pet-card-name">{pet.name}</span>
                  <span className="pet-gender-sym">{pet.gender === 'Female' ? '♀' : '♂'}</span>
                </div>
                <div className="pet-meta-line">
                  {pet.type === 'DOG' ? 'Dog' : pet.type === 'CAT' ? 'Cat' : pet.type} • {pet.age} {pet.age === 1 ? 'year' : 'years'}
                </div>
                <div className="pet-badge-wrapper">
                  <span className="badge-pill badge-healthy">
                    ✓ Healthy
                  </span>
                </div>
              </div>
            ))}

            {/* Add a Pet Card */}
            <div className="add-pet-dashed-card" onClick={() => setShowAddPet(true)}>
              <div className="add-pet-paw-icon">
                <PawPrint size={24} />
                <span className="plus-overlay">+</span>
              </div>
              <span className="add-pet-label">Add a Pet</span>
            </div>
          </div>
        </section>

        {/* Right: Upcoming Reminders */}
        <section className="section-panel reminders-panel">
          <div className="section-panel-header">
            <h2 className="section-panel-title">Upcoming Reminders</h2>
            <span className="section-view-all" onClick={() => navigate('/pets')}>
              View All <ArrowRight size={13} />
            </span>
          </div>

          <div className="reminders-list-container">
            {reminders.length === 0 ? (
              <div className="empty-reminders-box">
                <Calendar size={28} className="text-muted" />
                <p>No pending reminders for your pets.</p>
                <button type="button" className="btn-link-action" onClick={() => setShowAddPet(true)}>
                  + Add Medical Reminder
                </button>
              </div>
            ) : (
              reminders.slice(0, 3).map((rec) => {
                const isVaccine = rec.title?.toLowerCase().includes('vaccine');
                const isDeworm = rec.title?.toLowerCase().includes('deworm');
                return (
                  <div key={rec.id} className="reminder-compact-row">
                    <div className={`reminder-icon-circle ${isVaccine ? 'icon-peach' : isDeworm ? 'icon-orange' : 'icon-red'}`}>
                      {isVaccine ? <Syringe size={17} /> : isDeworm ? <Pill size={17} /> : <Calendar size={17} />}
                    </div>
                    <div className="reminder-text-group">
                      <div className="reminder-title-text">{rec.title}</div>
                      <div className="reminder-due-text">
                        {rec.description || (isVaccine ? 'Due in 12 days' : isDeworm ? 'Due in 1 month' : 'Due in 2 months')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* 4. Row 2: Nearby Help Section */}
      <section className="section-panel nearby-help-panel">
        <div className="section-panel-header">
          <h2 className="section-panel-title">Nearby Help</h2>
          <span className="section-view-all" onClick={() => navigate('/nearby-help')}>
            View All <ArrowRight size={13} />
          </span>
        </div>

        <div className="nearby-help-grid">
          {/* Interactive OpenStreetMap Leaflet Map */}
          <div className="help-map-container">
            <LeafletMap 
              center={[28.5355, 77.3910]}
              zoom={13}
              markers={mapMarkers}
              height="190px"
            />
          </div>

          {/* Providers List on the right */}
          <div className="providers-list-col">
            {providers.slice(0, 3).map((p) => {
              const isVet = p.type?.toLowerCase().includes('vet');
              const isShelter = p.type?.toLowerCase().includes('shelter');
              return (
                <div key={p.id} className="provider-card-row">
                  <div className="provider-info-wrap">
                    <div className={`provider-avatar-circle ${isVet ? 'bg-sage-icon' : isShelter ? 'bg-blue-icon' : 'bg-orange-icon'}`}>
                      {isVet ? <Stethoscope size={16} /> : isShelter ? <Compass size={16} /> : <PawPrint size={16} />}
                    </div>
                    <div className="provider-text-wrap">
                      <h4 className="provider-name">{p.name}</h4>
                      <p className="provider-meta">{p.distance} • {p.type}</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    className="provider-cta-btn"
                    onClick={() => setSelectedProvider(p)}
                  >
                    {p.actionLabel || (isVet ? 'Call' : isShelter ? 'Get Directions' : 'Contact')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Row 3: Dual CTA Cards — Report Distress & Ask AI */}
      <div className="dashboard-dual-cta-row">
        {/* Left: Report in distress */}
        <div className="cta-banner-card cta-banner-report">
          <div className="cta-banner-content">
            <div className="cta-icon-pill">
              <PawPrint size={18} />
            </div>
            <h3 className="cta-banner-title">Need help or know an animal in distress?</h3>
            <p className="cta-banner-desc">Report it now and get connected with the right people.</p>
            <button type="button" className="btn-cta-action" onClick={() => setShowReport(true)}>
              <span>Report Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="cta-banner-art-wrap">
            <ReportBannerArt />
          </div>
        </div>

        {/* Right: Ask AI */}
        <div className="cta-banner-card cta-banner-ai">
          <div className="cta-banner-content">
            <div className="cta-icon-pill bg-sparkle">
              <Sparkles size={18} />
            </div>
            <h3 className="cta-banner-title">Ask AI</h3>
            <p className="cta-banner-desc">Get quick answers, care tips and personalized advice for your pet.</p>
            <button type="button" className="btn-cta-action btn-cta-dark" onClick={() => setShowAi(true)}>
              <span>Chat Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="cta-banner-art-wrap">
            <AskAiArt />
          </div>
        </div>
      </div>

      {/* 6. Row 4: Latest from the Community */}
      <section className="section-panel community-preview-panel">
        <div className="section-panel-header">
          <h2 className="section-panel-title">Latest from the Community</h2>
          <span className="section-view-all" onClick={() => navigate('/community')}>
            View All <ArrowRight size={13} />
          </span>
        </div>

        <div className="community-cards-grid">
          {posts.slice(0, 4).map((post) => {
            const isRescue = post.category === 'RESCUE';
            const isMedical = post.category === 'MEDICAL';
            const isFeeding = post.category === 'FEEDING';
            return (
              <div key={post.id} className="community-preview-card" onClick={() => navigate('/community')}>
                <div className="community-card-thumb">
                  <img src={post.photoUrl} alt={post.title} />
                </div>
                <div className="community-card-body">
                  <h4 className="community-card-title">{post.title}</h4>
                  <div className="community-card-footer">
                    <span className={`badge-pill ${isRescue ? 'badge-urgent' : isMedical ? 'badge-lavender' : isFeeding ? 'badge-healthy' : 'badge-amber'}`}>
                      {isRescue ? 'Rescue Needed' : isMedical ? 'Medical Help' : isFeeding ? 'Feeding' : 'Adoption'}
                    </span>
                    <span className="community-time-text">{post.timeAgo || '2h ago'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modals */}
      {showAddPet && (
        <AddPetModal 
          isOpen={showAddPet} 
          onClose={() => setShowAddPet(false)} 
          onPetAdded={loadDashboardData} 
        />
      )}

      {selectedPet && (
        <PetDetailModal 
          isOpen={!!selectedPet} 
          pet={selectedPet} 
          onClose={() => setSelectedPet(null)} 
          onPetDeleted={loadDashboardData}
          onPetUpdated={loadDashboardData}
        />
      )}

      {showReport && (
        <ReportAnimalModal 
          isOpen={showReport} 
          onClose={() => setShowReport(false)} 
          onReportSuccess={loadDashboardData}
        />
      )}

      {showAi && (
        <AskAiModal 
          isOpen={showAi} 
          onClose={() => setShowAi(false)} 
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
