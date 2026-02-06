'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
}

interface RecentVideo extends Video {
  timestamp: number;
}

const ASMR_VIDEOS = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Chill Version',
    category: 'Chill',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo - First YouTube Video',
    category: 'Classic',
    thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE - Music Video',
    category: 'Music',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  },
  {
    id: 'kJQP7kiw9Fk',
    title: 'Luis Fonsi - Despacito Official Video',
    category: 'Music',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw9Fk/maxresdefault.jpg',
  },
  {
    id: 'owJRjWcJlSY',
    title: 'Cardi B - I Like It Official Video',
    category: 'Music',
    thumbnail: 'https://i.ytimg.com/vi/owJRjWcJlSY/maxresdefault.jpg',
  },
];

export default function Home() {
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);

  useEffect(() => {
    // Load recent videos from localStorage
    const stored = localStorage.getItem('recentVideos');
    if (stored) {
      try {
        setRecentVideos(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent videos', e);
      }
    }

    // Load saved videos from localStorage
    const savedStored = localStorage.getItem('savedVideos');
    if (savedStored) {
      try {
        setSavedVideos(JSON.parse(savedStored));
      } catch (e) {
        console.error('Failed to parse saved videos', e);
      }
    }
  }, []);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match?.[match.length - 1];
    return videoId && videoId.length === 11 ? videoId : null;
  };

  const addRecentVideo = (video: Video) => {
    const recent: RecentVideo = { ...video, timestamp: Date.now() };
    const updated = [recent, ...recentVideos.filter((v) => v.id !== video.id)].slice(0, 10);
    setRecentVideos(updated);
    localStorage.setItem('recentVideos', JSON.stringify(updated));
  };

  const toggleSavedVideo = (videoId: string) => {
    const updated = savedVideos.includes(videoId)
      ? savedVideos.filter((id) => id !== videoId)
      : [...savedVideos, videoId];
    setSavedVideos(updated);
    localStorage.setItem('savedVideos', JSON.stringify(updated));
  };

  const isSaved = (videoId: string) => savedVideos.includes(videoId);

  const handleCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(customUrl);
    if (videoId) {
      window.location.href = `/player?v=${videoId}`;
    } else {
      setUrlError('Neplatná YouTube URL');
    }
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <div className="group relative overflow-hidden rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 transition-all hover:scale-105">
      <Link href={`/player?v=${video.id}`} onClick={() => addRecentVideo(video)} className="block relative aspect-video bg-gray-900 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EVideo%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
          <svg className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-blue-600/80 text-white text-xs rounded font-medium">
            {video.category}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <h4 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors text-sm">
          {video.title}
        </h4>
      </div>
    </div>
  );

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
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">🎵 Diskrétní Přehrávání</h2>
          <p className="text-xl text-gray-400 mb-8">
            Přehrávej YouTube videa s výchozím privacy módem. Video je vždy skryté - nikdo nevidí, co sleduješ.
          </p>

          {/* Custom URL Input */}
          <form onSubmit={handleCustomUrl} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3 text-left">
              📌 Vlož vlastní YouTube URL
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Přehrát
              </button>
            </div>
            {urlError && <p className="text-red-400 text-sm mt-2">{urlError}</p>}
          </form>
        </section>

        {/* ASMR Videos Section */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <h3 className="text-2xl font-bold text-white">🎵 Populární Videa</h3>
            <span className="text-gray-400 text-sm">(Příklady - klikni a přehrávej)</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {ASMR_VIDEOS.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Recent Videos Section */}
        {recentVideos.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <h3 className="text-2xl font-bold text-white">⏱️ Nedávno Přehrána</h3>
              <span className="text-gray-400 text-sm">({recentVideos.length})</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* Saved Videos Section */}
        {savedVideos.length > 0 && (
          <section className="mb-16 border-t-2 border-red-700/50 pt-8">
            <div className="flex items-center gap-2 mb-8">
              <h3 className="text-2xl font-bold text-white">❤️ Uložená Videa</h3>
              <span className="text-gray-400 text-sm">({savedVideos.length})</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...ASMR_VIDEOS, ...recentVideos]
                .filter((video, idx, arr) => arr.findIndex((v) => v.id === video.id) === idx)
                .filter((video) => savedVideos.includes(video.id))
                .map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
            </div>
          </section>
        )}
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
