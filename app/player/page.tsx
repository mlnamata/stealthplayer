'use client';

import Link from 'next/link';
import Player from '@/components/Player';

export default function PlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Stealth YouTube Player</h1>
              <p className="text-xs text-gray-400">Privacy Mode by default</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Player />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-16 bg-gray-900/30">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            Stealth YouTube Player © 2026 | Made with ❤️ for privacy
          </p>
        </div>
      </footer>
    </div>
  );
}
