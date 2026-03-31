'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

/* ─────────────────────── SVG Icons ─────────────────────── */
function MicIcon({ muted }: { muted?: boolean }) {
  return muted ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function CameraIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h1a2 2 0 012 2v9.34" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/* ─────────────────────── Video Preview ─────────────────────── */
function VideoPreview({ camOn }: { camOn: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) {
          // Component unmounted or cam turned off while we were awaiting – stop immediately
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
      }
    }

    function stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    if (camOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [camOn]);

  return (
    <div className={styles.videoPreview}>
      {/* Live video — hidden when cam is off */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={styles.videoElement}
        style={{ display: camOn ? 'block' : 'none' }}
      />

      {/* Placeholder shown when cam is off */}
      {!camOn && (
        <div className={styles.videoPreviewInner}>
          <div className={styles.avatarRing}>
            <UserIcon />
          </div>
          <span className={styles.previewLabel}>Camera off</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Media Controls ─────────────────────── */
function MediaControls({
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
}: {
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}) {
  return (
    <div className={styles.controls}>
      <button
        id="toggle-mic"
        className={`${styles.toggleBtn} ${micOn ? styles.active : ''}`}
        onClick={onToggleMic}
        aria-pressed={micOn}
        title={micOn ? 'Mute microphone' : 'Unmute microphone'}
      >
        <MicIcon muted={!micOn} />
        {micOn ? 'Mic On' : 'Muted'}
      </button>
      <button
        id="toggle-camera"
        className={`${styles.toggleBtn} ${camOn ? styles.active : ''}`}
        onClick={onToggleCam}
        aria-pressed={camOn}
        title={camOn ? 'Turn off camera' : 'Turn on camera'}
      >
        <CameraIcon off={!camOn} />
        {camOn ? 'Camera On' : 'Cam Off'}
      </button>
    </div>
  );
}

/* ─────────────────────── Tab Switcher ─────────────────────── */
function Tabs(props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'custom' ? 1 : 0;
  const router = useRouter();

  function onTabSelected(index: number) {
    router.push(`/?tab=${index === 1 ? 'custom' : 'demo'}`);
  }

  const tabs = React.Children.map(props.children, (child, index) => (
    <button key={index} onClick={() => onTabSelected(index)} aria-pressed={tabIndex === index}>
      {/* @ts-ignore */}
      {child?.props.label}
    </button>
  ));

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {/* @ts-ignore */}
      {props.children[tabIndex]}
    </div>
  );
}

/* ─────────────────────── Demo Tab ─────────────────────── */
function DemoMeetingTab(props: { label: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const startMeeting = () => {
    const dest = e2ee
      ? `/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`
      : `/rooms/${generateRoomId()}`;
    router.push(dest);
  };

  return (
    <div className={styles.tabContent}>
      <p>Jump into a live demo room no account required.</p>

      <div className={styles.inputRow}>
        <label className={styles.inputLabel} htmlFor="demo-name">Your name</label>
        <input
          id="demo-name"
          className={styles.inputField}
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className={styles.checkboxRow}>
        <input
          id="demo-e2ee"
          type="checkbox"
          checked={e2ee}
          onChange={(ev) => setE2ee(ev.target.checked)}
        />
        <label htmlFor="demo-e2ee">Enable end-to-end encryption</label>
      </div>

      {e2ee && (
        <div className={styles.inputRow}>
          <label className={styles.inputLabel} htmlFor="demo-passphrase">Passphrase</label>
          <input
            id="demo-passphrase"
            className={styles.inputField}
            type="password"
            placeholder="Shared passphrase"
            value={sharedPassphrase}
            onChange={(ev) => setSharedPassphrase(ev.target.value)}
          />
        </div>
      )}

      <button
        id="start-meeting-btn"
        className={styles.joinBtn}
        onClick={startMeeting}
        disabled={!name.trim()}
      >
        Join Room →
      </button>
    </div>
  );
}

/* ─────────────────────── Custom Tab ─────────────────────── */
function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const serverUrl = formData.get('serverUrl');
    const token = formData.get('token');
    router.push(
      e2ee
        ? `/custom/?liveKitUrl=${serverUrl}&token=${token}#${encodePassphrase(sharedPassphrase)}`
        : `/custom/?liveKitUrl=${serverUrl}&token=${token}`,
    );
  };

  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      <p>Connect with a custom WPC server and token.</p>

      <div className={styles.inputRow}>
        <label className={styles.inputLabel} htmlFor="serverUrl">Server URL</label>
        <input
          id="serverUrl"
          name="serverUrl"
          className={styles.inputField}
          type="url"
          placeholder="wss://*.wpc.cloud"
          required
        />
      </div>

      <div className={styles.inputRow}>
        <label className={styles.inputLabel} htmlFor="token">Access Token</label>
        <textarea
          id="token"
          name="token"
          className={styles.textArea}
          placeholder="Paste your token here"
          required
          rows={4}
        />
      </div>

      <div className={styles.checkboxRow}>
        <input
          id="custom-e2ee"
          type="checkbox"
          checked={e2ee}
          onChange={(ev) => setE2ee(ev.target.checked)}
        />
        <label htmlFor="custom-e2ee">Enable end-to-end encryption</label>
      </div>

      {e2ee && (
        <div className={styles.inputRow}>
          <label className={styles.inputLabel} htmlFor="custom-passphrase">Passphrase</label>
          <input
            id="custom-passphrase"
            className={styles.inputField}
            type="password"
            placeholder="Shared passphrase"
            value={sharedPassphrase}
            onChange={(ev) => setSharedPassphrase(ev.target.value)}
          />
        </div>
      )}

      <hr className={styles.separator} />

      <button id="connect-btn" className={styles.joinBtn} type="submit">
        Connect →
      </button>
    </form>
  );
}

/* ─────────────────────── Page (root) ─────────────────────── */
export default function Page() {
  // Shared state between VideoPreview and MediaControls
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);

  return (
    <>
      <main className={styles.main}>
        <div className={styles.card}>

          {/* ── LEFT COLUMN: brand + video preview + toggles ── */}
          <div className={styles.leftCol}>
            <div className={styles.brandHeader}>
              <Image src="/images/wpc-logo.svg" alt="WPC Video Conferencing" width={160} height={32} />
            </div>

            <VideoPreview camOn={camOn} />

            <MediaControls
              micOn={micOn}
              camOn={camOn}
              onToggleMic={() => setMicOn((v) => !v)}
              onToggleCam={() => setCamOn((v) => !v)}
            />

            <p className={styles.previewTip}>Your camera & mic preview</p>
          </div>

          {/* ── VERTICAL DIVIDER ── */}
          <div className={styles.colDivider} />

          {/* ── RIGHT COLUMN: title + form tabs ── */}
          <div className={styles.rightCol}>
            <div className={styles.rightHeader}>
              <h1>Join a Meeting</h1>
              <p>Professional video conferencing for teams. No account required for demo.</p>
            </div>

            <Suspense
              fallback={
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
                  Loading…
                </div>
              }
            >
              <Tabs>
                <DemoMeetingTab label="Demo" />
                <CustomConnectionTab label="Custom" />
              </Tabs>
            </Suspense>
          </div>

        </div>

        <footer className={styles.footer}>
          Powered by{' '}
          <a href="#" rel="noopener">WPC Infrastructure</a>
        </footer>
      </main>
    </>
  );
}
