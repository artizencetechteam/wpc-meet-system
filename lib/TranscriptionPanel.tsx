'use client';
import React, { useState } from 'react';
import { useDeepgramTranscription } from './useDeepgramTranscription';

export function TranscriptionPanel() {
  const [enabled, setEnabled] = useState(false);

  const { currentText, interimText, connectionState } = useDeepgramTranscription(enabled);

  const statusColor: Record<string, string> = {
    idle: '#6b7280',
    connecting: '#f59e0b',
    connected: '#10b981',
    error: '#ef4444',
  };

  // The text to display: prefer interim while speaking, fall back to last final
  const displayText = interimText || currentText;

  return (
    <>
      {/* ── Fixed toggle button, bottom-right ── */}
      <button
        id="deepgram-transcription-toggle"
        onClick={() => setEnabled((v) => !v)}
        title={enabled ? 'Stop Live Captions' : 'Start Live Captions'}
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '20px',
          zIndex: 9999,
          background: enabled ? 'rgba(99,102,241,0.92)' : 'rgba(20,20,35,0.88)',
          color: 'white',
          border: `1px solid ${enabled ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.15)'}`,
          padding: '10px 18px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(12px)',
          boxShadow: enabled
            ? '0 0 18px rgba(99,102,241,0.45)'
            : '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Mic icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>

        {enabled ? 'Stop CC' : 'Live CC'}

        {enabled && (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: statusColor[connectionState] ?? '#6b7280',
            boxShadow: connectionState === 'connected' ? '0 0 5px #10b981' : 'none',
            display: 'inline-block',
            animation: connectionState === 'connecting' ? 'cc-pulse 1s infinite' : 'none',
          }} />
        )}
      </button>

      {/* ── Live subtitle bar — only when enabled and there's text ── */}
      {enabled && displayText && (
        <div
          id="deepgram-caption-bar"
          style={{
            position: 'fixed',
            bottom: '82px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'min(720px, 88vw)',
            zIndex: 9998,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(8px)',
              color: interimText ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.95)',
              fontSize: '17px',
              fontWeight: interimText ? 400 : 500,
              fontStyle: interimText ? 'italic' : 'normal',
              lineHeight: 1.5,
              padding: '6px 20px',
              borderRadius: '8px',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.1px',
              display: 'inline-block',
            }}
          >
            {displayText}
          </span>
        </div>
      )}

      {/* ── Connecting hint ── */}
      {enabled && !displayText && connectionState === 'connecting' && (
        <div style={{
          position: 'fixed', bottom: '82px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9998, pointerEvents: 'none',
        }}>
          <span style={{
            background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.4)',
            fontSize: '13px', padding: '5px 16px', borderRadius: '6px',
            fontFamily: 'Inter, system-ui, sans-serif', fontStyle: 'italic',
          }}>
            Connecting…
          </span>
        </div>
      )}

      <style>{`
        @keyframes cc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </>
  );
}
