'use client';
import React, { useState, useEffect, MutableRefObject } from 'react';
import { createPortal } from 'react-dom';

interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  text: string;
}

interface Props {
  transcriptHistory: MutableRefObject<TranscriptEntry[]>;
}

export function TranscriptionHistoryButton({ transcriptHistory }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [innerContainer, setInnerContainer] = useState<HTMLElement | null>(null);
  // Snapshot of history entries shown in the panel
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);

  // Insert the button into the control bar next to the disconnect button (same pattern as AIChatButton)
  useEffect(() => {
    let wrapper: HTMLDivElement | null = null;

    const findContainer = () => {
      const disconnectBtn = document.querySelector('.lk-disconnect-button');
      if (disconnectBtn && disconnectBtn.parentNode) {
        wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        disconnectBtn.parentNode.insertBefore(wrapper, disconnectBtn);
        setContainer(wrapper);
        return true;
      }
      return false;
    };

    if (!findContainer()) {
      const observer = new MutationObserver(() => {
        if (findContainer()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      };
    }

    return () => {
      if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    };
  }, []);

  // Find the master video conference container for the panel portal
  useEffect(() => {
    const findInner = () => {
      const el = document.querySelector('.lk-video-conference');
      if (el) {
        setInnerContainer(el as HTMLElement);
        return true;
      }
      return false;
    };

    if (!findInner()) {
      const observer = new MutationObserver(() => {
        if (findInner()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  // Mutual Exclusivity Logic
  useEffect(() => {
    const handlePanelOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== 'transcript-history') {
        setIsOpen(false);
      }
    };
    window.addEventListener('panel-opened', handlePanelOpen);

    const handleGlobalClick = (e: MouseEvent) => {
      if (!e.isTrusted) return;
      const target = e.target as Element;
      if (target.closest('.lk-chat-toggle')) {
        window.dispatchEvent(new CustomEvent('panel-opened', { detail: 'native-chat' }));
      }
    };
    document.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('panel-opened', handlePanelOpen);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // When the panel opens, take a snapshot of the current history
  const handleOpen = () => {
    setEntries([...transcriptHistory.current]);
    setIsOpen(true);
    
    const nativeChatBtn = document.querySelector('.lk-chat-toggle') as HTMLButtonElement | null;
    if (nativeChatBtn && nativeChatBtn.getAttribute('aria-pressed') === 'true') {
      nativeChatBtn.click();
    }
    window.dispatchEvent(new CustomEvent('panel-opened', { detail: 'transcript-history' }));
  };

  // Refresh snapshot while panel is open (every 2 s)
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => {
      setEntries([...transcriptHistory.current]);
    }, 2000);
    return () => clearInterval(id);
  }, [isOpen, transcriptHistory]);

  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isResizing) return;
      if (innerContainer) {
        const innerRect = innerContainer.getBoundingClientRect();
        const newWidth = innerRect.right - e.clientX;
        setPanelWidth(Math.max(250, Math.min(newWidth, Math.max(innerRect.width - 200, 300))));
      }
    };

    const handlePointerUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = '';
      }
    };

    if (isResizing) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
    }
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing, innerContainer]);

  const handlePointerDownResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const buttonContent = (
    <button
      className="lk-button"
      onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
      aria-pressed={isOpen}
      title="Transcript History"
      style={{
        marginRight: '8px',
        backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {/* Scroll / transcript icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>Transcript</span>
    </button>
  );

  const speakerColors: Record<string, string> = {};
  const palette = [
    'var(--lk-accent, #0070f3)',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
  ];

  const getSpeakerColor = (name: string) => {
    if (!speakerColors[name]) {
      const idx = Object.keys(speakerColors).length % palette.length;
      speakerColors[name] = palette[idx];
    }
    return speakerColors[name];
  };

  return (
    <>
      <style>{`
        .transcript-history-panel .lk-chat-messages {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
          scroll-behavior: smooth;
        }
        .transcript-history-panel .lk-chat-messages::-webkit-scrollbar { width: 5px; }
        .transcript-history-panel .lk-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .transcript-history-panel .lk-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .transcript-history-panel .lk-chat-messages::-webkit-scrollbar-thumb:hover {
          background: var(--lk-accent, #0070f3);
        }
        .transcript-entry {
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          border-color: var(--lk-accent, #0070f3) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .transcript-entry:hover {
          transform: translateY(-2px);
          border-color: var(--lk-accent, #0070f3) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `}</style>

      {container ? createPortal(buttonContent, container) : null}

      {isOpen && innerContainer && createPortal(
        <div 
          className="lk-chat transcript-history-panel"
          style={{ 
            width: `${panelWidth}px`, 
            minWidth: `${panelWidth}px`,
            userSelect: isResizing ? 'none' : undefined,
            position: 'relative'
          }}
        >
          {/* Drag Handle */}
          <div
            onPointerDown={handlePointerDownResize}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 10,
              backgroundColor: isResizing ? 'var(--lk-accent)' : 'transparent',
              transition: 'background-color 0.2s',
              opacity: isResizing ? 0.3 : 0
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.3'}
            onMouseOut={(e) => e.currentTarget.style.opacity = isResizing ? '0.3' : '0'}
          />
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid var(--lk-border-color)',
          }}>
            <span style={{
              fontWeight: 600,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'Inter, sans-serif',
              minWidth: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--lk-accent, #0070f3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Transcript History
            </span>
            <button
              className="lk-button lk-close-button"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div
            className="lk-chat-messages"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', overflowY: 'auto' }}
          >
            {entries.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                paddingTop: '2rem',
                opacity: 0.45,
                fontFamily: 'Inter, sans-serif',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span style={{ fontSize: '0.875rem' }}>No transcript yet</span>
              </div>
            ) : (
              entries.map((entry, idx) => {
                const color = getSpeakerColor(entry.speaker);
                return (
                  <div
                    key={idx}
                    className="lk-chat-entry transcript-entry"
                    style={{
                      background: 'var(--lk-bg)',
                      padding: '0.85rem',
                      borderRadius: '0.6rem',
                      border: '1px solid var(--lk-border-color)',
                      fontSize: '0.875rem',
                      color: 'var(--lk-fg)',
                      lineHeight: 1.5,
                    }}
                  >
                    {/* Speaker + timestamp row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color,
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {entry.speaker}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.35)',
                        fontFamily: 'Inter, sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {entry.timestamp}
                      </span>
                    </div>
                    {/* Transcript text */}
                    <div style={{ fontFamily: 'Inter, sans-serif' }}>
                      {entry.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        innerContainer
      )}
    </>
  );
}
