'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export interface TranscriptLine {
  id: string;
  speaker?: number;
  text: string;
  isFinal: boolean;
  timestamp: Date;
}

export function useDeepgramTranscription(enabled: boolean) {
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [interimText, setInterimText] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
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
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState('idle');
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

        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        micStreamRef.current = stream;

        // Build Deepgram streaming WebSocket URL
        const params = new URLSearchParams({
          encoding: 'linear16',
          sample_rate: '16000',
          channels: '1',
          model: 'nova-2',
          punctuate: 'true',
          interim_results: 'true',
          diarize: 'false',
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

          // Set up AudioContext to read raw PCM from the mic
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          audioCtxRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream);
          // Use ScriptProcessorNode (deprecated but widely supported)
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const input = e.inputBuffer.getChannelData(0);
            // Convert Float32 → Int16
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
              if (text) {
                setTranscriptLines((prev) => [
                  ...prev,
                  {
                    id: `${Date.now()}-${Math.random()}`,
                    text,
                    isFinal: true,
                    timestamp: new Date(),
                  },
                ]);
              }
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.onerror = () => {
          if (isMounted) setConnectionState('error');
        };

        ws.onclose = () => {
          if (isMounted) setConnectionState('idle');
        };
      } catch (err) {
        console.error('Deepgram transcription error:', err);
        if (isMounted) setConnectionState('error');
      }
    };

    start();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [enabled, cleanup]);

  const clearTranscript = useCallback(() => {
    setTranscriptLines([]);
    setInterimText('');
  }, []);

  return { transcriptLines, interimText, connectionState, clearTranscript };
}
