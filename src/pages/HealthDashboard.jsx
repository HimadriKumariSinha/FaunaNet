import { useState, useEffect } from 'react';
import { Heart, Thermometer, Activity, Shield, AlertCircle, Plus, Stethoscope, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { vetService, animalService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './HealthDashboard.css';

export default function HealthDashboard() {
  const { t } = useTranslation();
  const { currentUser } = useAppContext();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [animalsInCare, setAnimalsInCare] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for creating new medical record
  const [showModal, setShowModal] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [examination, setExamination] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [dischargeStatus, setDischargeStatus] = useState('in_care');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recordsData, animalsData] = await Promise.all([
        vetService.getAll(),
        animalService.getAll({ status: 'under_treatment' })
      ]);
      setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
      setAnimalsInCare(Array.isArray(animalsData) ? animalsData : []);
    } catch (err) {
      console.error('Failed to load veterinary records:', err);
      setError('Unable to fetch veterinary health records from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!selectedAnimalId || !examination || !diagnosis || !treatment) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await vetService.createRecord({
        animalId: selectedAnimalId,
        examination,
        diagnosis,
        treatment,
        dischargeStatus
      });
      setShowModal(false);
      setExamination('');
      setDiagnosis('');
      setTreatment('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to record medical entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const isVetOrNgo = currentUser && ['vet', 'ngo', 'admin'].includes(currentUser.role);

  return (
    <div className="health-dashboard animate-fade-in">
      <header className="mb-lg flex justify-between items-center">
        <div>
          <h1 className="pixel-font text-accent">Veterinary & Health Dashboard</h1>
          <p className="text-muted text-xs">Live medical examination records and animals under treatment.</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-outline btn-sm" onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
          {isVetOrNgo && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={16} /> ADD MEDICAL ENTRY
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="empty-board p-xl text-center">
          <Activity size={32} className="animate-spin text-accent mx-auto mb-md" />
          <p>Loading real medical records from database...</p>
        </div>
      ) : error ? (
        <div className="error-alert mb-lg">{error}</div>
      ) : medicalRecords.length === 0 ? (
        <div className="empty-board p-xl text-center">
          <Stethoscope size={48} className="text-muted mx-auto mb-md" />
          <h3>No Veterinary Medical Records Found</h3>
          <p className="text-muted text-sm mt-xs">
            There are currently no active medical logs in the database. Verified veterinarians and NGOs can submit real treatment logs above.
          </p>
        </div>
      ) : (
        <div className="vitals-grid">
          {medicalRecords.map((record) => (
            <div key={record._id} className={`vital-card card glass-panel ${record.dischargeStatus || 'in_care'}`}>
              <div className="vital-header">
                <span className="vital-id">UID: {record.animal?.animalId || 'Animal Dossier'}</span>
                <span className={`status-tag ${record.dischargeStatus || 'in_care'}`}>
                  {(record.dischargeStatus || 'in_care').replace('_', ' ')}
                </span>
              </div>

              <div className="vital-body mt-md">
                <div className="biometric">
                  <Stethoscope size={16} className="text-primary" />
                  <div className="bio-info">
                    <span className="label">Diagnosis</span>
                    <span className="value">{record.diagnosis}</span>
                  </div>
                </div>

                <div className="biometric">
                  <Activity size={16} className="text-accent" />
                  <div className="bio-info">
                    <span className="label">Treatment</span>
                    <span className="value">{record.treatment}</span>
                  </div>
                </div>

                <div className="biometric">
                  <Shield size={16} className="text-muted" />
                  <div className="bio-info">
                    <span className="label">Attending Vet</span>
                    <span className="value">{record.vet?.name || 'Veterinarian'}</span>
                  </div>
                </div>
              </div>

              <div className="vital-footer mt-md">
                <p className="text-xxs text-muted">
                  Logged: {record.createdAt ? new Date(record.createdAt).toLocaleString() : '—'}
                </p>
                {record.notes && <p className="text-xs mt-xs text-primary">{record.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Medical Record Modal */}
      {showModal && (
        <div className="form-overlay" onClick={() => setShowModal(false)}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <form className="report-form" onSubmit={handleCreateRecord}>
              <div className="form-header">
                <h2>Add Veterinary Treatment Entry</h2>
                <button type="button" className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>

              <div className="form-body">
                <div className="field-group">
                  <label>Select Animal in Care</label>
                  <select 
                    className="form-select" 
                    value={selectedAnimalId} 
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Animal --</option>
                    {animalsInCare.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.animalId} - {a.species} ({a.location?.city || 'Location N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label>Examination Findings</label>
                  <textarea 
                    className="form-textarea" 
                    rows="2" 
                    placeholder="Describe physical examination, vitals, temperature, visible wounds..."
                    value={examination}
                    onChange={(e) => setExamination(e.target.value)}
                    required 
                  />
                </div>

                <div className="field-group">
                  <label>Diagnosis</label>
                  <input 
                    className="form-select" 
                    placeholder="e.g. Right Femur Fracture, Severe Dehydration"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required 
                  />
                </div>

                <div className="field-group">
                  <label>Treatment Administered</label>
                  <textarea 
                    className="form-textarea" 
                    rows="2" 
                    placeholder="Surgical procedure, IV fluids, wound dressing, medications..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    required 
                  />
                </div>

                <div className="field-group">
                  <label>Discharge / Care Status</label>
                  <select 
                    className="form-select" 
                    value={dischargeStatus} 
                    onChange={(e) => setDischargeStatus(e.target.value)}
                  >
                    <option value="in_care">In Care / Under Observation</option>
                    <option value="ready_for_shelter">Ready for Shelter Transfer</option>
                    <option value="released_to_wild">Released to Habitat</option>
                    <option value="ready_for_adoption">Ready for Adoption</option>
                  </select>
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Saving Medical Entry...' : 'Save Medical Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
