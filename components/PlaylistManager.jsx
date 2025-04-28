// src/components/PlaylistManager.jsx

import React, { useState, useEffect } from "react"; // React and hooks
import toast, { Toaster } from "react-hot-toast"; // Toast notifications

const API_URL = import.meta.env.VITE_API_URL;  

// PlaylistManager component with props
const PlaylistManager = ({
  songs = [],
  playlists = [],
  setPlaylists = () => {},
  selectedPlaylist,
  isAuthenticated = false,
  onPlaylistSelect = () => {},
  onClose = () => {},
  initialPlaylist = null,
  onRefreshPlaylists = async () => {},
}) => {
  // Local states
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

  // Effect to pre-fill form if editing a playlist
  useEffect(() => {
    if (initialPlaylist) {
      setEditingPlaylistId(initialPlaylist._id);
      setNewPlaylistName(initialPlaylist.name);
      setSelectedSongs(
        initialPlaylist.songs.map((s) => (typeof s === "string" ? s : s._id))
      );
    } else {
      setEditingPlaylistId(null);
      setNewPlaylistName("");
      setSelectedSongs([]);
    }
  }, [initialPlaylist]);

  // Toggle song selection
  const handleSongSelect = (songId) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // Reset form fields
  const resetForm = () => {
    setNewPlaylistName("");
    setSelectedSongs([]);
    setEditingPlaylistId(null);
    onClose();
  };

  // Create new playlist
  const createPlaylist = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newPlaylistName, songs: selectedSongs }),
      });

      if (res.ok) {
        const data = await res.json();
        await onRefreshPlaylists();
        toast.success(`Playlist "${newPlaylistName}" created!`, {
          position: "bottom-center",
        });
        onPlaylistSelect(data);
        resetForm();
      } else {
        toast.error("Failed to create playlist. Try again.", {
          position: "bottom-center",
        });
      }
    } catch (err) {
      console.error("Error creating playlist", err);
      toast.error("An error occurred. Try again.", {
        position: "bottom-center",
      });
    }
  };

  // Update an existing playlist
  const updatePlaylist = async () => {
    if (!editingPlaylistId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/playlists/${editingPlaylistId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ songs: selectedSongs }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        await onRefreshPlaylists();
        toast.success("Playlist updated.", { position: "bottom-center" });
        resetForm();
      } else {
        toast.error("Failed to update playlist.", {
          position: "bottom-center",
        });
      }
    } catch (err) {
      console.error("Error updating playlist", err);
      toast.error("An error occurred.", { position: "bottom-center" });
    }
  };

  // Preload playlist details when clicked
  const handlePlaylistClick = (playlist) => {
    onPlaylistSelect(playlist);
    setEditingPlaylistId(playlist._id);
    setNewPlaylistName(playlist.name);
    setSelectedSongs(
      playlist.songs.map((s) => (typeof s === "string" ? s : s._id))
    );
  };

  return (
    <>
      {/* Toast Notifications */}
      <Toaster position="bottom-center" containerStyle={{ bottom: "64px" }} />

      {/* Modal Background */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white dark:bg-black w-full max-w-2xl md:max-h-[82vh] max-h-[90vh] rounded-lg border flex flex-col overflow-hidden relative bottom-0 md:bottom-[5%]">

          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {editingPlaylistId ? "Edit Playlist" : "Create Playlist"}
            </h3>
            <button onClick={resetForm} className="text-sm underline">
              Close
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">

            {/* Playlist List (only when creating, not editing) */}
            {playlists.length > 0 && !editingPlaylistId && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Your Playlists</h4>
                <ul className="space-y-2">
                  {playlists.map((pl) => (
                    <li
                      key={pl._id}
                      onClick={() => handlePlaylistClick(pl)}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
                    >
                      {pl.name} ({pl.songs.length} songs)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Playlist Name Input */}
            <input
              type="text"
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              disabled={!!editingPlaylistId}
              className="w-full px-3 py-2 rounded border mb-4 focus:outline-none focus:ring"
            />

            {/* Selected Songs Count */}
            {selectedSongs.length > 0 && (
              <div className="mb-3 text-sm font-medium">
                {selectedSongs.length} song{selectedSongs.length > 1 ? "s" : ""} selected
              </div>
            )}

            {/* Songs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {songs.map((song) => {
                const isSelected = selectedSongs.includes(song._id);
                return (
                  <div
                    key={song._id}
                    onClick={() => handleSongSelect(song._id)}
                    className={`relative group border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-105 shadow-lg z-10"
                        : "hover:scale-105 hover:shadow-lg"
                    }`}
                    style={{ transformOrigin: "center" }}
                  >
                    <div className="font-semibold">{song.title}</div>
                    <div className="text-sm opacity-80">{song.artist}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1 rounded-full shadow text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Footer - Buttons */}
          <div className="p-4 border-t flex flex-wrap justify-between gap-3">

            {editingPlaylistId ? (
              <>
                {/* Update Button */}
                <button
                  onClick={updatePlaylist}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Update Playlist
                </button>

                {/* Delete Button */}
                <button
                  onClick={async () => {
                    if (!editingPlaylistId) {
                      toast.error("No playlist selected to delete.");
                      return;
                    }
                    if (!window.confirm("Are you sure you want to delete this playlist?")) return;

                    const token = localStorage.getItem("token");
                    try {
                      const res = await fetch(
                        `${API_URL}/playlists/${editingPlaylistId}`,
                        {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      const result = await res.json();

                      if (res.status === 401) {
                        toast.error("Session expired. Please log in again.");
                        return;
                      }

                      if (res.ok) {
                        await onRefreshPlaylists();
                        toast.success("Playlist deleted.");
                        resetForm();
                      } else {
                        toast.error("Failed to delete playlist.");
                        console.log("DELETE response:", res.status, result);
                      }
                    } catch (err) {
                      console.error("Error deleting playlist", err);
                      toast.error("An error occurred while deleting.");
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Delete Playlist
                </button>
              </>
            ) : (
              /* Validate before creating playlist */
              <button
                onClick={() => {
                  if (!newPlaylistName.trim()) {
                    toast.error("Playlist name is required!", { position: "bottom-center" });
                    return;
                  }
                  if (selectedSongs.length === 0) {
                    toast.error("Select at least one song!", { position: "bottom-center" });
                    return;
                  }
                  createPlaylist();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Create Playlist
              </button>
            )}

          </div>

        </div>
      </div>
    </>
  );
};

export default PlaylistManager; // Exporting PlaylistManager component
