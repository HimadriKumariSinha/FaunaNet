import { useState } from 'react';
import { BookOpen, Award, CheckCircle, Lock, Play, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/api';
import './TrainingCenter.css';

export default function TrainingCenter() {
  const { t } = useTranslation();
  const { currentUser, refreshCurrentUser } = useAppContext();
  const [completing, setCompleting] = useState(null);

  const completedModules = currentUser?.trainingCompleted || [];
  const completedIds = completedModules.map(m => m.moduleId);

  const MODULES = [
    { 
      id: 1, 
      title: t('training.modules.m1.title', 'Emergency Wildlife Assessment'), 
      description: t('training.modules.m1.desc', 'Learn to evaluate species distress, priority levels, and physical trauma.'), 
      points: 500 
    },
    { 
      id: 2, 
      title: t('training.modules.m2.title', 'Safe Animal Handling & Transport'), 
      description: t('training.modules.m2.desc', 'Protocols for securing injured stray dogs, cats, and birds safely.'), 
      points: 300 
    },
    { 
      id: 3, 
      title: t('training.modules.m3.title', 'First Aid & Stabilization'), 
      description: t('training.modules.m3.desc', 'Bandaging, heat stress management, and temporary hydration tactics.'), 
      points: 450 
    },
    { 
      id: 4, 
      title: t('training.modules.m4.title', 'Coexistence & Community Moderation'), 
      description: t('training.modules.m4.desc', 'Resolving human-wildlife conflict and zone management.'), 
      points: 200 
    },
  ];

  const handleCompleteModule = async (moduleId, points) => {
    setCompleting(moduleId);
    try {
      const nextCompleted = [...completedModules, { moduleId, completedAt: new Date() }];
      const updatedUser = await authService.updateProfile({
        trainingCompleted: nextCompleted
      });

      if (refreshCurrentUser) {
        refreshCurrentUser({
          trainingCompleted: nextCompleted,
          points: (currentUser?.points || 0) + points
        });
      }

      alert(`Module completed! You earned +${points} XP.`);
    } catch (err) {
      alert(err.message || 'Failed to update training progress.');
    } finally {
      setCompleting(null);
    }
  };

  const progressPercent = Math.round((completedIds.length / MODULES.length) * 100);

  return (
    <div className="training-center animate-fade-in">
      <header className="mb-lg flex justify-between items-center">
        <div>
          <h1 className="pixel-font text-accent">{t('training.title', 'Training Center')}</h1>
          <p className="text-muted text-xs">Training Progress: {progressPercent}% Completed ({completedIds.length}/{MODULES.length} Modules)</p>
        </div>
        <div className="rank-badge glass-panel">
          <Award size={20} className="text-primary" />
          <div className="rank-info">
            <span className="label">Total XP</span>
            <span className="value">{currentUser?.points || 0} XP</span>
          </div>
        </div>
      </header>

      <div className="training-grid">
        {MODULES.map(module => {
          const isDone = completedIds.includes(module.id);
          const isLocked = module.id > 1 && !completedIds.includes(module.id - 1) && !isDone;

          return (
            <div key={module.id} className={`module-card card glass-panel ${isDone ? 'completed' : isLocked ? 'locked' : 'available'}`}>
              <div className="module-header">
                {isDone && <CheckCircle size={20} className="text-primary" />}
                {isLocked && <Lock size={20} className="text-muted" />}
                {!isDone && !isLocked && <Play size={20} className="text-accent" />}
                <span className="points-tag">{module.points} XP</span>
              </div>

              <div className="module-body mt-md">
                <h3 className="pixel-font text-sm">{module.title}</h3>
                <p className="text-xs text-muted mt-sm">{module.description}</p>
              </div>

              <div className="module-footer mt-lg">
                {isDone ? (
                  <button className="btn btn-outline w-full btn-sm" disabled>
                    ✓ COMPLETED
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary w-full btn-sm" 
                    disabled={isLocked || completing === module.id}
                    onClick={() => handleCompleteModule(module.id, module.points)}
                  >
                    {completing === module.id ? 'Completing...' : isLocked ? 'LOCKED' : 'START MODULE'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="achievement-section mt-xl">
        <h2 className="pixel-font text-sm mb-md">{t('training.badges', 'Earned Verification Badges')}</h2>
        <div className="badge-scroll flex gap-md">
          <div className={`badge-item glass-panel ${completedIds.length > 0 ? '' : 'locked'}`} title="First Response">
            <Shield size={32} className={completedIds.length > 0 ? 'text-primary' : 'opacity-10'} />
          </div>
          <div className={`badge-item glass-panel ${completedIds.length >= 2 ? '' : 'locked'}`} title="Medical Assistant">
            <BookOpen size={32} className={completedIds.length >= 2 ? 'text-accent' : 'opacity-10'} />
          </div>
          <div className={`badge-item glass-panel ${completedIds.length >= 4 ? '' : 'locked'}`} title="Master Rescuer">
            <Award size={32} className={completedIds.length >= 4 ? 'text-primary' : 'opacity-10'} />
          </div>
        </div>
      </div>
    </div>
  );
}
