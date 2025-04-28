import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import PlaylistManager from './PlaylistManager';
import { ListMusic } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL; 

const MainLayout = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

  // State definitions
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'home'; // Restore active tab from localStorage
  });
  const [selectedPlaylist, setSelectedPlaylist] = useState(() => {
    const stored = localStorage.getItem('selectedPlaylist');
    return stored ? JSON.parse(stored) : null; // Restore selected playlist from localStorage
  });
  const [showMobileLibrary, setShowMobileLibrary] = useState(false);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false); // Used to re-fetch data
  const [playlistEditTarget, setPlaylistEditTarget] = useState(null); // Playlist being edited

  // 👉 Memoized list of songs inside the currently selected playlist
  const playlistSongsInLayout = React.useMemo(() => {
    if (!selectedPlaylist) return [];
    const pl = playlists.find(p => p._id === selectedPlaylist._id);
    return pl
      ? pl.songs
        .map(s => typeof s === 'string'
          ? songs.find(x => x._id === s)
          : songs.find(x => x._id === s._id))
        .filter(Boolean)
      : [];
  }, [selectedPlaylist, playlists, songs]);

  // Reset filters and active tab
  const resetToDefaultSongs = () => {
    setActiveTab('home');
    setFilteredSongs([]);
  };

  // Handle navigation and library toggle
  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab === 'library') {
      setShowMobileLibrary(true);
    }
  };

  // Search through songs
  const handleSearch = (query) => {
    const q = query.trim().toLowerCase();

    // Empty search query: reset filter
    if (!q) {
      setFilteredSongs([]);
      setActiveTab(selectedPlaylist ? 'playlist' : 'home');
      return;
    }

    // Choose the source songs list
    const baseList = selectedPlaylist ? playlistSongsInLayout : songs;

    // Filter songs by title or artist
    const matched = baseList.filter(song =>
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q)
    );

    setFilteredSongs(matched);
    setActiveTab('home');
  };

  // Fetch user's playlists
  const fetchUserPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/playlists`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      } else {
        console.warn('playlist fetch failed:', res.status);
      }
    } catch (err) {
      console.error('error fetching playlists:', err);
    }
  };

  // Fetch songs and playlists on load and refresh
  useEffect(() => {
    const fetchSongsAndPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
        const publicRes = await fetch(`${API_URL}/songs/public`);
        const publicSongs = publicRes.ok ? await publicRes.json() : [];
        let userSongs = [];
        let userPlaylists = [];

        if (token) {
          const userRes = await fetch(`${API_URL}/songs/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userSongs = userRes.ok ? await userRes.json() : [];

          const playlistsRes = await fetch(`${API_URL}/playlists`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userPlaylists = playlistsRes.ok ? await playlistsRes.json() : [];
        }

        // Combine public and user songs without duplicates
        const allSongs = [...userSongs, ...publicSongs];
        const uniqueSongs = Array.from(new Map(allSongs.map(s => [s._id, s])).values());

        setSongs(uniqueSongs);
        setPlaylists(userPlaylists);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSongsAndPlaylists();
  }, [refreshFlag]);

  // Fetch playlists when opening library (if authenticated)
  useEffect(() => {
    if (!showMobileLibrary || !isAuthenticated) return;
    fetchUserPlaylists();
  }, [showMobileLibrary, isAuthenticated]);

  // Lock background scroll when mobile library is open
  useEffect(() => {
    document.body.style.overflow = showMobileLibrary ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showMobileLibrary]);

  // Handle responsive layout (close modals on resize)
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileLibrary(false);
        setShowPlaylistManager(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Persist active tab between sessions
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Persist or clear selected playlist in localStorage
  useEffect(() => {
    if (selectedPlaylist) {
      localStorage.setItem('selectedPlaylist', JSON.stringify(selectedPlaylist));
    } else {
      localStorage.removeItem('selectedPlaylist');
    }
  }, [selectedPlaylist]);

  return (
    <>
      <div className="min-h-screen">
        {/* Navbar */}
        <Navbar
          onNavigate={handleNavigate}
          onSearch={handleSearch}
          resetToDefaultSongs={resetToDefaultSongs}
        />
        
        {/* Outlet to render nested routes */}
        <Outlet
          context={{
            filteredSongs,
            allSongs: songs,
            selectedPlaylist,
            onSelectPlaylist: setSelectedPlaylist,
            activeTab,
            setActiveTab,
            showMobileLibrary,
            setShowMobileLibrary
          }}
        />
      </div>

      {/* Mobile Library Overlay */}
      {showMobileLibrary && (
        <div className="fixed inset-0 bg-white dark:bg-gray-950 bg-opacity-90 dark:text-white p-4 z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Library</h2>
            <button
              onClick={() => {
                setShowMobileLibrary(false);
                setShowPlaylistManager(false);
                setActiveTab('home');
              }}
              className="text-gray-300 hover:text-white text-2xl"
            >
              &times;
            </button>
          </div>

          {/* If authenticated */}
          {isAuthenticated ? (
            <>
              {/* Playlist Manager Toggle */}
              {!showPlaylistManager && (
                <>
                  <div className="flex flex-col space-y-4 mb-4">
                    <button
                      onClick={() => { setPlaylistEditTarget(null); setShowPlaylistManager(true); }}
                      className="border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 px-4 py-2 rounded-full w-full hover:bg-blue-600 hover:text-white transition"
                    >
                      + Create New Playlist
                    </button>
                    <button
                      onClick={() => {
                        setShowMobileLibrary(false);
                        navigate('/songs');
                      }}
                      className="border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 px-4 py-2 rounded-full w-full hover:bg-green-600 hover:text-white transition"
                    >
                      + Add More Songs
                    </button>
                  </div>

                  {/* List of Playlists */}
                  {playlists.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {playlists.map((playlist) => (
                        <li
                          key={playlist._id}
                          onClick={() => {
                            setSelectedPlaylist(playlist);
                            setActiveTab('playlist');
                            setShowMobileLibrary(false);
                          }}
                          className="bg-gray-800 hover:bg-blue-700 transition-colors duration-200 p-2 rounded-xl cursor-pointer shadow-md flex items-center gap-4"
                        >
                          <ListMusic className="text-blue-400" />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{playlist.name}</h3>
                            <p className="text-sm text-gray-400">{playlist.songs.length} song(s)</p>
                          </div>

                          {/* Edit Playlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent onClick
                              setPlaylistEditTarget(playlist);
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
                  ) : (
                    <p className="text-gray-400 text-center">No playlists yet</p>
                  )}
                </>
              )}

              {/* Playlist Manager Panel */}
              {showPlaylistManager && (
                <div className="mt-4">
                  <PlaylistManager
                    songs={songs}
                    playlists={playlists}
                    setPlaylists={setPlaylists}
                    isAuthenticated={isAuthenticated}
                    initialPlaylist={playlistEditTarget}
                    onRefreshPlaylists={fetchUserPlaylists}
                    onPlaylistSelect={async () => {
                      await fetchUserPlaylists();
                      setRefreshFlag(prev => !prev);
                      setShowPlaylistManager(false);
                      setShowMobileLibrary(false);
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
            // If not authenticated
            <div className="text-center mt-10">
              <p className="text-gray-400 mb-4">Login to create a new playlist</p>
              <button
                onClick={() => {
                  setShowMobileLibrary(false);
                  navigate('/login');
                }}
                className="px-4 py-2 w-full border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-2xl hover:bg-blue-700 transition"
              >
                Login
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MainLayout;
