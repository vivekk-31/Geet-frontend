import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const UploadSong = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !title || !artist) {
      alert("Please fill in all fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("isPublic", isPublic);
    if (coverImage) formData.append("coverImage", coverImage);
    formData.append("audio", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/songs/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Upload failed");

      alert("Song uploaded successfully!");
      setTitle("");
      setArtist("");
      setFile(null);
      setCoverImage(null);
    } catch (error) {
      console.error("Upload error:", error.message);
      alert("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-5">
      <form
        onSubmit={handleUpload}
        className="w-full max-w-sm md:max-w-md space-y-5 border rounded-xl p-6 shadow-sm"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-center">
          Upload a New Song
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">Song Title</label>
          <input
            type="text"
            placeholder="e.g. Blinding Lights"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Artist</label>
          <input
            type="text"
            placeholder="e.g. The Weeknd"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 ">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Audio File</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            id="publicToggle"
            className="accent-blue-500"
          />
          <label htmlFor="publicToggle" className="text-sm font-medium">
            Make Public
          </label>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-2 rounded font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 text-sm"
        >
          {uploading ? "Uploading..." : "Upload Song"}
        </button>
      </form>
    </div>
  );
};

export default UploadSong;
