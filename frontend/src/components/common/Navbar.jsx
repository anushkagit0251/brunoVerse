import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, CheckCircle, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { getUserAvatar } from '../../utils/avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const role = user?.role || 'PET_OWNER';

  const formatRoleLabel = (r) => {
    switch (r) {
      case 'PET_OWNER': return 'Pet Owner';
      case 'RESCUER': return 'Rescuer';
      case 'VETERINARIAN': return 'Veterinarian';
      case 'NGO': return 'NGO Partner';
      case 'VOLUNTEER': return 'Volunteer';
      default: return r;
    }
  };

  const getSearchPlaceholder = () => {
    if (role === 'RESCUER') return 'Search for cases, locations, NGOs...';
    if (role === 'VETERINARIAN') return 'Search patients, appointments, medical records...';
    return 'Search for help, vets, NGOs...';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    { id: 1, title: 'Rescue Update', text: 'Stray Cat case has been updated to Medical Help', time: '10m ago', icon: ShieldAlert, color: '#EA580C' },
    { id: 2, title: 'Vaccine Reminder', text: 'Bruno Rabies Vaccine is due in 12 days', time: '1h ago', icon: Calendar, color: '#16A34A' },
    { id: 3, title: 'Community Alert', text: 'Feeding drive starts at 5:00 PM today', time: '3h ago', icon: Heart, color: '#DC2626' },
  ];

  return (
    <header className="top-header">
      {/* Search Input */}
      <div className="header-search">
        <Search size={18} color="#8E9F94" />
        <input 
          type="text" 
          placeholder={getSearchPlaceholder()} 
        />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            className="header-icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={19} />
            <span className="badge-dot" />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '320px',
              background: '#FFFFFF',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid var(--border-light)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 50
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px', borderRadius: '10px', background: '#F8FAF8' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700 }}>{n.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{n.text}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Capsule */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div 
            className="user-profile-btn" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img 
              src={getUserAvatar(user)} 
              alt={user?.name || 'User'} 
              className="user-avatar" 
            />
            <div className="user-info">
              <span className="user-name">{user?.name || 'Guest User'}</span>
              <span className="user-role">{formatRoleLabel(role)}</span>
            </div>
            <ChevronDown size={15} color="#8E9F94" />
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '210px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid var(--border-light)',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 50
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signed in as</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>

              <button 
                onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}
              >
                <User size={16} color="var(--primary)" />
                <span>My Profile</span>
              </button>

              <button 
                onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-red-text)' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
