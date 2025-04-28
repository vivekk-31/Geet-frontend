import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft } from 'lucide-react';
import PlayerBar from '../components/PlayerBar';
import PlaylistManager from '../components/PlaylistManager';

/**
 * HomeLayout Component
 * - Fetches playlists when user authenticates
 * - Manages audio playback (play, pause, next, previous, queue)
 * - Renders library sidebar, song grid, Now Playing / Queue panels
 * - Handles mobile-specific UI tweaks
 */
const API_URL = import.meta.env.VITE_API_URL;

const HomeLayout = ({ isAuthenticated, setIsAuthenticated }) => {
  
  // ─── LocalStorage-backed state ──────────────────────────────────────────────
  const [nowPlaying, setNowPlaying] = useState(() => {
    const stored = localStorage.getItem('nowPlaying');
    return stored ? JSON.parse(stored) : null;
  });
  const [isPlaying, setIsPlaying] = useState(() =>
    localStorage.getItem('isPlaying') === 'true'
  );
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('volume');
    return stored !== null ? parseFloat(stored) : 1;
  });

  // ─── UI / data state ─────────────────────────────────────────────────────────
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [playlistEditTarget, setPlaylistEditTarget] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileQueue, setShowMobileQueue] = useState(false);
  const [showMobileSeekbar, setShowMobileSeekbar] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const audioRef = useRef(new Audio());
  const lastLoadedId = useRef(null);

  // ─── Context from Router Outlet ──────────────────────────────────────────────
  const {
    filteredSongs,
    allSongs: songs,
    selectedPlaylist,
    onSelectPlaylist: setSelectedPlaylist,
    activeTab,
    setActiveTab,
    showMobileLibrary,
    setShowMobileLibrary
  } = useOutletContext();

  // ─── Fetch Playlists ─────────────────────────────────────────────────────────
  const fetchPlaylists = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingPlaylists(true);
    try {
      const res = await fetch(`${API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
        localStorage.setItem('playlists', JSON.stringify(data));
      } else {
        console.warn('Failed loading playlists', res.status);
      }
    } catch (err) {
      console.error('Error fetching playlists', err);
    } finally {
      setLoadingPlaylists(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated, fetchPlaylists]);

  // ─── Audio Initialization & Event Listeners ─────────────────────────────────
 // ─── 1) Load new track only when nowPlaying changes ──────────────────────────
useEffect(() => {
  const audio = audioRef.current;
  if (!nowPlaying) return;

  // guard so we don’t re-load on every play/pause
  if (lastLoadedId.current !== nowPlaying._id) {
    lastLoadedId.current = nowPlaying._id;
    audio.src = nowPlaying.audioUrl;
    audio.load();
  }
}, [nowPlaying]);

// ─── 2) Toggle play/pause without resetting the src ─────────────────────────
useEffect(() => {
  const audio = audioRef.current;
  if (isPlaying) {
    audio.play().catch(() => {});
    localStorage.setItem('isPlaying', 'true');
  } else {
    audio.pause();
    localStorage.setItem('isPlaying', 'false');
  }
}, [isPlaying, nowPlaying]);

// ─── Sync audio events to React state ───────────────────────────────────────
useEffect(() => {
  const audio = audioRef.current;

  const updateTime = () => {
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
  };
  const onPlay = () => {
    setIsPlaying(true);
    localStorage.setItem('isPlaying', 'true');
  };
  const onPause = () => {
    setIsPlaying(false);
    localStorage.setItem('isPlaying', 'false');
  };

  audio.addEventListener('timeupdate', updateTime);
  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);

  return () => {
    audio.removeEventListener('timeupdate', updateTime);
    audio.removeEventListener('play', onPlay);
    audio.removeEventListener('pause', onPause);
  };
}, []);  // run once on mount


  // ─── Restore Queue on Songs Load ──────────────────────────────────────────────
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('queue') || '[]');
    if (stored.length && songs.length) {
      const restored = stored
        .map(id => songs.find(s => s._id === id))
        .filter(Boolean);
      setQueue(restored);
    }
  }, [songs]);

  // ─── Persist Volume to localStorage ──────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ─── Window Event Listeners (resize + spacebar) ─────────────────────────────
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    const onKey = e => {
      if (e.code === 'Space' || e.key === ' ') {
        const el = document.activeElement;
        if (
          el &&
          (el.tagName === 'INPUT' ||
            el.tagName === 'TEXTAREA' ||
            el.isContentEditable)
        )
          return;
        if (nowPlaying && audioRef.current) {
          e.preventDefault();
          isPlaying
            ? audioRef.current.pause()
            : audioRef.current.play().catch(() => {});
        }
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [nowPlaying, isPlaying]);

  // ─── Derived / Memoized Lists ────────────────────────────────────────────────
  const playlistSongs = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.songs
      .map(s =>
        typeof s === 'string'
          ? songs.find(x => x._id === s)
          : songs.find(x => x._id === s._id)
      )
      .filter(Boolean);
  }, [selectedPlaylist, songs]);

  const songsToRender = useMemo(() => {
    if (filteredSongs.length) return filteredSongs;
    if (selectedPlaylist) return playlistSongs;
    return songs;
  }, [filteredSongs, selectedPlaylist, playlistSongs, songs]);

  const upNextSongs = useMemo(() => {
       if (!nowPlaying) return [];
       const idx = songsToRender.findIndex(s => s._id === nowPlaying._id);
       if (idx < 0) return songsToRender;
       // all songs after the current one
       const after = songsToRender.slice(idx + 1);
       // then all songs before it
       const before = songsToRender.slice(0, idx);
       // combine into a circular list, drop the current, and take up to 10
       return [...after, ...before];
     }, [nowPlaying, songsToRender]);

  // ─── Playback Handlers ───────────────────────────────────────────────────────
  const playSong = (song, nextQueue) => {
    setNowPlaying(song);
    setIsPlaying(true);
    localStorage.setItem('nowPlaying', JSON.stringify(song));
    localStorage.setItem('isPlaying', 'true');
    setQueue(nextQueue);
    localStorage.setItem(
      'queue',
      JSON.stringify(nextQueue.map(s => s._id))
    );
  };

  const handlePlay = useCallback(
    song => {
      const base = selectedPlaylist
        ? playlistSongs
        : filteredSongs.length
        ? filteredSongs
        : songs;
      const idx = base.findIndex(s => s._id === song._id);
      const upcoming = base.slice(idx + 1);
      playSong(song, upcoming);
    },
    [selectedPlaylist, playlistSongs, filteredSongs, songs]
  );

  const handleNext = useCallback(() => {
    // 1) if we still have a queued list, just shift it off
    if (queue.length) {
      const [next, ...rest] = queue;
      return playSong(next, rest);
    }
  
    // 2) else wrap within the current view’s list
    if (!songsToRender.length || !nowPlaying) return;
  
    const idx       = songsToRender.findIndex(s => s._id === nowPlaying._id);
    const nextIndex = (idx + 1) % songsToRender.length;   // wraps to 0
    // build the new queue after that track
    const upcoming  = songsToRender
      .slice(nextIndex + 1)
      .concat(songsToRender.slice(0, nextIndex + 1));
  
    playSong(songsToRender[nextIndex], upcoming);
  }, [queue, songsToRender, nowPlaying]);
  

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = handleNext;
    }
  }, [handleNext]);

  const handlePrev = useCallback(() => {
    if (!nowPlaying || !songsToRender.length) return;
    const idx = songsToRender.findIndex(
      s => s._id === nowPlaying._id
    );
    const prev =
      songsToRender[
        (idx - 1 + songsToRender.length) % songsToRender.length
      ];
    handlePlay(prev);
  }, [nowPlaying, songsToRender, handlePlay]);

  // ─── UI Handlers ─────────────────────────────────────────────────────────────
  const handleMobileSeekbar = () =>
    setShowMobileSeekbar(v => !v);
  const handleBackToSongs = () => {
    setSelectedPlaylist(null);
    setActiveTab('home');
  };

  return (
    <>
      <div className="flex flex-col h-screen pb-[90px]">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* My Library Sidebar */}
          <div
            className={`${
              isMobile
                ? showMobileLibrary
                  ? 'fixed top-0 left-0 h-full z-50 p-4 overflow-y-auto'
                  : 'hidden'
                : 'md:w-[25%] flex-shrink-0 p-4 overflow-y-auto md:border-2 md:border-gray-600 md:mx-1 rounded-xl'
            }`}
          >
            <h2 className="text-lg font-semibold mb-4 flex justify-between items-center">
              My Library
              {isMobile && (
                <button
                  onClick={() => setShowMobileLibrary(false)}
                  className="text-sm text-gray-400"
                >
                  Close
                </button>
              )}
            </h2>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setPlaylistEditTarget(null);
                    setShowPlaylistManager(true);
                  }}
                  className="dark:border dark:border-blue-600 dark:text-blue-600 border border-black text-base px-3 py-1 w-full h-10 rounded-3xl hover:bg-blue-600 hover:text-white transition cursor-pointer"
                >
                  Create New Playlist
                </button>
                <button
                  onClick={() => (window.location.href = '/songs')}
                  className="mt-2 dark:border dark:border-blue-600 dark:text-blue-600 border border-black text-base px-3 py-1 w-full h-10 rounded-3xl hover:bg-blue-600 hover:text-white transition cursor-pointer"
                >
                  Add More Songs
                </button>

                {playlists.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {playlists.map(pl => (
                      <li
                        key={pl._id}
                        className="bg-gray-800 flex justify-between items-center p-2 rounded-xl flex-wrap"
                      >
                        <div
                          onClick={() => {
                            setSelectedPlaylist(pl);
                            setActiveTab('playlist');
                          }}
                          className="flex-1 cursor-pointer"
                        >
                          <h3 className="text-white font-semibold">
                            {pl.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {pl.songs.length} song(s)
                          </p>
                        </div>

                        <button
                          disabled={loadingPlaylists}
                          onClick={() => {
                            setPlaylistEditTarget(pl);
                            setShowPlaylistManager(true);
                          }}
                          className="ml-2 text-blue-400 hover:text-blue-600"
                          title="Edit playlist"
                        >
                          ✎
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {showPlaylistManager && (
                  <div className="mt-4">
                    <PlaylistManager
                      songs={songs}
                      playlists={playlists}
                      setPlaylists={setPlaylists}
                      isAuthenticated={isAuthenticated}
                      initialPlaylist={playlistEditTarget}
                      onRefreshPlaylists={fetchPlaylists}
                      onPlaylistSelect={pl => {
                        setSelectedPlaylist(pl);
                        setShowPlaylistManager(false);
                        setPlaylistEditTarget(null);
                      }}
                      onClose={() => {
                        setShowPlaylistManager(false);
                        setPlaylistEditTarget(null);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => (window.location.href = '/login')}
                className="bg-green-600 w-full h-10 text-white text-base px-3 py-1 rounded-3xl hover:bg-green-700 transition cursor-pointer"
              >
                Login to create playlist
              </button>
            )}
          </div>

          {/* Song Grid */}
          {(activeTab === 'home' || activeTab === 'playlist') && (
            <div
              className={`relative transition-all duration-300 w-full p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto md:border-2 md:border-gray-600 md:mx-1 rounded-xl ${
                nowPlaying ? 'md:w-[50%]' : 'md:w-[75%]'
              } pt-16`}
            >
              {selectedPlaylist && (
                <button
                  onClick={handleBackToSongs}
                  className="absolute top-4 left-4 z-10 p-2 rounded-full hover:bg-gray-600 cursor-pointer"
                >
                  <ArrowLeft size={24} />
                </button>
              )}

              {songsToRender.length > 0 ? (
                songsToRender.map((song, idx) => (
                  <div
                    key={song._id + idx}
                    className="cursor-pointer rounded-xl flex flex-col"
                    onClick={() => handlePlay(song)}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-xl">
                      <img
                        src={song.coverImage}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col mt-2 px-1 w-full">
                      <h3 className="text-sm font-semibold truncate">
                        {song.title}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-col justify-center items-center text-2xl">
                  <p>No songs available</p>
                </div>
              )}
            </div>
          )}

          {/* Now Playing / Queue Panel */}
          <div
            className={`transition-all duration-300 overflow-y-auto md:mx-1 md:border-2 md:border-gray-600 rounded-xl p-4 ${
              isMobile
                ? nowPlaying && showMobileQueue
                  ? 'fixed top-0 left-0 w-full h-full z-50 bg-neutral-800'
                  : 'hidden'
                : nowPlaying
                ? 'md:w-[25%] block'
                : 'hidden'
            }`}
          >
            {nowPlaying && (!isMobile || showMobileQueue) && (
              <>
                {isMobile && (
                  <button
                    onClick={() => setShowMobileQueue(false)}
                    className="text-sm text-gray-400 mb-2"
                  >
                    Close
                  </button>
                )}
                <h2 className="text-lg font-semibold mb-4">
                  Now Playing
                </h2>
                <div className="flex flex-col items-center">
                  <img
                    src={nowPlaying.coverImage}
                    alt={nowPlaying.title}
                    className="w-48 h-48 object-cover mb-4 rounded-lg"
                  />
                  <h3 className="text-xl font-semibold">
                    {nowPlaying.title}
                  </h3>
                  <p className="text-sm">{nowPlaying.artist}</p>
                </div>
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">
                    Up Next
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {upNextSongs.map(s => (
                      <li
                        key={s._id}
                        onClick={() => handlePlay(s)}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded"
                      >
                        <img
                          src={s.coverImage}
                          alt={s.title}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div>
                          <p className="truncate">
                            {s.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {s.artist}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Seekbar Overlay */}
        {isMobile && showMobileSeekbar && nowPlaying && (
          <div className="fixed inset-x-0 bottom-[70px] bg-neutral-900 z-50 flex flex-col items-center justify-center px-4 py-8">
            <img
              src={nowPlaying.coverImage}
              alt={nowPlaying.title}
              className="w-48 h-48 object-cover mb-4 rounded-lg"
            />
            <h3 className="text-xl font-semibold text-white">
              {nowPlaying.title}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {nowPlaying.artist}
            </p>
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handlePrev}
                className="hover:scale-110 transition text-white"
              >
                <SkipBack size={24} />
              </button>
              <button
                onClick={() =>
                  isPlaying
                    ? audioRef.current.pause()
                    : audioRef.current.play().catch(() => {})
                }
                className="hover:scale-110 transition text-white"
              >
                {isPlaying ? (
                  <Pause size={28} />
                ) : (
                  <Play size={28} />
                )}
              </button>
              <button
                onClick={handleNext}
                className="hover:scale-110 transition text-white"
              >
                <SkipForward size={24} />
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={e => {
                const t = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = t;
                setCurrentTime(t);
              }}
              className="w-full"
            />
            <button
              onClick={handleMobileSeekbar}
              className="text-white mt-6"
            >
              Close
            </button>
          </div>
        )}

        {/* Player Bar */}
        {nowPlaying && (
          <PlayerBar
            nowPlaying={nowPlaying}
            audio={audioRef.current}
            isPlaying={isPlaying}
            volume={volume}
            currentTime={currentTime}
            duration={duration}
            onTogglePlayPause={() => {
              if (isPlaying) {
                audioRef.current.pause();
              } else {
                audioRef.current.play().catch(() => {});
              }
            }}
            onVolumeChange={e => setVolume(parseFloat(e.target.value))}
            onSeekChange={e => {
              const t = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            onPrev={handlePrev}
            onNext={handleNext}
            upNextSongs={upNextSongs}
            onSelectSong={handlePlay}
          />
        )}
      </div>
    </>
  );
};

export default HomeLayout;
