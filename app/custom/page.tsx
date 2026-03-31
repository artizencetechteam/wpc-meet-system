import { videoCodecs } from 'livekit-client';
import Link from 'next/link';
import { VideoConferenceClientImpl } from './VideoConferenceClientImpl';
import { isVideoCodec } from '@/lib/types';

function ErrorPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="wpc-error-page">
      <div className="wpc-error-card">
        <div className="wpc-error-icon">⚠️</div>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link href="/">← Back to Home</Link>
      </div>
    </div>
  );
}

export default async function CustomRoomConnection(props: {
  searchParams: Promise<{
    liveKitUrl?: string;
    token?: string;
    codec?: string;
    singlePC?: string;
  }>;
}) {
  const { liveKitUrl, token, codec, singlePC } = await props.searchParams;

  if (typeof liveKitUrl !== 'string') {
    return (
      <ErrorPage
        title="Missing Server URL"
        description="No LiveKit server URL was provided. Please go back and enter a valid server URL."
      />
    );
  }
  if (typeof token !== 'string') {
    return (
      <ErrorPage
        title="Missing Access Token"
        description="No access token was provided. Please go back and enter a valid token."
      />
    );
  }
  if (codec !== undefined && !isVideoCodec(codec)) {
    return (
      <ErrorPage
        title="Invalid Video Codec"
        description={`The codec "${codec}" is not supported. Valid options are: ${videoCodecs.join(', ')}.`}
      />
    );
  }

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      <VideoConferenceClientImpl
        liveKitUrl={liveKitUrl}
        token={token}
        codec={codec}
        singlePeerConnection={singlePC === 'true'}
      />
    </main>
  );
}
