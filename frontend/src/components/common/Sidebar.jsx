import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  PawPrint, 
  MapPin, 
  Stethoscope, 
  Users, 
  FileText, 
  Settings, 
  LifeBuoy, 
  MessageSquare,
  Building2,
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SidebarBottomArt from '../illustrations/SidebarBottomArt';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'PET_OWNER';

  const getNavLinks = () => {
    switch (role) {
      case 'RESCUER':
        return [
          { name: 'Home', path: '/dashboard/rescuer', icon: Home },
          { name: 'Nearby Cases', path: '/cases', icon: MapPin },
          { name: 'Rescue Requests', path: '/rescues', icon: LifeBuoy },
          { name: 'My Rescues', path: '/my-rescues', icon: PawPrint },
          { name: 'Vets & NGOs', path: '/vets-ngos', icon: Building2 },
          { name: 'Community', path: '/community', icon: Users },
          { name: 'Learning', path: '/learning', icon: BookOpen },
          { name: 'Messages', path: '/messages', icon: MessageSquare },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'VETERINARIAN':
        return [
          { name: 'Home', path: '/dashboard/veterinarian', icon: Home },
          { name: 'Consultations', path: '/consultations', icon: Stethoscope },
          { name: 'Animal Patients', path: '/pets', icon: PawPrint },
          { name: 'Rescue Cases', path: '/cases', icon: LifeBuoy },
          { name: 'Community', path: '/community', icon: Users },
          { name: 'Learning', path: '/learning', icon: BookOpen },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'NGO':
        return [
          { name: 'Home', path: '/dashboard/ngo', icon: Home },
          { name: 'Rescue Operations', path: '/rescues', icon: LifeBuoy },
          { name: 'Shelter Animals', path: '/pets', icon: PawPrint },
          { name: 'Volunteers', path: '/volunteers', icon: HeartHandshake },
          { name: 'Community', path: '/community', icon: Users },
          { name: 'Learning', path: '/learning', icon: BookOpen },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'VOLUNTEER':
        return [
          { name: 'Home', path: '/dashboard/volunteer', icon: Home },
          { name: 'Assigned Cases', path: '/cases', icon: LifeBuoy },
          { name: 'Feeding Drives', path: '/community', icon: Users },
          { name: 'Nearby Help', path: '/help', icon: MapPin },
          { name: 'Learning', path: '/learning', icon: BookOpen },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      case 'PET_OWNER':
      default:
        return [
          { name: 'Home', path: '/dashboard/owner', icon: Home },
          { name: 'My Pets', path: '/pets', icon: PawPrint },
          { name: 'Find Help', path: '/help', icon: MapPin },
          { name: 'Veterinary', path: '/veterinary', icon: Stethoscope },
          { name: 'Community', path: '/community', icon: Users },
          { name: 'Learning', path: '/learning', icon: BookOpen },
          { name: 'Reports', path: '/reports', icon: FileText },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <PawPrint size={22} strokeWidth={2.4} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">BrunoVerse</span>
          <span className="sidebar-logo-tagline">Care • Connect • Create Change</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const IconComponent = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={18} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Illustrated Footer Art matching IMAGE 2 */}
      <SidebarBottomArt role={role} />
    </aside>
  );
}
