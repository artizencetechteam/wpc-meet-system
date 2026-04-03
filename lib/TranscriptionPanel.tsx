'use client';
import React, { useState, useEffect } from 'react';
import { useDeepgramTranscription } from './useDeepgramTranscription';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export function TranscriptionPanel() {
  const [enabled, setEnabled] = useState(false);

  // Local transcription
  const { currentText, interimText, connectionState } = useDeepgramTranscription(enabled);
  
  // LiveKit hooks for broadcasting and identity
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  // State to hold the currently displayed caption (from anyone)
  const [displayCaption, setDisplayCaption] = useState<{
    name: string;
    text: string;
    isInterim: boolean;
  } | null>(null);

  // 1. Broadcast local transcription when it changes
  useEffect(() => {
    if (!enabled || (!interimText && !currentText)) return;

    const textToSend = interimText || currentText;
    const isInterim = !!interimText;
    const name = localParticipant.name || localParticipant.identity || 'You';

    // Optimistically update our own display
    setDisplayCaption({ name, text: textToSend, isInterim });

    // Send payload to others
    if (room && room.state === 'connected') {
      const payload = JSON.stringify({ type: 'cc', name, text: textToSend, isInterim });
      const encoded = new TextEncoder().encode(payload);
      // We use reliable=false for interims to save bandwidth, true for final
      room.localParticipant.publishData(encoded, { reliable: !isInterim, topic: 'cc' });
    }
  }, [interimText, currentText, enabled, localParticipant, room]);

  // 2. Listen for incoming transcriptions from others
  useEffect(() => {
    if (!room || !enabled) return;

    const handleDataReceived = (
      payload: Uint8Array,
      participant: any,
      kind: any,
      topic?: string
    ) => {
      if (topic === 'cc') {
        try {
          const decoded = new TextDecoder().decode(payload);
          const msg = JSON.parse(decoded);
          if (msg.type === 'cc') {
            setDisplayCaption({
              name: msg.name,
              text: msg.text,
              isInterim: msg.isInterim,
            });
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, enabled]);

  const statusColor: Record<string, string> = {
    idle: '#6b7280',
    connecting: '#f59e0b',
    connected: '#10b981',
    error: '#ef4444',
  };

  // Determine what string to show in the UI
  let textToRender = '';
  let isInterimRender = false;
  if (displayCaption && displayCaption.text) {
    textToRender = `${displayCaption.name}: ${displayCaption.text}`;
    isInterimRender = displayCaption.isInterim;
  }

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
      {enabled && textToRender && (
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
              color: isInterimRender ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.95)',
              fontSize: '17px',
              fontWeight: isInterimRender ? 400 : 500,
              fontStyle: isInterimRender ? 'italic' : 'normal',
              lineHeight: 1.5,
              padding: '6px 20px',
              borderRadius: '8px',
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '0.1px',
              display: 'inline-block',
            }}
          >
            {textToRender}
          </span>
        </div>
      )}

      {/* ── Connecting hint ── */}
      {enabled && !textToRender && connectionState === 'connecting' && (
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
