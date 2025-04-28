import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, ChevronDown } from 'lucide-react';

const MobilePlayerBar = ({
  nowPlaying,
  isPlaying,
  onTogglePlayPause,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeekChange,
  upNextSongs = [],
  onSelectSong = () => { },
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format time for the seekbar
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {/* Mini Bar (bottom fixed, stays at the bottom 45px) */}
      <div className="fixed bottom-[34px] left-0 z-50 w-full h-[70px] px-4 flex items-center justify-between bg-[#f5f5f5] text-black dark:bg-gray-900 dark:text-white md:hidden">
        {/* Left - Song Info */}
        <div
          className="flex items-center space-x-4 overflow-hidden"
          onClick={() => setIsExpanded(true)}
        >
          <img
            src={nowPlaying.coverImage}
            alt={nowPlaying.title}
            className="w-12 h-12 object-cover rounded-md"
          />
          <div className="text-sm font-semibold">
            {/* Scrollable Text */}
            <h3 className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-[180px]">
              {nowPlaying.title}
            </h3>
            <p className="text-xs text-gray-400">
              {nowPlaying.artist}
            </p>
          </div>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3 pr-1">
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
      </div>

      {/* Expanded Modal (Fullscreen) */}
      {isExpanded && (
        <div className="fixed inset-0 dark:bg-gray-950 dark:text-white bg-white text-black bg-opacity-70 z-50 flex flex-col items-center justify-between p-6">
          {/* Close Button */}
          <div className="w-full flex justify-end">
            <button
              onClick={() => setIsExpanded(false)}
              className="dark:text-white text-black text-lg"
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Expanded Player Content */}
          <div className="flex flex-col items-center space-y-6 w-full overflow-auto">
            <img
              src={nowPlaying.coverImage}
              alt={nowPlaying.title}
              className="w-60 h-60 rounded-xl"
            />
            <div className="text-center">
              <h2 className="text-lg font-semibold">{nowPlaying.title}</h2>
              <p className="text-sm text-gray-400">{nowPlaying.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-8">
              <button onClick={onPrev} className="dark:text-white text-black text-3xl">
                <SkipBack size={28} />
              </button>
              <button onClick={onTogglePlayPause} className="dark:text-white text-blacktext-4xl">
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button onClick={onNext} className="dark:text-white text-black text-3xl">
                <SkipForward size={28} />
              </button>
            </div>

            {/* Seekbar */}
            <div className="w-full px-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => onSeekChange(parseFloat(e.target.value))}
                className="w-full h-1 accent-blue-500 rounded-md"
              />
            </div>
            {/* Up Next Queue */}
            <div className="w-full mt-6">
              <h4 className="text-md font-semibold mb-2">Up Next</h4>
              <ul className="space-y-2 text-sm">
                {upNextSongs.map(song => (
                  <li
                    key={song._id}
                    onClick={() => {
                      onSelectSong(song);
                      setIsExpanded(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <p className="truncate">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobilePlayerBar;
