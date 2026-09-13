import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroScene from './HeroScene';
import './Interactive.css';
import { useAppContext } from '../../context/AppContext';
import {
  Heart, Shield, Users, ArrowRight, Sparkles, X,
  Eye, EyeOff, Telescope, Star, Leaf, MapPin, RotateCcw
} from 'lucide-react';

// ─── Mini Star Map (SVG canvas inside info panel) ─────────────────────────────
function MiniStarMap({ constellation }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !constellation) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    let animFrame;
    let angle = 0;

    // Project 3D points to 2D with simple rotation
    const project = (pt) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x2 = pt[0] * cos - pt[2] * sin;
      const y2 = pt[1];
      return [x2, y2];
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      const pts = constellation.points.map(project);

      // Determine bounding box to center
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach(([x, y]) => {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      });
      const scaleX = (W * 0.7) / Math.max(maxX - minX, 0.01);
      const scaleY = (H * 0.7) / Math.max(maxY - minY, 0.01);
      const scale = Math.min(scaleX, scaleY);
      const cx = W / 2 - ((minX + maxX) / 2) * scale;
      const cy = H / 2 + ((minY + maxY) / 2) * scale;

      const toScreen = ([x, y]) => [cx + x * scale, cy - y * scale];

      // Draw glow lines
      ctx.shadowBlur = 8;
      ctx.shadowColor = constellation.color;
      ctx.strokeStyle = constellation.color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      constellation.edges.forEach(([i, j]) => {
        const [x1, y1] = toScreen(pts[i]);
        const [x2, y2] = toScreen(pts[j]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw star dots
      ctx.globalAlpha = 1;
      pts.forEach((pt) => {
        const [sx, sy] = toScreen(pt);
        ctx.shadowBlur = 12;
        ctx.shadowColor = constellation.color;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      angle += 0.003;
      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [constellation]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={140}
      className="mini-star-map"
    />
  );
}

// ─── Conservation Badge ────────────────────────────────────────────────────────
function ConservationBadge({ status }) {
  if (!status) return null;
  const map = {
    'Least Concern': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    'Near Threatened': { color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
    'Vulnerable': { color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    'Endangered': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    'Critically Endangered': { color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
  };
  const style = map[status] || map['Least Concern'];
  return (
    <span className="conservation-badge" style={{ color: style.color, background: style.bg, borderColor: style.color + '44' }}>
      <Leaf size={11} />
      {status}
    </span>
  );
}

// ─── Constellation Info Panel ──────────────────────────────────────────────────
function ConstellationInfoPanel({ constellation, onClose }) {
  if (!constellation) return null;

  return (
    <div className={`constellation-info-panel glass-panel ${constellation ? 'open' : ''}`}>
      <div className="cip-header" style={{ borderColor: constellation.color + '55' }}>
        <div className="cip-title-row">
          <div>
            <span className="cip-type-badge" style={{ color: constellation.color, background: constellation.color + '18', borderColor: constellation.color + '44' }}>
              {constellation.type === 'real' ? <Telescope size={11} /> : <Star size={11} />}
              {constellation.type === 'real' ? 'Real Constellation' : 'Fauna Atlas'}
            </span>
            <h2 className="cip-title" style={{ color: constellation.color }}>{constellation.name}</h2>
            <p className="cip-label">{constellation.label.split('•')[1]?.trim()}</p>
          </div>
          <button className="close-btn cip-close" onClick={onClose}><X size={18} /></button>
        </div>
      </div>

      <div className="cip-body">
        {/* Mini star map */}
        <div className="cip-starmap-wrap">
          <MiniStarMap constellation={constellation} />
        </div>

        {/* Coordinates */}
        <div className="cip-coords">
          <MapPin size={12} />
          <span>{constellation.coords}</span>
        </div>

        {/* Conservation */}
        {constellation.conservation && (
          <div className="cip-section">
            <ConservationBadge status={constellation.conservation} />
          </div>
        )}

        {/* Lore */}
        <div className="cip-section">
          <h4 className="cip-section-title">Origin &amp; Mythology</h4>
          <p className="cip-text">{constellation.lore}</p>
        </div>

        {/* Wildlife */}
        <div className="cip-section">
          <h4 className="cip-section-title">
            <Leaf size={13} style={{ color: '#4ade80' }} />
            Wildlife Insight
          </h4>
          <p className="cip-text">{constellation.wildlife}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Experience ───────────────────────────────────────────────────
export default function LandingExperience() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTheme } = useAppContext();
  const [scrollY, setScrollY] = useState(0);

  // Companion & Sky customizer state, persistent in local storage
  const [catStyle, setCatStyle] = useState(() => localStorage.getItem('fn_cat_style') || 'ginger');
  const [accessory, setAccessory] = useState(() => localStorage.getItem('fn_cat_accessory') || 'none');
  const [showLabels, setShowLabels] = useState(() => {
    const val = localStorage.getItem('fn_show_constellation_labels');
    return val !== null ? val === 'true' : true;
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Constellation selection
  const [selectedConstellation, setSelectedConstellation] = useState(null);

  useEffect(() => {
    setTheme('dark');
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setTheme]);

  useEffect(() => { localStorage.setItem('fn_cat_style', catStyle); }, [catStyle]);
  useEffect(() => { localStorage.setItem('fn_cat_accessory', accessory); }, [accessory]);
  useEffect(() => { localStorage.setItem('fn_show_constellation_labels', String(showLabels)); }, [showLabels]);

  const handleSelectConstellation = (c) => {
    setSelectedConstellation(c);
    if (isCustomizerOpen) setIsCustomizerOpen(false);
  };

  const handleResetCamera = () => setSelectedConstellation(null);

  const enterApp = () => navigate('/app');

  const heroFade = selectedConstellation ? 0 : Math.max(0, 1 - scrollY / 400);

  return (
    <div className="landing-experience">
      {/* 3D Background */}
      <div className="three-container">
        <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
          <HeroScene
            catStyle={catStyle}
            accessory={accessory}
            showLabels={showLabels}
            selectedConstellation={selectedConstellation}
            onSelectConstellation={handleSelectConstellation}
          />
        </div>
      </div>

      {/* Reset camera button (appears when a constellation is selected) */}
      {selectedConstellation && (
        <button className="reset-camera-btn glass-panel" onClick={handleResetCamera}>
          <RotateCcw size={16} />
          <span>Back to Earth</span>
        </button>
      )}

      {/* Floating Customizer Trigger */}
      <button
        className={`customizer-trigger-btn glass-panel ${isCustomizerOpen ? 'active' : ''}`}
        onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
        title="Customize 3D Companion"
        style={{ opacity: selectedConstellation ? 0 : 1, pointerEvents: selectedConstellation ? 'none' : 'auto', transition: 'opacity 0.4s ease' }}
      >
        <Sparkles size={20} className="glow-icon" />
        <span>Customize</span>
      </button>

      {/* Customizer Panel */}
      <div className={`customizer-panel glass-panel ${isCustomizerOpen ? 'open' : ''}`}>
        <div className="customizer-header">
          <h3>Companion Customizer</h3>
          <button className="close-btn" onClick={() => setIsCustomizerOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="customizer-body">
          <div className="customizer-section">
            <h4>Select Breed</h4>
            <div className="options-grid">
              {[
                { id: 'ginger', name: 'Ginger Tabby', desc: 'Warm orange pattern' },
                { id: 'midnight', name: 'Midnight', desc: 'Sleek black & glowing eyes' },
                { id: 'siamese', name: 'Siamese', desc: 'Cream points & blue eyes' },
                { id: 'calico', name: 'Calico', desc: 'Cute patches of color' },
                { id: 'cyber', name: 'Cyber Hologram', desc: 'Neon glowing wireframe' }
              ].map((style) => (
                <button key={style.id} className={`option-card ${catStyle === style.id ? 'selected' : ''}`} onClick={() => setCatStyle(style.id)}>
                  <div className="option-title">{style.name}</div>
                  <div className="option-desc">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="customizer-section">
            <h4>Accessory</h4>
            <div className="options-grid">
              {[
                { id: 'none', name: 'None', desc: 'Just a natural kitty' },
                { id: 'crown', name: 'Gold Crown', desc: 'Fit for royalty' },
                { id: 'bowtie', name: 'Red Bowtie', desc: 'Dapper and dandy' },
                { id: 'goggles', name: 'Steampunk', desc: 'Intrepid explorer' },
                { id: 'wizard', name: 'Wizard Hat', desc: 'Magical companion' }
              ].map((acc) => (
                <button key={acc.id} className={`option-card ${accessory === acc.id ? 'selected' : ''}`} onClick={() => setAccessory(acc.id)}>
                  <div className="option-title">{acc.name}</div>
                  <div className="option-desc">{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="customizer-section">
            <h4>Constellations</h4>
            <button
              className={`toggle-label-btn glass-panel ${showLabels ? 'active' : ''}`}
              onClick={() => setShowLabels(!showLabels)}
            >
              {showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Constellation Info Panel (right side) */}
      <ConstellationInfoPanel constellation={selectedConstellation} onClose={handleResetCamera} />

      {/* Narrative Layers */}
      <div className="narrative-layers" style={{ opacity: heroFade, transition: 'opacity 0.5s ease', pointerEvents: selectedConstellation ? 'none' : 'auto' }}>
        <section className="scene hero">
          <div className="content-overlay-container">
            <div className="side-card glass-panel" style={{ opacity: Math.max(0, 1 - scrollY / 500) }}>
              <h1 className="brand-title">FAUNANET</h1>
              <p className="brand-subtitle">Where real-world action meets the digital frontier.</p>
              <p className="interaction-hint">✦ Click a constellation to explore its story</p>
              <div className="hero-actions mt-lg">
                <button className="btn btn-primary" onClick={enterApp}>
                  {t('landing.cta')} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="bottom-hint">
            DRAG TO RE-ORIENT  •  CLICK STARS TO EXPLORE
          </div>
        </section>

        <section className="scene vision">
          <div className="vision-grid">
            <div className="vision-card glass-panel" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
              <Heart className="text-primary mb-md" size={32} />
              <h3>Emotionally Intelligent</h3>
              <p>We believe urban spaces belong to everyone—humans and animals alike. Our platform fosters empathy and coordinated care.</p>
            </div>
            <div className="vision-card glass-panel" style={{ transform: `translateY(${scrollY * -0.1}px)` }}>
              <Shield className="text-primary mb-md" size={32} />
              <h3>Civic Infrastructure</h3>
              <p>A sophisticated network for emergency dispatch, health tracking, and conflict resolution at the municipal level.</p>
            </div>
            <div className="vision-card glass-panel" style={{ transform: `translateY(${scrollY * -0.15}px)` }}>
              <Users className="text-primary mb-md" size={32} />
              <h3>Community Driven</h3>
              <p>Empowering residents, volunteers, and NGOs to work together seamlessly for a safer, more biodiverse city.</p>
            </div>
          </div>
        </section>

        <section className="scene cta">
          <div className="cta-box glass-panel text-center">
            <h2>Ready to make a difference?</h2>
            <p className="mt-md mb-xl">Join thousands of citizens building a smarter, kinder urban ecosystem today.</p>
            <button className="btn btn-primary btn-xl" onClick={enterApp}>
              {t('landing.cta')}
            </button>
          </div>
        </section>
      </div>

      <div className="scroll-indicator" style={{ opacity: selectedConstellation ? 0 : 1, transition: 'opacity 0.4s ease' }}>
        <div className="mouse"></div>
        <span>Scroll to explore</span>
      </div>
    </div>
  );
}
