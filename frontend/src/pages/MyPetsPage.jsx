import React, { useState, useEffect } from 'react';
import { PawPrint, Plus, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { animalApi } from '../api/animalApi';
import AddPetModal from '../components/modals/AddPetModal';
import PetDetailModal from '../components/modals/PetDetailModal';

export default function MyPetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    loadPets();
  }, [user]);

  const loadPets = async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const data = await animalApi.getAnimalsByOwner(user.userId);
      setPets(data || []);
    } catch (err) {
      console.error('Failed to load pets:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-body">
      <div className="section-header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>My Pet Companions</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage medical charts, vaccination timelines, and health profiles
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>Add New Pet</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading pets from database...</div>
      ) : pets.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <PawPrint size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>No Pets Added Yet</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '380px', margin: '6px 0 16px' }}>
            Register your companions to track upcoming vaccines, deworming, and vet consults.
          </p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {pets.map((pet) => (
            <div 
              key={pet.id} 
              className="section-card"
              onClick={() => setSelectedPet(pet)}
              style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <div style={{ width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden', background: '#EAF0EC' }}>
                <img 
                  src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'} 
                  alt={pet.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>{pet.name}</span>
                <span className="badge badge-healthy">Healthy</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {pet.type} • {pet.breed || 'Standard'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {pet.age} {pet.age === 1 ? 'year' : 'years'} old • {pet.gender}
              </div>
              <button className="btn-pill-sm" style={{ marginTop: '8px', alignSelf: 'flex-start' }}>
                View Health Chart & Reminders
              </button>
            </div>
          ))}
        </div>
      )}

      <AddPetModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onPetAdded={loadPets} />
      <PetDetailModal pet={selectedPet} isOpen={!!selectedPet} onClose={() => setSelectedPet(null)} onPetDeleted={loadPets} />
    </div>
  );
}
