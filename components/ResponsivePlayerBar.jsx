// ResponsivePlayerBar.jsx
import React, { useState, useEffect } from 'react';
import PlayerBar from './PlayerBar';
import MobilePlayerBar from './MobilePlayerBar';

const ResponsivePlayerBar = ({
  nowPlaying,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  currentTime,
  duration,
  onSeek,
  onVolumeChange,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileFull, setShowMobileFull] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 768;
      setIsMobile(isNowMobile);
      if (!isNowMobile) setShowMobileFull(false); // Reset if back to desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <MobilePlayerBar
        nowPlaying={nowPlaying}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onSkipNext={onSkipNext}
        onSkipPrevious={onSkipPrevious}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        showFull={showMobileFull}
        setShowFull={setShowMobileFull}
      />
    );
  }

  // DESKTOP
  return (
    <PlayerBar
      nowPlaying={nowPlaying}
      isPlaying={isPlaying}
      onPlayPause={onPlayPause}
      onSkipNext={onSkipNext}
      onSkipPrevious={onSkipPrevious}
      currentTime={currentTime}
      duration={duration}
      onSeek={onSeek}
      onVolumeChange={onVolumeChange}
    />
  );
};

export default ResponsivePlayerBar;
