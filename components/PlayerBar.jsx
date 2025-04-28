import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import MobilePlayerBar from './MobilePlayerBar';

const formatTime = (time) => {
  const minutes = Math.floor(time / 60) || 0;
  const seconds = Math.floor(time % 60) || 0;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PlayerBar = ({
  nowPlaying,
  audio,
  isPlaying,
  onTogglePlayPause,
  onVolumeChange,
  currentTime,
  duration,
  onPrev,
  onNext, 
  upNextSongs = [],
  onSelectSong = () => {},
}) => {

  // NOW it's in scope, genius.
  const handleSeekChange = (value) => {
    if (audio) {
      audio.currentTime = value;
    }
  };

  return (
    <>
      {/* Desktop Player Bar */}
      <div className="hidden md:flex fixed bottom-0 left-0 z-50 w-full h-[90px] px-4 py-3 items-center justify-between bg-[#f5f5f5] text-black dark:bg-gray-950 dark:text-white">
        {/* Left - Song info */}
        <div className="flex items-center  w-1/3 space-x-4">
          <img
            src={nowPlaying.coverImage}
            alt={nowPlaying.title}
            className="w-14 h-14 object-cover rounded-md"
          />
          <div>
            <h3 className="text-sm font-semibold truncate">{nowPlaying.title}</h3>
            <p className="text-xs text-gray-400 truncate">{nowPlaying.artist}</p>
          </div>
        </div>

        {/* Center - Controls */}
        <div className="flex flex-col items-center w-1/3">
          {/* Controls (above seekbar) */}
          <div className="flex items-center justify-center space-x-6 mb-2">
            <button onClick={onPrev} className="hover:scale-110 transition">
              <SkipBack size={24} />
            </button>
            <button onClick={onTogglePlayPause} className="hover:scale-110 transition">
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button onClick={onNext} className="hover:scale-110 transition">
              <SkipForward size={24} />
            </button>
          </div>

          {/* Seekbar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-1 rounded-md"
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right - Volume */}
        <div className="w-1/3 flex justify-end items-center space-x-2">
          {audio?.volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            onChange={onVolumeChange}
            className="w-24 accent-blue-500 h-1 rounded-md"
          />
        </div>
      </div>

      {/* Mobile Player Bar */}
      <MobilePlayerBar
        nowPlaying={nowPlaying}
        isPlaying={isPlaying}
        onTogglePlayPause={onTogglePlayPause}
        onPrev={onPrev}
        onNext={onNext}
        currentTime={currentTime}
        duration={duration}
        onSeekChange={handleSeekChange}
        upNextSongs={upNextSongs}
        onSelectSong={onSelectSong}
      />
    </>
  );
};

export default PlayerBar;
