'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

export function LocalRecorder() {
  const [recording, setRecording] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const room = useRoomContext();

  useEffect(() => {
    let wrapper: HTMLDivElement | null = null;

    const findContainer = () => {
      // Find the LiveKit control bar button group
      const btnGroup = document.querySelector('.lk-control-bar .lk-button-group');
      if (btnGroup) {
        wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        
        // Insert right at the beginning (left of microphone button)
        btnGroup.insertBefore(wrapper, btnGroup.firstChild);
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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        chunksRef.current = [];
        const filename = `meeting-recording-${Date.now()}.webm`;
        
        // 1. Download locally
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Recording saved locally!');
        
        setRecording(false);

        // 2. Upload to Cloudflare R2
        const toastId = toast.loading('Uploading to cloud...');
        try {
          const res = await fetch('/api/recordings/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, contentType: 'video/webm' }),
          });
          
          if (!res.ok) throw new Error('Failed to get upload URL');
          
          const { uploadUrl } = await res.json();
          
          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'video/webm' },
            body: blob,
          });
          
          if (!uploadRes.ok) throw new Error('Failed to upload to R2');
          
          toast.success('Successfully saved to cloud!', { id: toastId });
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to save to cloud', { id: toastId });
        }
      };

      recorder.start();
      setRecording(true);
      toast.success('Local recording started');

      // Handle user stopping stream from browser default UI
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      };
    } catch (err) {
      console.error('Error starting screen recording:', err);
      toast.error('Could not start screen recording');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  useEffect(() => {
    if (room) {
      room.on(RoomEvent.Disconnected, stopRecording);
      return () => {
        room.off(RoomEvent.Disconnected, stopRecording);
      };
    }
  }, [room, stopRecording]);

  const autoStartRef = useRef(false);
  useEffect(() => {
    if (!autoStartRef.current) {
      autoStartRef.current = true;
      // Slight delay to allow user interaction flow to finish and possibly grant screen-sharing permission
      const timer = setTimeout(() => {
        startRecording();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startRecording]);

  const buttonContent = (
    <button
      className="lk-button"
      onClick={recording ? stopRecording : startRecording}
      aria-pressed={recording}
      style={{
        marginRight:'8px'
      }}
    >
      {recording ? (
        <>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '2px',
              backgroundColor: 'currentColor',
              marginRight: '6px',
            }}
          />
          Stop Record
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: '6px' }}
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          Record
        </>
      )}
    </button>
  );

  if (container) {
    return createPortal(buttonContent, container);
  }

  // Fallback if control bar is not found yet
  return (
    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 9999 }}>
      {buttonContent}
    </div>
  );
}
