import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import './Profile.css';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const canvasRef = useRef(null);
  const outerRef = useRef(null);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);

  // Read URL search params
  const paramName = searchParams.get('name') || '';
  const paramCollege = searchParams.get('college') || '';
  const paramDialogue = searchParams.get('dialogue') || '';

  // Component States
  const [profileImg, setProfileImg] = useState('');
  const [displayName, setDisplayName] = useState(paramName.toUpperCase() || localStorage.getItem('userName')?.toUpperCase() || 'YOUR NAME');
  const [displayCollege, setDisplayCollege] = useState(paramCollege || 'KLS Gogte Institute of Tecnology');
  const [dialogueText, setDialogueText] = useState(paramDialogue || 'प्रारम्भ : The Beginning of an extraordinary journey.');
  
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPopActive, setIsPopActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const email = localStorage.getItem('userEmail') || 'participant@giet.edu';
  const fallbackToken = localStorage.getItem('userId') || 'c6b807a2-68bf-40e9-bace-329ac1e5fe70';
  const [qrToken, setQrToken] = useState(fallbackToken);

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

  // Sync state if parameters change dynamically
  useEffect(() => {
    if (paramName) setDisplayName(paramName.toUpperCase());
    if (paramCollege) setDisplayCollege(paramCollege);
    if (paramDialogue) setDialogueText(paramDialogue);
  }, [paramName, paramCollege, paramDialogue]);

  // Fetch participant information from backend if logged in
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const API_BASE = import.meta.env.VITE_API_URL || 'https://prarambh-backend-kappa.vercel.app';
    fetch(`${API_BASE}/api/credentials/${userId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': 'change-me-secret'
      }
    })
    .then(res => {
      if (res.status === 404 || res.status === 401) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('qrToken');
        navigate('/login');
        throw new Error('Session expired or user not found');
      }
      if (!res.ok) {
        throw new Error('Failed to fetch credentials from backend');
      }
      return res.json();
    })
    .then(data => {
      console.log('Fetched verified participant data from backend:', data);
      if (data.name) {
        setDisplayName(data.name.toUpperCase());
      }
      if (data.dialogue) {
        setDialogueText(data.dialogue);
      }
      if (data.qr_token) {
        setQrToken(data.qr_token);
      }
    })
    .catch(err => {
      console.error('Backend fetch failed, utilizing local storage cache:', err);
    });
  }, []);

  // Load or generate unique QR code
  useEffect(() => {
    if (!qrToken) return;

    const storedQr = localStorage.getItem(`qr_code_v2_${qrToken}`);
    if (storedQr) {
      setQrCodeUrl(storedQr);
    } else {
      QRCode.toDataURL(qrToken, {
        width: 800,
        margin: 2,
        color: {
          dark: '#F5C842', // Gold foreground
          light: '#0C0820' // Deep dark background
        }
      })
      .then(url => {
        localStorage.setItem(`qr_code_v2_${qrToken}`, url);
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('QR generation error:', err);
      });
    }
  }, [qrToken]);

  // Scratch Canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const outer = outerRef.current;
    if (!canvas || !outer) return;

    let isDown = false;
    let localRevealed = scratchRevealed;

    const resizeCanvas = () => {
      const rect = outer.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      if (!localRevealed) {
        drawScratchSurface();
      }
    };

    const drawScratchSurface = () => {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep dark base matching poster bg
      ctx.fillStyle = '#0C0820';
      ctx.fillRect(0, 0, w, h);

      // Subtle gold shimmer pattern - diagonal lines
      ctx.strokeStyle = 'rgba(245, 200, 66, 0.07)';
      ctx.lineWidth = 1;
      for (let i = -h; i < w + h; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + h, h);
        ctx.stroke();
      }

      // Overlay gradient: rose -> saffron -> deep
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, 'rgba(232, 48, 90, 0.82)');
      grad.addColorStop(0.5, 'rgba(255, 107, 26, 0.75)');
      grad.addColorStop(1, 'rgba(12, 8, 32, 0.88)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Instruction text in centre
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      const cw = canvas.width / window.devicePixelRatio;
      const ch = canvas.height / window.devicePixelRatio;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = `bold ${Math.max(22, cw * 0.07)}px 'Bebas Neue', sans-serif`;
      ctx.letterSpacing = '4px';
      ctx.fillStyle = 'rgba(253, 244, 227, 0.9)';
      ctx.fillText('SCRATCH TO REVEAL', cw / 2, ch / 2 - 12);

      ctx.font = `${Math.max(11, cw * 0.03)}px 'Rajdhani', sans-serif`;
      ctx.fillStyle = 'rgba(253, 244, 227, 0.5)';
      ctx.fillText('✦  apna dialogue dhundo  ✦', cw / 2, ch / 2 + 14);
      ctx.restore();
    };

    const scratch = (x, y) => {
      if (localRevealed) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const px = (x - rect.left) * window.devicePixelRatio;
      const py = (y - rect.top) * window.devicePixelRatio;
      const r = 28 * window.devicePixelRatio;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      checkReveal();
    };

    const checkReveal = () => {
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      // sample every 32nd pixel for performance
      for (let i = 3; i < data.length; i += 32 * 4) {
        if (data[i] < 20) cleared++;
      }
      const total = data.length / (32 * 4);
      if (cleared / total > 0.55) {
        fullyReveal();
      }
    };

    const fullyReveal = () => {
      if (localRevealed) return;
      localRevealed = true;
      setScratchRevealed(true);
      canvas.classList.add('fully-revealed');
      
      // Sparkle burst emoji popup animation
      setIsPopActive(true);
      setTimeout(() => setIsPopActive(false), 800);
    };

    // Mouse handlers
    const handleMouseDown = (e) => {
      isDown = true;
      scratch(e.clientX, e.clientY);
    };
    const handleMouseMove = (e) => {
      if (isDown) scratch(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      isDown = false;
    };

    // Touch handlers
    const handleTouchStart = (e) => {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e) => {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    };

    // Event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Initial resize & draw
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [scratchRevealed]);

  // Image Upload handlers
  const triggerPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to crop and resize the photo to a high-res square
        const canvas = document.createElement('canvas');
        const size = 1200; // High resolution square size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Calculate crop coordinates (centered square)
        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;

        if (img.width > img.height) {
          sWidth = img.height;
          sx = (img.width - img.height) / 2;
        } else {
          sHeight = img.width;
          sy = (img.height - img.width) / 2;
        }

        // Draw cropped image onto the high-res canvas
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

        // Export as high-quality JPEG
        const highResSquareUrl = canvas.toDataURL('image/jpeg', 0.95);
        setProfileImg(highResSquareUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Toast message utility
  const showToast = (msg, duration = 2600) => {
    setToastMessage(msg);
    setIsToastOpen(true);
    setTimeout(() => {
      setIsToastOpen(false);
    }, duration);
  };

  // Download Profile Card as Image
  const downloadCard = (hideQr = false) => {
    if (isDownloading) return;
    setIsDownloading(true);
    showToast('⏳ Rendering...');

    const card = cardRef.current;
    const filename =
      (displayName === 'YOUR NAME'
        ? 'prarambh-profile'
        : displayName.toLowerCase().replace(/\s+/g, '-')) + 
      (hideQr ? '-no-qr' : '') + '.png';

    // Add rendering class for CSS overrides during download
    card.classList.add('is-rendering');
    if (hideQr) {
      card.classList.add('hide-qr-rendering');
    }

    const renderWidth = hideQr ? 450 : 440;

    // We will render high-res, hiding download buttons & scratch canvas
    // html2canvas parameter options are configured below
    html2canvas(card, {
      backgroundColor: '#0C0820', // force dark card bg - no white borders
      scale: 4,                  // 4x for high quality DPI
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: renderWidth,
      windowWidth: renderWidth,
      scrollX: 0,
      scrollY: 0,
      ignoreElements: (el) => {
        // Hiding background elements or overlay panels to prevent them from showing in rendering
        return (
          el.classList &&
          (el.classList.contains('mq') ||
            el.classList.contains('mq-bot') ||
            el.classList.contains('wm') ||
            el.classList.contains('toast') ||
            el.classList.contains('ca') ||
            el.classList.contains('help-row') ||
            el.classList.contains('dlg-wrap') ||
            (hideQr && el.classList.contains('qr-wrap')) ||
            el.id === 'scratchCanvas')
        );
      },
    })
      .then((canvas) => {
        card.classList.remove('is-rendering');
        card.classList.remove('hide-qr-rendering');
        setIsDownloading(false);
        // Trigger download
        const a = document.createElement('a');
        a.download = filename;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('✦ Downloaded!');
      })
      .catch((err) => {
        card.classList.remove('is-rendering');
        card.classList.remove('hide-qr-rendering');
        setIsDownloading(false);
        console.error(err);
        showToast('⚠ Try again');
      });
  };

  const attributionName = paramName ? paramName.toUpperCase() : (displayName !== 'YOUR NAME' ? displayName : '');

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

      {/* PROFILE CARD */}
      <div className={`card ${localStorage.getItem('userRole') === 'Organizer' ? 'is-organizer' : ''}`} id="profileCard" ref={cardRef}>
        <div className="poster">
          {/* Header */}
          <div className="ch">
            <div className="ch-name">प्रारम्भ</div>
            <div className="ch-live">
              <div className="ldot"></div>LIVE
            </div>
          </div>

          {/* Photo frame */}
          <div className="photo-s">
            <div className="pr" onClick={triggerPhoto} title="Tap to upload photo">
              <div className="pc">
                {profileImg ? (
                  <img src={profileImg} alt="Profile" crossOrigin="anonymous" />
                ) : (
                  <>
                    <div className="pe" id="photoEmoji">🎭</div>
                    <div className="pl" id="photoLabel">Add Photo</div>
                  </>
                )}
                <div className="pho">
                  <span>Change</span>
                </div>
              </div>
            </div>
            <input
              type="file"
              id="photoInput"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Name & College details */}
          <div className="ns">
            <div className="ns-pre">
              {localStorage.getItem('userRole') === 'Organizer' ? 'Organizer' : 'Participant'} &nbsp;·&nbsp; Prarambh 2025
            </div>
            <div className="ns-name" id="displayName" data-text={displayName}>
              {displayName}
            </div>
            <div className="ns-col" id="displayCollege">
              {displayCollege}
            </div>
          </div>

          {/* Ornament Divider */}
          <div className="div-orn">
            <div className="div-line"></div>
            <div className="div-ico">★</div>
            <div className="div-line"></div>
          </div>

          {localStorage.getItem('userRole') === 'Organizer' && (
            <div className="org-quote-wrap">
              <div className="org-quote-text">
                "Behind every great beginning is an extraordinary team."
              </div>
              <div className="org-quote-badge">ORGANIZER TEAM</div>
            </div>
          )}

          {/* DIALOGUE SCRATCH CARD */}
          {localStorage.getItem('userRole') !== 'Organizer' && (
            <div className="dlg-wrap">
              <div className="dlg-header">
                <div className="dlg-lbl">Dialogue</div>
                {!scratchRevealed && (
                  <div className="scratch-hint" id="scratchHint">
                    <span className="sh-icon">✦</span> Scratch to reveal
                  </div>
                )}
              </div>

              <div className="scratch-outer" id="scratchOuter" ref={outerRef}>
                {/* Text hidden beneath canvas */}
                <div className="dlg-box">
                  <span className="dlg-text" id="participantDialogue">
                    {dialogueText ? dialogueText.replace(/\s*\([^)]*\)\s*$/, '') : ''}
                  </span>
                </div>
                {/* Canvas Overlay */}
                <canvas
                  id="scratchCanvas"
                  ref={canvasRef}
                  className={scratchRevealed ? 'fully-revealed' : ''}
                />
                {/* Sparkle burst pop-up */}
                <div className={`reveal-burst ${isPopActive ? 'pop' : ''}`} id="revealBurst">
                  ✨
                </div>
              </div>

              {/* Quote Attribution Details */}
              {scratchRevealed && attributionName && (
                <div className="dlg-attr" id="dlgAttr" style={{ display: 'flex' }}>
                  <div className="dlg-dash"></div>
                  <div className="dlg-attr-name" id="dialogueAttrName">
                    {attributionName}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QR CODE SLOT */}
          {localStorage.getItem('userRole') !== 'Organizer' && (
            <div className="qr-wrap">
              <div className="qr-box">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Unique Verification QR" style={{ width: '100%', height: '100%', borderRadius: '2.5px' }} />
                ) : (
                  <div className="qr-placeholder">
                    <span className="qr-icon">📱</span>
                    <span className="qr-label">GENERATING...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOWNLOAD BUTTONS */}
          <div className="ca">
            {localStorage.getItem('userRole') === 'Organizer' ? (
              <button
                className="btn-download"
                onClick={() => downloadCard(true)}
                disabled={isDownloading}
                style={{ opacity: isDownloading ? 0.7 : 1, width: '100%' }}
              >
                <span className="dl-icon">⬇</span> {isDownloading ? 'Rendering...' : 'Download Card'}
              </button>
            ) : (
              <>
                <button
                  className="btn-download"
                  onClick={() => downloadCard(false)}
                  disabled={isDownloading}
                  style={{ opacity: isDownloading ? 0.7 : 1 }}
                >
                  <span className="dl-icon">⬇</span> {isDownloading ? 'Rendering...' : 'Download Profile'}
                </button>
                <button
                  className="btn-download btn-download-secondary"
                  onClick={() => downloadCard(true)}
                  disabled={isDownloading}
                  style={{ opacity: isDownloading ? 0.7 : 1 }}
                >
                  <span className="dl-icon">⬇</span> {isDownloading ? 'Rendering...' : 'Download (No QR Code)'}
                </button>
              </>
            )}
          </div>

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

      {/* Toast Feedback */}
      <div className={`toast ${isToastOpen ? 'show' : ''}`} id="toast">
        {toastMessage}
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
