'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useDeepgramTranscription } from './useDeepgramTranscription';

export function TranscriptionPanel() {
  const [enabled, setEnabled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { transcriptLines, interimText, connectionState, clearTranscript } =
    useDeepgramTranscription(enabled);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptLines, interimText]);

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false);
    } else {
      setEnabled(true);
      setPanelOpen(true);
    }
  };

  const statusColor: Record<string, string> = {
    idle: '#6b7280',
    connecting: '#f59e0b',
    connected: '#10b981',
    error: '#ef4444',
  };

  return (
    <>
      {/* ── Fixed toggle button, bottom-right of screen ── */}
      <div
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {/* Show-panel button when panel is hidden but enabled */}
        {enabled && !panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            style={{
              pointerEvents: 'all',
              background: 'rgba(10,10,20,0.85)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Show Captions ↑
          </button>
        )}

        {/* Main CC toggle button */}
        <button
          id="deepgram-transcription-toggle"
          onClick={handleToggle}
          title={enabled ? 'Stop Live Captions' : 'Start Live Captions'}
          style={{
            pointerEvents: 'all',
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
            letterSpacing: '0.3px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Microphone icon */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          {enabled ? 'Stop CC' : 'Live CC'}

          {/* Live status dot */}
          {enabled && (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: statusColor[connectionState] ?? '#6b7280',
                boxShadow: connectionState === 'connected' ? '0 0 5px #10b981' : 'none',
                display: 'inline-block',
                animation: connectionState === 'connecting' ? 'cc-pulse 1s infinite' : 'none',
              }}
            />
          )}
        </button>
      </div>

      {/* ── Floating transcript panel — centered at bottom ── */}
      {enabled && panelOpen && (
        <div
          id="deepgram-transcript-panel"
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(700px, 90vw)',
            maxHeight: '200px',
            background: 'rgba(8, 8, 18, 0.85)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '16px',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: statusColor[connectionState] ?? '#6b7280',
                  boxShadow: connectionState === 'connected' ? '0 0 6px #10b981' : 'none',
                  display: 'inline-block',
                }}
              />
              <span
                style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '12px' }}
              >
                Live Captions
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '11px',
                  textTransform: 'capitalize',
                }}
              >
                · {connectionState}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={clearTranscript}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                Clear
              </button>
              <button
                onClick={() => setPanelOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Transcript area */}
          <div
            ref={scrollRef}
            style={{
              overflowY: 'auto',
              padding: '10px 16px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            {transcriptLines.length === 0 && !interimText && (
              <p
                style={{
                  color: 'rgba(255,255,255,0.28)',
                  fontSize: '13px',
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                {connectionState === 'connecting'
                  ? 'Connecting to Deepgram…'
                  : 'Speak to see captions here'}
              </p>
            )}

            {transcriptLines.map((line) => (
              <p
                key={line.id}
                style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: 1.65 }}
              >
                <span
                  style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '11px',
                    marginRight: '8px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {line.text}
              </p>
            ))}

            {interimText && (
              <p
                style={{
                  margin: 0,
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '14px',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                }}
              >
                {interimText}
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes cc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </>
  );
}
