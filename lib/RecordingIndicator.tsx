import { useIsRecording } from '@livekit/components-react';
import * as React from 'react';
import toast from 'react-hot-toast';

export function RecordingIndicator() {
  const isRecording = useIsRecording();
  const [wasRecording, setWasRecording] = React.useState(false);

  React.useEffect(() => {
    if (isRecording !== wasRecording) {
      setWasRecording(isRecording);
      if (isRecording) {
        toast('🔴  This meeting is being recorded', {
          duration: 4000,
          position: 'top-center',
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '12px',
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
            boxShadow: '0 4px 16px rgba(239,68,68,0.15)',
            padding: '0.75rem 1.25rem',
          },
        });
      }
    }
  }, [isRecording, wasRecording]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        boxShadow: isRecording ? 'var(--lk-danger3) 0px 0px 0px 3px inset' : 'none',
        pointerEvents: 'none',
      }}
    ></div>
  );
}
