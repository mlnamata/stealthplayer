'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';

interface QueueItem {
  id: string;
  title: string;
}

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Player error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="text-center text-gray-400">
            <p className="mb-2">⚠️ Chyba při načítání videa</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Znovu načíst
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Player() {
  const searchParams = useSearchParams();
  const initialVideoId = searchParams?.get('v') || null;

  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(initialVideoId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);
  const [isRevealing, setIsRevealing] = useState(false);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [queueVideos, setQueueVideos] = useState<QueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [queueError, setQueueError] = useState('');
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved videos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedVideos');
    if (saved) {
      try {
        setSavedVideos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved videos', e);
      }
    }

    const queueStored = localStorage.getItem('queueVideos');
    if (queueStored) {
      try {
        setQueueVideos(JSON.parse(queueStored));
      } catch (e) {
        console.error('Failed to parse queue videos', e);
      }
    }
  }, []);

  // Update video ID from search params
  useEffect(() => {
    if (searchParams) {
      const v = searchParams.get('v');
      if (v) {
        setVideoId(v);
      }
    }
  }, [searchParams]);

  // Suppress cross-origin iframe errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore cross-origin errors from iframe
      if (event.message === 'Script error.' || !event.filename) {
        event.preventDefault();
        return true;
      }
      return false;
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Extrakce YouTube video ID z URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const id = match?.[match.length - 1];
    return id && id.length === 11 ? id : null;
  };

  const toggleSavedVideo = (id: string) => {
    const updated = savedVideos.includes(id)
      ? savedVideos.filter((vid) => vid !== id)
      : [...savedVideos, id];
    setSavedVideos(updated);
    localStorage.setItem('savedVideos', JSON.stringify(updated));
  };

  const isSaved = (id: string) => savedVideos.includes(id);

  const onError: YouTubeProps['onError'] = (error) => {
    // Log error but don't stop playback
    console.error('YouTube error:', error);
  };

  const handleLoadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      setIsPrivacyMode(true); // Vždy zahájit v privacy mode
    } else {
      alert('Neplatná YouTube URL');
    }
  };

  const updateQueue = (updated: QueueItem[]) => {
    setQueueVideos(updated);
    localStorage.setItem('queueVideos', JSON.stringify(updated));
  };

  const addUrlToQueue = () => {
    const id = extractVideoId(videoUrl);
    if (!id) {
      setQueueError('Neplatna YouTube URL');
      return;
    }

    if (queueVideos.some((video) => video.id === id)) {
      setQueueError('Video uz je ve fronte');
      return;
    }

    updateQueue([...queueVideos, { id, title: `Video ${id}` }]);
    setQueueError('');
  };

  const playQueueIndex = (index: number) => {
    const item = queueVideos[index];
    if (!item) {
      return;
    }
    setVideoId(item.id);
    setIsPrivacyMode(true);
    setCurrentQueueIndex(index);
  };

  const playNext = () => {
    if (currentQueueIndex >= 0 && currentQueueIndex < queueVideos.length - 1) {
      playQueueIndex(currentQueueIndex + 1);
    }
  };

  const playPrevious = () => {
    if (currentQueueIndex > 0) {
      playQueueIndex(currentQueueIndex - 1);
    }
  };

  const removeFromQueue = (id: string) => {
    const removeIndex = queueVideos.findIndex((item) => item.id === id);
    if (removeIndex === -1) {
      return;
    }

    const updated = queueVideos.filter((item) => item.id !== id);
    updateQueue(updated);

    if (id === videoId) {
      const nextItem = updated[removeIndex] || updated[removeIndex - 1];
      if (nextItem) {
        setVideoId(nextItem.id);
        setIsPrivacyMode(true);
        setCurrentQueueIndex(updated.findIndex((item) => item.id === nextItem.id));
      } else {
        setVideoId(null);
        setCurrentQueueIndex(-1);
      }
    } else if (currentQueueIndex > removeIndex) {
      setCurrentQueueIndex((index) => Math.max(index - 1, 0));
    }
  };

  const clearQueue = () => {
    updateQueue([]);
    setCurrentQueueIndex(-1);
  };

  useEffect(() => {
    if (!videoId) {
      setCurrentQueueIndex(-1);
      return;
    }

    if (queueVideos.length === 0) {
      updateQueue([{ id: videoId, title: `Video ${videoId}` }]);
      setCurrentQueueIndex(0);
      return;
    }

    const index = queueVideos.findIndex((item) => item.id === videoId);
    setCurrentQueueIndex(index);
  }, [videoId, queueVideos]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = playing, 2 = paused
    setIsPlaying(event.data === 1);

    if (event.data === 0 && currentQueueIndex >= 0) {
      const nextIndex = currentQueueIndex + 1;
      if (nextIndex < queueVideos.length) {
        const nextVideo = queueVideos[nextIndex];
        if (nextVideo) {
          setVideoId(nextVideo.id);
          setIsPrivacyMode(true);
          setCurrentQueueIndex(nextIndex);
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleProgressChange = (newTime: number) => {
    setCurrentTime(newTime);
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRevealPress = () => {
    setIsRevealing(true);
  };

  const handleRevealRelease = () => {
    setIsRevealing(false);
  };

  // Update current time každou sekundu
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      intervalRef.current = setInterval(async () => {
        if (playerRef.current) {
          const time = await playerRef.current.getCurrentTime();
          setCurrentTime(time);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zpět
        </Link>
      </div>

      {/* Player Container */}
      <div className="max-w-4xl mx-auto w-full">
        {/* URL Input */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Nebo načíst jiné video</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Vlož YouTube URL zde..."
              className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleLoadVideo()}
            />
            <button
              onClick={handleLoadVideo}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Načíst
            </button>
            <button
              onClick={addUrlToQueue}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Pridat do fronty
            </button>
          </div>
          {queueError && <p className="text-yellow-400 text-sm mt-2">{queueError}</p>}
        </div>

      {/* Player */}
      {videoId && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {/* YouTube Player - vždy rendován */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${isPrivacyMode && !isRevealing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <YouTube
                videoId={videoId}
                opts={opts}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onReady}
                onStateChange={onStateChange}
                onError={onError}
              />
            </div>

            {/* Privacy Overlay */}
            {isPrivacyMode && (
              <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${isRevealing ? 'opacity-0' : 'opacity-100'}`}>
                <div className="h-full flex flex-col items-center justify-center p-8">
                  {/* Název videa/info */}
                  <div className="text-center mb-8">
                    <div className="text-gray-500 text-sm mb-2">🔒 Privacy Mode Aktivní</div>
                    <div className="text-gray-400 text-xs">Video běží na pozadí</div>
                  </div>

                  {/* Custom Controls */}
                  <div className="w-full max-w-md space-y-6">
                    {/* Play/Pause Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={togglePlayPause}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          // Pause icon
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          // Play icon
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => handleProgressChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        aria-label="Časová osa videa"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => handleVolumeChange(Number(e.target.value))}
                          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          aria-label="Hlasitost"
                        />
                        <span className="text-sm text-gray-400 w-12 text-right">{volume}%</span>
                      </div>
                    </div>

                    {/* Reveal Button */}
                    <div className="pt-4 border-t border-gray-700/50">
                      <button
                        onMouseDown={handleRevealPress}
                        onMouseUp={handleRevealRelease}
                        onMouseLeave={handleRevealRelease}
                        onTouchStart={handleRevealPress}
                        onTouchEnd={handleRevealRelease}
                        className="w-full py-2 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 rounded-lg text-sm transition-colors"
                      >
                        {isRevealing ? '👁️ Viditelné' : '🔒 Podrž pro odkrytí'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Mode Toggle */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-400">
              {isPrivacyMode ? '🔒 Privacy Mode: Zapnuto' : '👁️ Privacy Mode: Vypnuto'}
            </div>
            <div className="flex gap-3">
              {videoId && (
                <button
                  onClick={() => toggleSavedVideo(videoId)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isSaved(videoId)
                      ? 'bg-red-600/30 hover:bg-red-600/40 text-red-400 border border-red-600/50'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                  }`}
                  title={isSaved(videoId) ? 'Odebrat z uložených' : 'Přidat do uložených'}
                >
                  <span className="text-lg">❤️</span>
                  {isSaved(videoId) ? 'Uloženo' : 'Uložit'}
                </button>
              )}
              <button
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPrivacyMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {isPrivacyMode ? 'Trvale vypnout' : 'Zapnout Privacy Mode'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Fronta</h3>
            <span className="text-gray-400 text-sm">({queueVideos.length})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={playPrevious}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Predchozi
            </button>
            <button
              onClick={playNext}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Dalsi
            </button>
            <button
              onClick={clearQueue}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Vymazat
            </button>
          </div>
        </div>

        {queueVideos.length === 0 ? (
          <div className="text-gray-400 text-sm">Fronta je prazdna.</div>
        ) : (
          <div className="space-y-3">
            {queueVideos.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 rounded-lg border p-3 ${
                  index === currentQueueIndex
                    ? 'border-blue-500/70 bg-blue-600/10'
                    : 'border-gray-700/50 bg-gray-900/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-gray-500 text-xs w-6 text-right">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-gray-500 text-xs truncate">{item.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playQueueIndex(index)}
                    className="px-3 py-1.5 bg-blue-600/70 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Prehrat
                  </button>
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    Odebrat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      {!videoId && (
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/30 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Žádné video není načteno</h3>
          <p className="text-gray-400 text-sm">
            Vlož YouTube URL výše pro začátek přehrávání ve stealth módu
          </p>
        </div>
      )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-webkit-slider-thumb:hover {
          background: #f0f0f0;
        }

        .slider::-moz-range-thumb:hover {
          background: #f0f0f0;
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
}
