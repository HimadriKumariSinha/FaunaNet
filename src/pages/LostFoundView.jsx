import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone, AlertCircle, CheckCircle, RefreshCw, Filter } from 'lucide-react';
import { lostFoundService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './LostFoundView.css';

export default function LostFoundView() {
  const { currentUser } = useAppContext();
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [filterSpecies, setFilterSpecies] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('LOST');
  const [species, setSpecies] = useState('dog');
  const [petName, setPetName] = useState('');
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '');
  const [identifyingMarks, setIdentifyingMarks] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Matches Modal State
  const [selectedMatches, setSelectedMatches] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType !== 'ALL') params.type = filterType;
      if (filterSpecies !== 'ALL') params.species = filterSpecies;

      const data = await lostFoundService.getReports(params);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load Lost/Found reports:', err);
      setError('Unable to fetch Lost & Found listings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterType, filterSpecies]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone) {
      alert('Contact name and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      await lostFoundService.createReport({
        type,
        species,
        petName,
        photos: photoUrl ? [photoUrl] : [],
        lastSeenLocation: {
          lat: 28.6139, // Default city center fallback if GPS not available
          lng: 77.2090,
          address: address || 'City Center',
          city: city || 'New Delhi'
        },
        contactName,
        contactPhone,
        identifyingMarks
      });

      setShowModal(false);
      setPetName('');
      setIdentifyingMarks('');
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkMatches = async (reportId) => {
    try {
      const matches = await lostFoundService.findMatches(reportId);
      setSelectedMatches(matches);
    } catch (err) {
      alert(err.message || 'Failed to find matches.');
    }
  };

  return (
    <div className="lost-found-view animate-fade-in">
      <header className="mb-lg flex justify-between items-center">
        <div>
          <h1 className="pixel-font text-accent">Lost & Found Pet Network</h1>
          <p className="text-muted text-xs">Reuniting missing animals with their families and caregivers.</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-outline btn-sm" onClick={fetchReports}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={16} /> REPORT LOST / FOUND PET
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="board-filters mb-lg flex gap-md">
        <div className="flex gap-xs">
          {['ALL', 'LOST', 'FOUND'].map(t => (
            <button 
              key={t} 
              className={`filter-btn ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <select 
          className="form-select form-select-sm"
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          style={{ maxWidth: '160px' }}
        >
          <option value="ALL">All Species</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="cow">Cow / Bovine</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-board p-xl text-center">
          <p>Loading real Lost & Found database listings...</p>
        </div>
      ) : error ? (
        <div className="error-alert mb-lg">{error}</div>
      ) : reports.length === 0 ? (
        <div className="empty-board p-xl text-center">
          <AlertCircle size={48} className="text-muted mx-auto mb-md" />
          <h3>No Active Lost & Found Reports</h3>
          <p className="text-muted text-sm mt-xs">
            There are currently no matching lost or found pet reports. Use the button above to report a missing pet or a found stray.
          </p>
        </div>
      ) : (
        <div className="task-grid">
          {reports.map(item => (
            <div key={item._id} className={`task-card ${item.type === 'LOST' ? 'critical' : 'low'}`}>
              <div className="task-header">
                <span className={`status-badge ${item.type === 'LOST' ? 'critical' : 'low'}`}>
                  {item.type} PET
                </span>
                <span className="task-id">#{item.species.toUpperCase()}</span>
              </div>

              <div className="task-content">
                <h3>{item.petName || `${item.species.toUpperCase()} (${item.type})`}</h3>
                <p>{item.identifyingMarks || 'No specific markings described.'}</p>
                
                {item.photos && item.photos.length > 0 && (
                  <img src={item.photos[0]} alt="Pet" className="task-detail-image mt-sm" style={{ maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
              </div>

              <div className="task-footer mt-md">
                <div className="task-meta">
                  <div className="meta-row">
                    <MapPin size={14} />
                    <span>{item.lastSeenLocation?.address || item.lastSeenLocation?.city || 'Location N/A'}</span>
                  </div>
                  <div className="meta-row">
                    <Phone size={14} />
                    <span>{item.contactName} ({item.contactPhone})</span>
                  </div>
                </div>

                <div className="task-actions mt-sm">
                  <button 
                    className="btn btn-outline btn-sm w-full"
                    onClick={() => checkMatches(item._id)}
                  >
                    <Search size={14} /> FIND MATCHES
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Report Modal */}
      {showModal && (
        <div className="form-overlay" onClick={() => setShowModal(false)}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <form className="report-form" onSubmit={handleCreateReport}>
              <div className="form-header">
                <h2>Create Lost / Found Pet Listing</h2>
                <button type="button" className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>

              <div className="form-body">
                <div className="field-group">
                  <label>Listing Type</label>
                  <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="LOST">LOST — I am looking for my missing pet</option>
                    <option value="FOUND">FOUND — I found a stray / lost pet</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Species</label>
                  <select className="form-select" value={species} onChange={(e) => setSpecies(e.target.value)}>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="cow">Cow / Cattle</option>
                    <option value="other">Other Wildlife / Animal</option>
                  </select>
                </div>

                {type === 'LOST' && (
                  <div className="field-group">
                    <label>Pet Name</label>
                    <input className="form-select" placeholder="e.g. Bruno" value={petName} onChange={(e) => setPetName(e.target.value)} />
                  </div>
                )}

                <div className="field-group">
                  <label>Identifying Markings & Features</label>
                  <textarea className="form-textarea" rows="2" placeholder="Collar color, ear notch, fur pattern, unique spots..." value={identifyingMarks} onChange={(e) => setIdentifyingMarks(e.target.value)} />
                </div>

                <div className="field-group">
                  <label>Last Seen Location & City</label>
                  <input className="form-select mb-xs" placeholder="Address / Landmark" value={address} onChange={(e) => setAddress(e.target.value)} />
                  <input className="form-select" placeholder="City (e.g. New Delhi)" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="field-group">
                  <label>Contact Details</label>
                  <input className="form-select mb-xs" placeholder="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                  <input className="form-select" placeholder="Phone Number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                </div>

                <div className="field-group">
                  <label>Photo URL (Optional)</label>
                  <input className="form-select" placeholder="https://..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matches Modal */}
      {selectedMatches && (
        <div className="form-overlay" onClick={() => setSelectedMatches(null)}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>Proximity Match Results ({selectedMatches.length})</h2>
              <button type="button" className="close-btn" onClick={() => setSelectedMatches(null)}>×</button>
            </div>
            <div className="form-body">
              {selectedMatches.length === 0 ? (
                <p className="p-xl text-center text-muted">No nearby matching reports found within 10 km.</p>
              ) : (
                selectedMatches.map(m => (
                  <div key={m._id} className="p-md mb-md glass-panel rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-accent">{m.type} PET • Confidence: {Math.round(m.confidence * 100)}%</span>
                      <span className="text-xs text-muted">{m.distanceKm} km away</span>
                    </div>
                    <p className="text-sm mt-xs">{m.identifyingMarks || 'No specific marks'}</p>
                    <p className="text-xs text-primary mt-xs">Contact: {m.contactName} ({m.contactPhone})</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
