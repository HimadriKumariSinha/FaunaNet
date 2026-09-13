import { useState, useEffect } from 'react';
import { Heart, Plus, AlertCircle, RefreshCw, Home, Calendar } from 'lucide-react';
import { fosterService, animalService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './FosterHub.css';

export default function FosterHub() {
  const { currentUser } = useAppContext();

  const [availableAnimals, setAvailableAnimals] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [animalsLoading, setAnimalsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [housingType, setHousingType] = useState('apartment');
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setAnimalsLoading(true);
    setAppsLoading(true);
    setError(null);

    try {
      const animals = await animalService.getAll({ fosterStatus: 'available_for_foster' });
      const available = Array.isArray(animals) ? animals.filter(
        a => a.fosterStatus === 'available_for_foster' || a.status === 'available_for_foster'
      ) : [];
      setAvailableAnimals(available);
    } catch (err) {
      console.error('Failed to load animals:', err);
      setError('Unable to load foster-available animals from the database.');
    } finally {
      setAnimalsLoading(false);
    }

    try {
      const apps = await fosterService.getApplications();
      setMyApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedAnimal || !experience.trim()) {
      alert('Please select an animal and provide your experience description.');
      return;
    }

    setSubmitting(true);
    try {
      await fosterService.submit({
        animalId: selectedAnimal._id,
        housingType,
        hasOtherPets,
        durationWeeks: Number(durationWeeks),
        experienceDescription: experience.trim()
      });
      setSelectedAnimal(null);
      setExperience('');
      alert('Foster application submitted successfully! The organization will review your application.');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to submit foster application.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status) => {
    const map = { PENDING: 'badge-normal', UNDER_REVIEW: 'badge-high', APPROVED: 'badge-low', PLACED: 'badge-low', REJECTED: 'badge-critical', COMPLETED: 'status-badge-blue' };
    return map[status] || 'badge-normal';
  };

  return (
    <div className="foster-hub animate-fade-in">
      <header className="mb-lg flex justify-between items-center">
        <div>
          <h1 className="pixel-font text-accent">Foster Animal Hub</h1>
          <p className="text-muted text-xs">Provide a temporary home for animals in recovery and care.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {/* Available Foster Animals */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">🐾 Animals Looking for Foster Homes</h2>

        {animalsLoading ? (
          <div className="loading-skeleton p-xl text-center text-muted">
            Loading real-time foster-available animals from database...
          </div>
        ) : error ? (
          <div className="error-alert mb-lg">{error}</div>
        ) : availableAnimals.length === 0 ? (
          <div className="empty-board p-xl text-center">
            <AlertCircle size={40} className="text-muted mx-auto mb-md" />
            <h3>No Animals Currently Need Foster Care</h3>
            <p className="text-muted text-sm mt-xs">
              Check back later or contact a local rescue organization directly.
            </p>
          </div>
        ) : (
          <div className="foster-grid">
            {availableAnimals.map(animal => (
              <div key={animal._id} className="foster-card glass-panel">
                {animal.photographs?.[0] || animal.images?.[0] ? (
                  <img
                    src={animal.photographs?.[0] || animal.images?.[0]}
                    alt={animal.species}
                    className="foster-photo"
                  />
                ) : (
                  <div className="foster-photo-placeholder">
                    <span className="text-4xl">🐾</span>
                  </div>
                )}
                <div className="foster-info">
                  <div className="flex justify-between items-center">
                    <span className="fauna-id text-accent">{animal.animalId || animal.faunaId}</span>
                    <span className="badge badge-normal">{animal.species}</span>
                  </div>
                  <h3 className="mt-xs">{animal.species?.charAt(0).toUpperCase() + animal.species?.slice(1)} · {animal.estimatedAge || 'Unknown age'}</h3>
                  <p className="text-xs text-muted mt-xs">{animal.location?.address || animal.location?.city || 'Location not specified'}</p>
                  <p className="text-xs mt-sm">{animal.identifyingMarkings || 'No special markings recorded.'}</p>
                  <button
                    className="btn btn-primary btn-sm w-full mt-md"
                    onClick={() => setSelectedAnimal(animal)}
                  >
                    <Heart size={14} /> Apply to Foster
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Applications */}
      {currentUser && (
        <section className="mb-xl">
          <h2 className="section-title mb-md">📋 My Foster Applications</h2>

          {appsLoading ? (
            <div className="loading-skeleton p-lg text-center text-muted">Loading your applications...</div>
          ) : myApplications.length === 0 ? (
            <div className="empty-board p-lg text-center">
              <p className="text-muted text-sm">You have not submitted any foster applications yet.</p>
            </div>
          ) : (
            <div className="applications-list">
              {myApplications.map(app => (
                <div key={app._id} className="application-row glass-panel p-md mb-sm flex justify-between items-center">
                  <div>
                    <div className="flex gap-sm items-center">
                      <span className="fauna-id text-accent text-xs">{app.animal?.animalId || 'Animal'}</span>
                      <span className="text-muted text-xs">· {app.animal?.species}</span>
                    </div>
                    <p className="text-xs text-muted mt-xs">{app.durationWeeks} weeks · {app.housingType}</p>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${statusColor(app.status)}`}>{app.status}</span>
                    {app.reviewNotes && <p className="text-xs text-muted mt-xs">{app.reviewNotes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Foster Application Modal */}
      {selectedAnimal && (
        <div className="form-overlay" onClick={() => setSelectedAnimal(null)}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <form className="report-form" onSubmit={handleApply}>
              <div className="form-header">
                <h2>Apply to Foster: {selectedAnimal.animalId}</h2>
                <button type="button" className="close-btn" onClick={() => setSelectedAnimal(null)}>×</button>
              </div>

              <div className="form-body">
                <div className="field-group">
                  <label>Animal</label>
                  <input
                    className="form-select"
                    value={`${selectedAnimal.animalId} · ${selectedAnimal.species}`}
                    readOnly
                    style={{ opacity: 0.7 }}
                  />
                </div>

                <div className="field-group">
                  <label>Housing Type</label>
                  <select className="form-select" value={housingType} onChange={(e) => setHousingType(e.target.value)}>
                    <option value="apartment">Apartment</option>
                    <option value="house_no_yard">House (no yard)</option>
                    <option value="house_with_yard">House (with yard)</option>
                    <option value="farm">Farm / Large Property</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={hasOtherPets}
                      onChange={(e) => setHasOtherPets(e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    I currently have other pets at home
                  </label>
                </div>

                <div className="field-group">
                  <label>Foster Duration (weeks)</label>
                  <input
                    className="form-select"
                    type="number"
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label>Your Experience with Animals *</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    required
                    placeholder="Describe your previous experience with pets, any relevant training, or your motivation to foster..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : '✓ Submit Foster Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
