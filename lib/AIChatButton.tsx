'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const QUESTIONS = [
  "Can you describe your experience in leading cross-functional teams and how you would apply this to a senior leadership role?",
  "How do you think your UX design background will influence your approach to strategic decision-making as a Chief Executive?",
  "What do you believe are the most important qualities for a Chief Executive to possess, and how do you embody those qualities?",
  "How would you foster a culture of innovation, accountability, and collaboration within our organization?",
  "Can you provide an example of a time when you had to communicate complex design concepts to a non-technical audience, and how you approached this challenge?",
  "How do you stay up-to-date with industry trends and developments, and how do you see yourself applying this knowledge as a Chief Executive?",
  "Can you walk us through your process for developing and executing a corporate strategy, and how you would measure its success?",
  "How do you handle conflicting priorities and tight deadlines in a fast-paced environment, and what strategies do you use to manage stress?",
  "Can you describe your experience with financial management and budgeting, and how you would approach these responsibilities as a Chief Executive?",
  "How do you build and maintain relationships with stakeholders, partners, and regulators, and what do you believe are the key factors in successful relationship-building?"
];

export function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [innerContainer, setInnerContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let wrapper: HTMLDivElement | null = null;

    const findContainer = () => {
      // Find the leave button to insert next to it
      const disconnectBtn = document.querySelector('.lk-disconnect-button');
      if (disconnectBtn && disconnectBtn.parentNode) {
        wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        
        // Insert right before the disconnect button
        disconnectBtn.parentNode.insertBefore(wrapper, disconnectBtn);
        setContainer(wrapper);
        return true;
      }
      return false;
    };

    if (!findContainer()) {
      const observer = new MutationObserver(() => {
        if (findContainer()) {
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        if (wrapper && (wrapper as HTMLDivElement).parentNode) {
          (wrapper as HTMLDivElement).parentNode?.removeChild(wrapper as HTMLDivElement);
        }
      };
    }

    return () => {
      if (wrapper && (wrapper as HTMLDivElement).parentNode) {
        (wrapper as HTMLDivElement).parentNode?.removeChild(wrapper as HTMLDivElement);
      }
    };
  }, []);

  // Find the master video conference container
  useEffect(() => {
    const findInner = () => {
      const container = document.querySelector('.lk-video-conference');
      if (container) {
        setInnerContainer(container as HTMLElement);
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

  // No longer strictly need data-ai-chat-open since flexbox will naturally shift
  // However, we preserve the animation and base CSS


  const buttonContent = (
    <button
      className="lk-button"
      onClick={() => setIsOpen(!isOpen)}
      aria-pressed={isOpen}
      title="AI Questions"
      style={{
        marginRight: '8px',
        backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <path d="M12 7v0"></path>
        <path d="M12 11v0"></path>
        <path d="M12 15v0"></path>
      </svg>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>AI Chat</span>
    </button>
  );

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .lk-video-conference .lk-chat.ai-chat-panel {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
          }
        }
      `}</style>

      {container ? createPortal(buttonContent, container) : null}

      {isOpen && innerContainer && createPortal(
        <div 
          className="lk-chat ai-chat-panel" 
          
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid var(--lk-border-color)'
          }}>
            <span style={{ 
              fontWeight: 600, 
              fontSize: '1.05rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              fontFamily: 'Inter, sans-serif',
              minWidth: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--lk-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M12 7v0"></path>
                <path d="M12 11v0"></path>
                <path d="M12 15v0"></path>
              </svg>
              AI Questions
            </span>
            <button
              className="lk-button lk-close-button"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="lk-chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', overflowY: 'auto' }}>
            {QUESTIONS.map((q, i) => (
              <div key={i} className="lk-chat-entry" style={{
                background: 'var(--lk-bg)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--lk-border-color)',
                fontSize: '0.875rem',
                color: 'var(--lk-fg)',
                lineHeight: 1.4
              }}>
                <div style={{ color: 'var(--lk-accent-fg)', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                  Question {i + 1}
                </div>
                {q}
              </div>
            ))}
          </div>
        </div>,
        innerContainer
      )}
    </>
  );
}
