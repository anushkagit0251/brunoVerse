import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Building2, Phone, MapPin, Navigation, Star, 
  Globe, Clock, Search, Filter, ShieldAlert, ExternalLink, 
  Heart, AlertTriangle, Crosshair, AlertCircle, RefreshCw
} from 'lucide-react';
import { vetApi } from '../api/vetApi';
import { helpProviderApi } from '../api/helpProviderApi';
import { rescueApi } from '../api/rescueApi';
import LeafletMap from '../components/common/LeafletMap';

export default function NearbyHelpPage() {
  const [vets, setVets] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  const [activeTab, setActiveTab] = useState('VET'); // VET, NGO, SHELTER, RESCUES, ALL
  const [searchQuery, setSearchQuery] = useState('');
  
  // Geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('prompt'); // prompt, granted, denied

  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      loadDefaultPlaces(28.5355, 77.3910);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
        setLocationStatus('granted');
        loadPlacesForLocation(lat, lng);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setLocationStatus('denied');
        // Default to NCR center coordinates
        setUserLocation([28.5355, 77.3910]);
        loadDefaultPlaces(28.5355, 77.3910);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const loadPlacesForLocation = async (lat, lng) => {
    setLoading(true);
    try {
      const [vetsData, ngosData, sheltersData, rescuesData] = await Promise.all([
        vetApi.getNearbyVets(lat, lng, 12000),
        helpProviderApi.getNearbyNGOs(),
        helpProviderApi.getNearbyShelters(),
        rescueApi.getAllRescues()
      ]);

      setVets(vetsData || []);
      setNgos(ngosData || []);
      setShelters(sheltersData || []);
      setRescues(rescuesData || []);
    } catch (err) {
      console.error('Failed to load nearby places:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultPlaces = async (lat, lng) => {
    setLoading(true);
    try {
      const [vetsData, ngosData, sheltersData, rescuesData] = await Promise.all([
        vetApi.getNearbyVets(lat, lng, 15000),
        helpProviderApi.getNearbyNGOs(),
        helpProviderApi.getNearbyShelters(),
        rescueApi.getAllRescues()
      ]);

      setVets(vetsData || []);
      setNgos(ngosData || []);
      setShelters(sheltersData || []);
      setRescues(rescuesData || []);
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      if (userLocation) {
        loadPlacesForLocation(userLocation[0], userLocation[1]);
      } else {
        loadDefaultPlaces(28.5355, 77.3910);
      }
      return;
    }

    setSearching(true);
    try {
      const lat = userLocation ? userLocation[0] : null;
      const lng = userLocation ? userLocation[1] : null;
      const results = await vetApi.searchVets(searchQuery.trim(), lat, lng);
      setVets(results || []);
      setActiveTab('VET');
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  // Map markers preparation
  const mapMarkers = [
    // Real Vets markers
    ...vets.map(v => ({
      lat: v.latitude || 28.5355,
      lng: v.longitude || 77.3910,
      title: v.name,
      subtitle: `Veterinary Clinic • ${v.distance} • ${v.phone}`,
      type: 'VET',
      rating: v.rating,
      phone: v.phone,
      directionsUrl: v.directionsUrl || vetApi.getDirectionsUrl(v)
    })),
    // NGOs markers
    ...ngos.map(n => ({
      lat: n.latitude || 28.5455,
      lng: n.longitude || 77.3810,
      title: n.name,
      subtitle: `Animal Welfare NGO • ${n.distance || ''} • ${n.phone}`,
      type: 'NGO',
      rating: n.rating,
      phone: n.phone,
      directionsUrl: n.directionsUrl || helpProviderApi.getDirections(n)
    })),
    ...rescues.slice(0, 8).map((r, i) => ({
      lat: r.latitude || (28.5355 + ((i % 5) - 2) * 0.008),
      lng: r.longitude || (77.3910 + ((i % 4) - 1.5) * 0.008),
      title: `SOS: ${r.animalType} (${r.urgency || 'URGENT'})`,
      subtitle: `${r.location} • ${r.description}`,
      type: 'EMERGENCY',
      urgency: r.urgency
    }))
  ];

  return (
    <div className="dashboard-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '13px', background: '#eef7f0', padding: '6px 14px', borderRadius: '16px', marginBottom: '8px' }}>
          <Stethoscope size={16} />
          <span>Real-Time Veterinary & Rescue Directory</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Nearby Veterinary Clinics & Animal Welfare Services
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          GPS-powered live directory of licensed veterinary hospitals, animal trauma centers, verified welfare NGOs, and emergency rescue distress signals.
        </p>
      </div>

      {/* Location Permission Notification Banner */}
      {locationStatus === 'denied' && (
        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fde68a', 
          borderRadius: '16px', 
          padding: '14px 18px', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="#d97706" />
            <div>
              <strong style={{ fontSize: '14px', color: '#92400e' }}>Location Access Needed For Live GPS Distances</strong>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#b45309' }}>
                Location permission was denied or unavailable. You can search by City, Area, or PIN code below, or grant permission.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestUserLocation}
            style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fcd34d',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Crosshair size={14} />
            <span>Enable GPS Location</span>
          </button>
        </div>
      )}

      {/* Search Bar: City, Area, PIN Code, Clinic Name */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by City (e.g. Delhi, Mumbai), Area, PIN Code (e.g. 110001), or Clinic Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 16px 13px 44px',
              borderRadius: '16px',
              border: '1.5px solid var(--border-color)',
              background: '#ffffff',
              fontSize: '14px',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={searching}
          style={{ padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {searching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
          <span>{searching ? 'Searching...' : 'Search Places'}</span>
        </button>
      </form>

      {/* Interactive Leaflet Map */}
      <div className="section-card" style={{ padding: '16px', borderRadius: '22px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
            <MapPin size={18} color="var(--primary)" />
            <span>Live Interactive Map (Clinics, NGOs & Rescue Signals)</span>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2d6a4f' }} /> Veterinary Clinics
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} /> NGOs & Shelters
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> SOS Rescues
            </span>
          </div>
        </div>

        <LeafletMap 
          center={userLocation || [28.5355, 77.3910]}
          zoom={12}
          markers={mapMarkers}
          height="380px"
        />
      </div>

      {/* Directory Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveTab('VET')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'VET' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'VET' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Stethoscope size={16} />
          <span>Veterinary Clinics ({vets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NGO')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'NGO' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'NGO' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Building2 size={16} />
          <span>Animal NGOs ({ngos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SHELTER')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'SHELTER' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'SHELTER' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Heart size={16} />
          <span>Shelters ({shelters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RESCUES')}
          style={{
            padding: '8px 18px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'RESCUES' ? '#ef4444' : 'transparent',
            color: activeTab === 'RESCUES' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldAlert size={16} />
          <span>SOS Distress Signals ({rescues.length})</span>
        </button>
      </div>

      {/* Directory Listings */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading verified places near you...</p>
        </div>
      ) : (
        <>
          {/* 1. Veterinary Clinics Tab */}
          {activeTab === 'VET' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
              {vets.map(vet => (
                <div 
                  key={vet.id}
                  className="section-card"
                  style={{
                    borderRadius: '20px',
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Clinic Photo & Status Badge */}
                  <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={vet.photoUrl || "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&q=80"} 
                      alt={vet.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      left: '12px', 
                      background: vet.openNow ? 'rgba(34, 197, 94, 0.92)' : 'rgba(100, 116, 139, 0.92)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      <span>{vet.openNow ? 'OPEN NOW' : 'CLOSED'}</span>
                    </div>

                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      background: 'rgba(255,255,255,0.92)',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span>{vet.rating?.toFixed(1) || '4.8'}</span>
                      {vet.reviewCount && <span style={{ fontSize: '11px', color: '#64748b' }}>({vet.reviewCount})</span>}
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {vet.distance || 'Nearby'}
                    </div>
                  </div>

                  {/* Clinic Info */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
                      {vet.name}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      <MapPin size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{vet.address}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '18px' }}>
                      <Phone size={14} color={vet.phone ? "#ea580c" : "#94a3b8"} />
                      <span>{vet.phone || 'Phone not listed'}</span>
                    </div>

                    {/* Action Buttons: Call, Directions, Website */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {vet.phone ? (
                        <button
                          type="button"
                          onClick={() => vetApi.callClinic(vet.phone)}
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '9px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Phone size={14} />
                          <span>Call Vet</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          style={{
                            flex: 1,
                            minWidth: '100px',
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            border: 'none',
                            padding: '9px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Phone size={14} />
                          <span>No Phone</span>
                        </button>
                      )}

                      <a
                        href={vet.directionsUrl || vetApi.getDirectionsUrl(vet)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          minWidth: '110px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          border: '1px solid #cbd5e1',
                          padding: '9px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Navigation size={14} color="var(--primary)" />
                        <span>Directions</span>
                      </a>

                      {vet.website && (
                        <a
                          href={vet.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '9px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                          title="Visit Official Website"
                        >
                          <Globe size={14} />
                          <span>Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. NGOs Tab */}
          {activeTab === 'NGO' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
              {ngos.map(ngo => (
                <div key={ngo.id} className="section-card" style={{ borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                      <Building2 size={13} />
                      <span>Registered NGO</span>
                    </div>
                    {ngo.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, color: '#b45309' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span>{ngo.rating}</span>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {ngo.name}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <MapPin size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{ngo.address}</span>
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => helpProviderApi.callProvider(ngo.phone)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '9px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Phone size={14} />
                      <span>Call NGO</span>
                    </button>
                    <a
                      href={helpProviderApi.getDirections(ngo)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ flex: 1, padding: '9px 12px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Navigation size={14} />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Shelters Tab */}
          {activeTab === 'SHELTER' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
              {shelters.map(shelter => (
                <div key={shelter.id} className="section-card" style={{ borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fdf2f8', color: '#be185d', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, marginBottom: '8px', alignSelf: 'flex-start' }}>
                    <Heart size={13} />
                    <span>Animal Shelter & Sanctuary</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {shelter.name}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', display: 'flex', gap: '6px' }}>
                    <MapPin size={15} color="#db2777" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{shelter.address}</span>
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => helpProviderApi.callProvider(shelter.phone)}
                      className="btn-primary"
                      style={{ flex: 1, padding: '9px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Phone size={14} />
                      <span>Call Shelter</span>
                    </button>
                    <a
                      href={helpProviderApi.getDirections(shelter)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ flex: 1, padding: '9px 12px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Navigation size={14} />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Rescues Distress Signals Tab */}
          {activeTab === 'RESCUES' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
              {rescues.map(rescue => (
                <div key={rescue.id} className="section-card" style={{ borderRadius: '20px', padding: '20px', border: '1px solid #fee2e2', background: '#fffafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontWeight: 800,
                      background: rescue.urgency === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                      color: rescue.urgency === 'CRITICAL' ? '#dc2626' : '#d97706'
                    }}>
                      {rescue.urgency || 'HIGH'} PRIORITY
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{rescue.animalType}</span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                    {rescue.condition || rescue.description?.substring(0, 45) || 'Injured Animal Reported'}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '10px', lineHeight: 1.4 }}>
                    {rescue.description}
                  </p>

                  <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                    <MapPin size={14} color="#ef4444" />
                    <span>{rescue.location}</span>
                  </div>

                  {rescue.phone && (
                    <button
                      type="button"
                      onClick={() => window.location.href = `tel:${rescue.phone}`}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '12px',
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Phone size={14} />
                      <span>Call Reporter ({rescue.phone})</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
