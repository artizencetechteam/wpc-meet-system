'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';

export function useDeepgramTranscription(enabled: boolean) {
  const [currentText, setCurrentText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  const { localParticipant } = useLocalParticipant();

  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    // We do NOT stop the media track here because it's managed by LiveKit
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState('idle');
    setCurrentText('');
    setInterimText('');
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error('Missing NEXT_PUBLIC_DEEPGRAM_API_KEY');
      setConnectionState('error');
      return;
    }

    let isMounted = true;

    const start = async () => {
      try {
        setConnectionState('connecting');

        // Look for the LiveKit local microphone track
        const pub = localParticipant.getTrackPublication(Track.Source.Microphone);
        if (!pub || !pub.track || !pub.track.mediaStreamTrack) {
           // Mic not published or not available yet
           if (isMounted) setConnectionState('error');
           return;
        }

        const mediaStreamTrack = pub.track.mediaStreamTrack;
        const stream = new MediaStream([mediaStreamTrack]);

        const params = new URLSearchParams({
          encoding: 'linear16',
          sample_rate: '16000',
          channels: '1',
          model: 'nova-2',
          punctuate: 'true',
          interim_results: 'true',
          language: 'en-US',
        });

        const ws = new WebSocket(
          `wss://api.deepgram.com/v1/listen?${params.toString()}`,
          ['token', apiKey],
        );
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setConnectionState('connected');

          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const input = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              const s = Math.max(-1, Math.min(1, input[i]));
              int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            ws.send(int16.buffer);
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data as string);
            if (data.type !== 'Results') return;
            const alt = data.channel?.alternatives?.[0];
            if (!alt || !alt.transcript) return;

            const text: string = alt.transcript.trim();
            const isFinal: boolean = data.is_final === true;

            if (!isFinal) {
              setInterimText(text);
            } else {
              setInterimText('');
              setCurrentText(text);
            }
          } catch { /* ignore */ }
        };

        ws.onerror = () => { if (isMounted) setConnectionState('error'); };
        ws.onclose = () => { if (isMounted) setConnectionState('idle'); };
      } catch (err) {
        console.error('Deepgram error:', err);
        if (isMounted) setConnectionState('error');
      }
    };

    // Give LiveKit a small moment to have the track ready if newly published
    const timeout = setTimeout(() => {
      if (isMounted) start();
    }, 500);

    return () => { 
      isMounted = false; 
      clearTimeout(timeout);
      cleanup(); 
    };
  }, [enabled, cleanup, localParticipant]);

  return { currentText, interimText, connectionState };
}
