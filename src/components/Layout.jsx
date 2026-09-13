import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Map, CheckSquare, MessageSquare, Phone, Activity, X, Award, Package, Settings, LogOut, Shield, Network, Radio, ShieldAlert, Search, Heart, Building2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LANGUAGES, THEMES } from '../config/languages';
import Chat from './Community/Chat';
import ActiveDispatchPanel from './ActiveDispatchPanel';
import SOSReportModal from './SOSReportModal';
import './Layout.css';

export default function Layout() {
  const { t } = useTranslation();
  const { tasks, logout, currentUser, emergencyMode, toggleEmergencyMode, theme, setTheme, language, setLanguage, networkState, messengerSettings, updateMessengerSettings } = useAppContext();
  const [showChat, setShowChat] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const unassignedCount = tasks.filter(task => task.status === 'Reported').length;

  return (
    <div className={`layout ${emergencyMode ? 'emergency-active' : ''}`}>
      {emergencyMode && (
        <div className="emergency-ticker">
          <div className="ticker-content">
            {t('common.emergency_notice')} • {t('common.emergency_notice')} • {t('common.emergency_notice')}
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="brand">
          <div className="brand-logo">
            <Shield size={24} fill="var(--primary)" stroke="var(--primary)" />
          </div>
          <span className="brand-text">FaunaNet</span>
        </div>

        <div className="nav-links">
          <NavLink to="/app" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Home size={22} />
            <span>{t('nav.dashboard')}</span>
          </NavLink>

          <NavLink to="/app/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Map size={22} />
            <span>{t('nav.map')}</span>
          </NavLink>

          <NavLink to="/app/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <CheckSquare size={22} />
              {unassignedCount > 0 && <span className="badge-count">{unassignedCount}</span>}
            </div>
            <span>{t('nav.tasks')}</span>
          </NavLink>

          <NavLink to="/app/health" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={22} />
            <span>{t('nav.health')}</span>
          </NavLink>

          <NavLink to="/app/training" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Award size={22} />
            <span>{t('nav.training')}</span>
          </NavLink>

          <NavLink to="/app/ecosystem" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Network size={22} />
            <span>Ecosystem</span>
          </NavLink>

          {['ngo', 'shelter', 'admin'].includes(currentUser?.role) && (
            <NavLink to="/app/assets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Package size={22} />
              <span>{t('nav.assets')}</span>
            </NavLink>
          )}

          <NavLink to="/app/lost-found" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={22} />
            <span>Lost & Found</span>
          </NavLink>

          <NavLink to="/app/foster" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Heart size={22} />
            <span>Foster</span>
          </NavLink>

          {['ngo', 'vet', 'shelter', 'admin'].includes(currentUser?.role) && (
            <NavLink to="/app/municipal" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Building2 size={22} />
              <span>Municipal</span>
            </NavLink>
          )}

          {currentUser?.role === 'admin' && (
            <NavLink to="/app/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={22} className="text-accent" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>

        <div className="nav-footer">
          <button className="icon-btn" onClick={() => setShowChat(!showChat)} title={t('common.community')}>
            <MessageSquare size={20} />
          </button>
          
          <button className="icon-btn" onClick={() => setShowSettings(!showSettings)} title={t('nav.settings')}>
            <Settings size={20} />
          </button>

          <div className="profile-section">
            <div className="user-avatar">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser?.name}</span>
              <span className="user-role">{t(`roles.${currentUser?.role}`, currentUser?.role)}</span>
            </div>
            <button className="logout-btn" onClick={() => { if (confirm(t('nav.logout') + '?')) logout(); }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className={`network-state ${networkState?.startsWith('Offline') ? 'offline' : networkState === 'Reconnecting' ? 'reconnecting' : ''}`}>
          <Radio size={14} />
          <span>{networkState}</span>
        </div>
        <div className="content-layout">
          <div className="page-view">
            <Outlet />
          </div>
          <ActiveDispatchPanel />
        </div>
        
        <button 
          className={`sos-fab ${emergencyMode ? 'active' : ''}`}
          onClick={() => setShowSOS(true)}
        >
          <Phone size={24} />
          <span>SOS</span>
        </button>
      </main>

      {showSettings && (
        <div className="settings-drawer glass-panel animate-slide-in">
          <div className="drawer-header">
            <h3>{t('nav.settings')}</h3>
            <button onClick={() => setShowSettings(false)}><X size={20} /></button>
          </div>
          <div className="drawer-content">
            <div className="setting-item">
              <label>{t('settings.theme')}</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                {THEMES.map(option => (
                  <option key={option.code} value={option.code}>{t(option.labelKey)}</option>
                ))}
              </select>
            </div>
            <div className="setting-item">
              <label>{t('settings.language')}</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map(option => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="setting-item">
              <label>Emergency Mode</label>
              <button 
                className={`toggle-btn ${emergencyMode ? 'on' : ''}`}
                onClick={toggleEmergencyMode}
              >
                {emergencyMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="setting-item messenger-setting">
              <label>Messenger Sync</label>
              {['whatsapp', 'telegram', 'discord'].map((source) => (
                <button
                  key={source}
                  className={`toggle-btn ${messengerSettings?.messengerSync?.[source]?.enabled ? 'on' : ''}`}
                  onClick={() => updateMessengerSettings({
                    messengerSync: {
                      ...(messengerSettings?.messengerSync || {}),
                      [source]: {
                        ...(messengerSettings?.messengerSync?.[source] || {}),
                        enabled: !messengerSettings?.messengerSync?.[source]?.enabled,
                        reviewQueue: true
                      }
                    }
                  })}
                >
                  {source}: {messengerSettings?.messengerSync?.[source]?.enabled ? 'ON' : 'OFF'}
                </button>
              ))}
              <p>Incoming rescue messages enter a human review queue before dispatch.</p>
            </div>
          </div>
        </div>
      )}

      {showSOS && <SOSReportModal onClose={() => setShowSOS(false)} />}

      {showChat && (
        <Chat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
