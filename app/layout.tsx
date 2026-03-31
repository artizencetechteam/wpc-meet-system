import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'WPC Video Conferencing | Professional Virtual Meetings',
    template: '%s',
  },
  description:
    'WPC Video Conferencing provides seamless, high-quality, real-time audio and video experiences.',
  openGraph: {
    url: 'https://wpc-video.example.com',
    images: [
      {
        url: '',
        width: 2000,
        height: 1000,
        type: 'image/png',
      },
    ],
    siteName: 'WPC Video Conferencing',
  },
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.ico',
    },
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '',
        sizes: '180x180',
      },
      { rel: 'mask-icon', url: '', color: '#070707' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-lk-theme="default">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
