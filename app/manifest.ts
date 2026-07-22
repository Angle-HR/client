import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OpenHR',
    short_name: 'OpenHR',
    description:
      'Open HR lets you create jobs, track applications, and manage your team. Built so any founder or small team can start hiring in minutes, with zero delay.',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
