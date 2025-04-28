import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const MobilePlayerBarFull = ({
  nowPlaying,
  isPlaying,
  onTogglePlayPause,
  onPrev,
  onNext,
  onClose
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const audio = new Audio(nowPlaying.audioUrl);
    audio.addEventListener('timeupdate', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
    };
  }, [nowPlaying]);

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    const audio = new Audio(nowPlaying.audioUrl);
    audio.currentTime = time;
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-full bg-neutral-900 text-white flex flex-col items-center justify-between p-4">
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
        Close
      </button>

      {/* Song Info */}
      <div className="flex flex-col items-center space-y-4">
        <img
          src={nowPlaying.coverImage}
          alt={nowPlaying.title}
          className="w-48 h-48 object-cover rounded-md"
        />
        <h3 className="text-2xl font-semibold">{nowPlaying.title}</h3>
        <p className="text-sm text-gray-400">{nowPlaying.artist}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6 my-6">
        <button onClick={onPrev} className="hover:scale-110 transition">
          <SkipBack size={28} />
        </button>
        <button onClick={onTogglePlayPause} className="hover:scale-110 transition">
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button onClick={onNext} className="hover:scale-110 transition">
          <SkipForward size={28} />
        </button>
      </div>

      {/* Seekbar */}
      <div className="w-full">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default MobilePlayerBarFull;
