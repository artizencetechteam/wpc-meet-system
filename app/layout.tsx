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
    siteName: 'WPC Video Conferencing',
  },
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.ico',
    },
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
