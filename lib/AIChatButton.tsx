'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const API_BASE = process.env.NEXT_PUBLIC_WPC_API_URL ?? 'http://127.0.0.1:8000';


const QUESTION_GROUPS = [
  {
    title: "Introduction & Qualities",
    questions: [
      "What do you believe are the most important qualities for a Chief Executive to possess, and how do you embody those qualities?",
      "Can you describe your experience in leading cross-functional teams and how you would apply this to a senior leadership role?",
      "How do you think your UX design background will influence your approach to strategic decision-making as a Chief Executive?"
    ]
  },
  {
    title: "Strategy & Vision",
    questions: [
      "Can you walk us through your process for developing and executing a corporate strategy, and how you would measure its success?",
      "How do you stay up-to-date with industry trends and developments, and how do you see yourself applying this knowledge as a Chief Executive?"
    ]
  },
  {
    title: "Leadership & Organization",
    questions: [
      "How would you foster a culture of innovation, accountability, and collaboration within our organization?",
      "How do you build and maintain relationships with stakeholders, partners, and regulators, and what do you believe are the key factors in successful relationship-building?",
      "Can you provide an example of a time when you had to communicate complex design concepts to a non-technical audience, and how you approached this challenge?"
    ]
  },
  {
    title: "Operations & Execution",
    questions: [
      "Can you describe your experience with financial management and budgeting, and how you would approach these responsibilities as a Chief Executive?",
      "How do you handle conflicting priorities and tight deadlines in a fast-paced environment, and what strategies do you use to manage stress?"
    ]
  }
];


export function AIChatButton({ roomName }: { roomName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [innerContainer, setInnerContainer] = useState<HTMLElement | null>(null);

  const [aiContent, setAiContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (isOpen && !aiContent && !isLoading && roomName && !hasFetched.current) {
      hasFetched.current = true;
      setIsLoading(true);
      setErrorMsg('');
      const token = sessionStorage.getItem('employer_token');
      
      fetch(`${API_BASE}/api/employer/interview-schedule/8B1C3E/`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
        } else if (data.ai_interview_question_to_ask?.categories) {
          const formattedContent = data.ai_interview_question_to_ask.categories.map((c: any) => ({
            title: c.category,
            questions: c.questions || []
          }));
          setAiContent(formattedContent);
        } else if (data.ai_generation_question) {
          setAiContent(data.ai_generation_question);
        } else if (data.questions || data.ai_questions) {
          setAiContent(data.questions || data.ai_questions);
        } else {
          // Fallback if structure is unknown
          setAiContent(data);
        }
      })
      .catch(err => {
        setErrorMsg('Failed to load questions.');
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen, roomName, aiContent, isLoading]);

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

  // Mutual Exclusivity Logic
  useEffect(() => {
    const handlePanelOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== 'ai-chat') {
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

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      const nativeChatBtn = document.querySelector('.lk-chat-toggle') as HTMLButtonElement | null;
      if (nativeChatBtn && nativeChatBtn.getAttribute('aria-pressed') === 'true') {
        nativeChatBtn.click();
      }
      window.dispatchEvent(new CustomEvent('panel-opened', { detail: 'ai-chat' }));
    }
  };

  const buttonContent = (
    <button
      className="lk-button"
      onClick={handleToggle}
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
      <span style={{ fontSize: '14px', fontWeight: 500 }}>AI Question</span>
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

        .ai-chat-panel .lk-chat-messages {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
          scroll-behavior: smooth;
        }

        .ai-chat-panel .lk-chat-messages::-webkit-scrollbar {
          width: 5px;
        }

        .ai-chat-panel .lk-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .ai-chat-panel .lk-chat-messages::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .ai-chat-panel .lk-chat-messages::-webkit-scrollbar-thumb:hover {
          background: var(--lk-accent, #0070f3);
        }

        .ai-chat-panel .lk-chat-entry {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .ai-chat-panel .lk-chat-entry:hover {
          transform: translateY(-2px);
          border-color: var(--lk-accent, #0070f3) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.03) !important;
        }
      `}</style>

      {container ? createPortal(buttonContent, container) : null}

      {isOpen && innerContainer && createPortal(
        <div
          className="lk-chat ai-chat-panel"
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

          <div className="lk-chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem', overflowY: 'auto' }}>
            {(() => {
              if (isLoading) {
                return <div style={{ color: 'var(--lk-fg)', opacity: 0.8, textAlign: 'center', padding: '2.5rem' }}>Loading AI questions...</div>;
              }
              
              if (errorMsg) {
                return <div style={{ color: '#fca5a5', textAlign: 'center', padding: '2.5rem' }}>{errorMsg}</div>;
              }

              const groupsToRender = aiContent && Array.isArray(aiContent) && aiContent.length > 0 && aiContent[0].title 
                ? aiContent 
                : (!aiContent ? QUESTION_GROUPS : null);

              if (groupsToRender) {
                let questionIndex = 0;
                return groupsToRender.map((group: any, groupIdx: number) => (
                  <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--lk-accent)',
                      margin: '0 0.25rem',
                      fontWeight: 700,
                      opacity: 0.8
                    }}>
                      {group.title}
                    </h3>
                    {group.questions.map((q: any) => {
                      questionIndex++;
                      return (
                        <div key={questionIndex} className="lk-chat-entry" style={{
                          background: 'var(--lk-bg)',
                          padding: '0.85rem',
                          borderRadius: '0.6rem',
                          border: '1px solid var(--lk-border-color)',
                          fontSize: '0.875rem',
                          color: 'var(--lk-fg)',
                          lineHeight: 1.5,
                          transition: 'transform 0.2s ease, border-color 0.2s ease',
                          cursor: 'default'
                        }}>
                          <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px'
                              }}>
                                <span style={{
                                  background: 'var(--lk-accent)',
                                  color: 'white',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  flexShrink: 0
                                }}>
                                  {questionIndex}
                                </span>

                                <div style={{
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {typeof q === 'string' ? q : JSON.stringify(q, null, 2)}
                                </div>
                              </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              }

              // Fallback for flat or unstructured aiContent
              const contentToRender = typeof aiContent === 'string' ? [aiContent] 
                                    : Array.isArray(aiContent) ? aiContent 
                                    : [JSON.stringify(aiContent, null, 2)];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{
                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: 'var(--lk-accent)', margin: '0 0.25rem', fontWeight: 700, opacity: 0.8
                  }}>
                    Generated Questions
                  </h3>
                  {contentToRender.map((q, idx) => (
                    <div key={idx} className="lk-chat-entry" style={{
                      background: 'var(--lk-bg)', padding: '0.85rem', borderRadius: '0.6rem',
                      border: '1px solid var(--lk-border-color)', fontSize: '0.875rem',
                      color: 'var(--lk-fg)', lineHeight: 1.5, transition: 'transform 0.2s ease, border-color 0.2s ease', cursor: 'default'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{
                          background: 'var(--lk-accent)', color: 'white', borderRadius: '6px',
                          padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0
                        }}>
                          {idx + 1}
                        </span>
                        <div style={{ fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {typeof q === 'string' ? q : JSON.stringify(q, null, 2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>,
        innerContainer
      )}
    </>
  );
}
