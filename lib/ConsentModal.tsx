'use client';

import React, { useState } from 'react';

interface Props {
  isEmployer: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentModal({ isEmployer, onAccept, onDecline }: Props) {
  const [checked, setChecked] = useState(false);
  const role = isEmployer ? 'Employer' : 'Candidate';

  return (
    <div style={s.overlay} className="consent-overlay">
      {/* ── Two-panel card ─────────────────────────────────────────── */}
      <div style={s.card} className="consent-card">

        {/* ══ LEFT PANEL — brand / visual ══ */}
        <div style={s.leftPanel} className="consent-left">
          {/* Decorative blobs */}
          <div style={s.blob1} />
          <div style={s.blob2} />

          <div style={s.leftInner} className="consent-left-inner">
            {/* Shield icon */}
            <div style={s.iconWrap} className="consent-icon-wrap">
              <div style={s.iconPulse} />
              <div style={s.iconRing}>
                <ShieldIcon />
              </div>
            </div>

            <p style={s.leftBrand}>WPC Video Conferencing</p>
            <h1 style={s.leftTitle} className="consent-left-title">Meeting Consent</h1>
            <p style={s.leftSub} className="consent-left-sub">
              Secure, transparent and compliant video interviews — powered by WPC.
            </p>

            {/* Role badge */}
            <div style={s.roleBadge}>
              <span style={s.roleDot} />
              Joining as <strong style={s.roleStrong}>&nbsp;{role}</strong>
            </div>

            {/* Decorative steps */}
            <div style={s.stepList} className="consent-step-list">
              {[
                { n: '01', label: 'Employer Auth' },
                { n: '02', label: 'Consent',       active: true },
                { n: '03', label: 'Device Setup' },
                { n: '04', label: 'Join Meeting' },
              ].map((st) => (
                <div key={st.n} style={{ ...s.step, ...(st.active ? s.stepActive : {}) }}>
                  <span style={{ ...s.stepNum, ...(st.active ? s.stepNumActive : {}) }}>{st.n}</span>
                  <span style={s.stepLabel}>{st.label}</span>
                  {st.active && <span style={s.stepPip} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL — consent form ══ */}
        <div style={s.rightPanel} className="consent-right">
          <div style={s.rightInner} className="consent-right-inner">
            <h2 style={s.rightTitle} className="consent-right-title">Recording &amp; Participation Consent</h2>
            <p style={s.rightSub}>
              Please review the terms below. Both the employer and candidate must individually
              accept before the meeting begins.
            </p>

            {/* Terms list */}
            <div style={s.termsList}>
              <TermRow icon="🎙️" text="This session will be recorded for quality assurance and evaluation purposes." />
              <TermRow icon="👤" text="Your audio, video, and transcription data may be captured and stored securely." />
              <TermRow icon="🔒" text="Data is handled in accordance with our Privacy Policy and applicable data protection laws." />
              <TermRow icon="🤝" text="Both participants must individually accept consent before joining." />
            </div>

            {/* Checkbox agreement */}
            <label style={s.checkLabel} htmlFor="consent-checkbox">
              <div style={{ position: 'relative', flexShrink: 0, width: 22, height: 22 }}>
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  style={s.hiddenInput}
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <div style={{ ...s.customBox, ...(checked ? s.customBoxChecked : {}) }}>
                  {checked && <CheckIcon />}
                </div>
              </div>
              <span style={s.checkText}>
                I have read and agree to the recording consent and participation terms for this meeting.
              </span>
            </label>

            {/* Action buttons */}
            <div style={s.btnRow} className="consent-btn-row">
              <button
                id="consent-accept-btn"
                style={{ ...s.btn, ...s.btnAccept, ...(!checked ? s.btnDisabled : {}) }}
                disabled={!checked}
                onClick={onAccept}
              >
                <span style={s.btnIcon}>✓</span> Accept &amp; Join Meeting
              </button>
              <button
                id="consent-decline-btn"
                style={{ ...s.btn, ...s.btnDecline }}
                onClick={onDecline}
              >
                Decline &amp; Exit
              </button>
            </div>

            <p style={s.footNote}>
              Declining will return you to the home page. Your acceptance is recorded per session.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes consent-fadein {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes consent-pulse {
          0%  { transform: scale(1);   opacity: 0.55; }
          70% { transform: scale(1.6); opacity: 0;    }
          100%{ transform: scale(1.6); opacity: 0;    }
        }
        @keyframes consent-blob1 {
          0%, 100% { transform: translate(0, 0)   scale(1);   }
          50%       { transform: translate(20px, 15px) scale(1.08); }
        }
        @keyframes consent-blob2 {
          0%, 100% { transform: translate(0, 0)    scale(1);   }
          50%       { transform: translate(-15px, 20px) scale(1.06); }
        }
        #consent-accept-btn:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 32px rgba(79,70,229,0.45) !important;
        }
        #consent-decline-btn:hover {
          background: rgba(239,68,68,0.08) !important;
          border-color: rgba(239,68,68,0.35) !important;
          color: #ef4444 !important;
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .consent-overlay {
            padding: 1rem !important;
            align-items: flex-start !important;
            overflow-y: auto !important;
          }
          .consent-card {
            flex-direction: column !important;
            min-height: auto !important;
            margin: auto 0 !important;
          }
          .consent-left {
            width: 100% !important;
          }
          .consent-left-inner {
            padding: 32px 24px !important;
          }
          .consent-icon-wrap {
            margin-bottom: 20px !important;
            width: 56px !important;
            height: 56px !important;
          }
          .consent-left-title {
            font-size: 24px !important;
          }
          .consent-left-sub {
            margin-bottom: 16px !important;
            font-size: 13px !important;
          }
          .consent-step-list {
            display: none !important;
          }
          .consent-right {
            width: 100% !important;
          }
          .consent-right-inner {
            padding: 32px 24px !important;
          }
          .consent-right-title {
            font-size: 20px !important;
            margin-bottom: 6px !important;
          }
        }

        @media (max-width: 480px) {
          .consent-left-inner {
            padding: 24px 16px !important;
          }
          .consent-right-inner {
            padding: 24px 16px !important;
          }
          .consent-btn-row button {
            padding: 11px 16px !important;
            font-size: 14px !important;
          }
          .consent-overlay {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function TermRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={t.row}>
      <span style={t.icon}>{icon}</span>
      <span style={t.text}>{text}</span>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const s: Record<string, React.CSSProperties> = {
  /* ── overlay uses the project's shared page gradient ── */
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eaf6 40%, #ede9fe 100%)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    padding: '1.5rem',
  },

  /* ── two-panel container ── */
  card: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: 900,
    minHeight: 540,
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(79,70,229,0.22), 0 2px 0 rgba(255,255,255,0.7) inset',
    animation: 'consent-fadein 0.4s cubic-bezier(0.22,1,0.36,1) both',
    fontFamily: "'Inter', sans-serif",
  },

  /* ══ LEFT PANEL ══ */
  leftPanel: {
    position: 'relative',
    width: '42%',
    flexShrink: 0,
    background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    animation: 'consent-blob1 7s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    animation: 'consent-blob2 9s ease-in-out infinite',
    pointerEvents: 'none',
  },
  leftInner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '44px 36px',
    height: '100%',
  },
  iconWrap: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    width: 72,
    height: 72,
  },
  iconPulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.45)',
    animation: 'consent-pulse 2.2s ease-out infinite',
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
  leftBrand: {
    margin: 0,
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  leftTitle: {
    margin: '0 0 10px',
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  leftSub: {
    margin: '0 0 28px',
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.65,
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 100,
    padding: '6px 14px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 'auto',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    width: 'fit-content',
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#86efac',
    boxShadow: '0 0 6px #4ade80',
    flexShrink: 0,
  },
  roleStrong: {
    color: '#fff',
    fontWeight: 700,
  },

  /* Progress steps */
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 32,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    opacity: 0.45,
  },
  stepActive: {
    opacity: 1,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.06em',
    width: 24,
    flexShrink: 0,
  },
  stepNumActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: 500,
    flex: 1,
  },
  stepPip: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#a5f3fc',
    boxShadow: '0 0 6px #67e8f9',
  },

  /* ══ RIGHT PANEL ══ */
  rightPanel: {
    flex: 1,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  rightInner: {
    padding: '44px 44px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  rightTitle: {
    margin: '0 0 8px',
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  rightSub: {
    margin: '0 0 24px',
    fontSize: 13.5,
    color: '#6b7280',
    lineHeight: 1.65,
  },

  /* Terms */
  termsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    marginBottom: 24,
    border: '1.5px solid #e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
  },

  /* Checkbox */
  checkLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    cursor: 'pointer',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1.5px solid #e5e7eb',
    background: '#f9fafb',
    marginBottom: 20,
    transition: 'border-color 0.2s, background 0.2s',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  customBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: '2px solid #d1d5db',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
  },
  customBoxChecked: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    border: '2px solid #4f46e5',
    boxShadow: '0 0 0 3px rgba(79,70,229,0.15)',
  },
  checkText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.6,
    paddingTop: 1,
  },

  /* Buttons */
  btnRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  btn: {
    width: '100%',
    padding: '13px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    letterSpacing: '-0.01em',
  },
  btnAccept: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  btnDecline: {
    background: 'transparent',
    color: '#9ca3af',
    border: '1.5px solid #e5e7eb',
  },
  btnIcon: {
    fontSize: 16,
  },
  footNote: {
    marginTop: 16,
    fontSize: 11.5,
    color: '#9ca3af',
    lineHeight: 1.6,
    textAlign: 'center',
  },
};

/* ── Term row styles ─────────────────────────────────────────── */
const t: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '13px 16px',
    borderBottom: '1px solid #f3f4f6',
  },
  icon: {
    fontSize: 17,
    flexShrink: 0,
    marginTop: 1,
    lineHeight: 1,
  },
  text: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.6,
  },
};
