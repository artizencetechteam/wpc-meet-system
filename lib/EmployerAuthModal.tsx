'use client';

import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_WPC_API_URL ?? 'https://api.wpcjobs.co.uk';

type Step = 'ask' | 'login' | 'loading' | 'done';

interface Props {
  onDone: (isEmployer: boolean, token?: string) => void;
}

export function EmployerAuthModal({ onDone }: Props) {
  const [step, setStep] = useState<Step>('ask');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('loading');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'employer' }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          data?.non_field_errors?.[0] ||
          'Login failed. Please check your credentials.';
        setError(msg);
        setStep('login');
        return;
      }

      // Save token to sessionStorage so the rest of the app can use it
      const token = data?.access || data?.token || '';
      if (token) sessionStorage.setItem('employer_token', token);

      setStep('done');
      onDone(true, token);
    } catch {
      setError('Network error. Please try again.');
      setStep('login');
    }
  };

  // ── Overlay backdrop ───────────────────────────────────────────────────
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <span style={styles.brandName}>WPC Video Conferencing</span>
        </div>

        {/* ── ASK step ─────────────────────────── */}
        {step === 'ask' && (
          <>
            <h2 style={styles.heading}>Are you an Employer?</h2>
            <p style={styles.subtext}>
              Employers can access additional controls during the meeting.
            </p>
            <div style={styles.btnRow}>
              <button
                style={{ ...styles.btn, ...styles.btnPrimary }}
                onClick={() => setStep('login')}
              >
                Yes, Login as Employer
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary }}
                onClick={() => onDone(false)}
              >
                No, Continue as Guest
              </button>
            </div>
          </>
        )}

        {/* ── LOGIN step ───────────────────────── */}
        {step === 'login' && (
          <>
            <h2 style={styles.heading}>Employer Login</h2>
            <p style={styles.subtext}>Sign in with your employer credentials to continue.</p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleLogin} style={styles.form}>
              <label style={styles.label} htmlFor="emp-email">
                Email
              </label>
              <input
                id="emp-email"
                type="email"
                required
                autoFocus
                placeholder="hiring.manager@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label} htmlFor="emp-password">
                Password
              </label>
              <input
                id="emp-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />

              <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary, marginTop: 8 }}>
                Login
              </button>
            </form>

            <button
              style={styles.backLink}
              onClick={() => {
                setError('');
                setStep('ask');
              }}
            >
              ← Back
            </button>
          </>
        )}

        {/* ── LOADING step ─────────────────────── */}
        {step === 'loading' && (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={{ color: '#94a3b8', marginTop: 16 }}>Verifying credentials…</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Inline styles (no Tailwind dependency) ─────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
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
  },
  card: {
    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 20,
    padding: '40px 48px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
    animation: 'fadeIn 0.3s ease',
    textAlign: 'center' as const,
    fontFamily: "'Inter', sans-serif",
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  brandIcon: {
    fontSize: 22,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#94a3b8',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  heading: {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 700,
    color: '#f1f5f9',
    lineHeight: 1.3,
  },
  subtext: {
    margin: '0 0 28px',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
  },
  btnRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  btn: {
    width: '100%',
    padding: '13px 20px',
    borderRadius: 10,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    textAlign: 'left' as const,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: 2,
    marginTop: 8,
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid rgba(99,102,241,0.3)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'left' as const,
  },
  backLink: {
    marginTop: 20,
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px 0',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
