// AppPlayer.jsx
import { useState, useEffect, useRef } from 'react';
import useIsMobile from './hooks/useIsMobile'; // Custom hook
import PlayerBar from './PlayerBar';
import MobilePlayerBar from './MobilePlayerBar';

const AppPlayer = () => {
  const audioRef = useRef(new Audio('/your-audio-file.mp3')); // Change this path
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);

  const nowPlaying = {
    title: "Khesari Lal Yadav",
    artist: "Album Thik Hai",
    coverImage: "/your-album-cover.jpg", // Replace this
  };

  const isMobile = useIsMobile();

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changeVolume = (value) => {
    audioRef.current.volume = value;
    setVolume(value);
  };

  const seek = (value) => {
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const skipNext = () => {
    // Implement skip logic
  };

  const skipPrevious = () => {
    // Implement skip logic
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
    audioRef.current.loop = !isRepeat;
  };

  const sharedProps = {
    nowPlaying,
    isPlaying,
    onTogglePlayPause: togglePlayPause,
    currentTime,
    duration,
    onSeekChange: seek,
    onVolumeChange: changeVolume,
    onSkipNext: skipNext,
    onSkipPrevious: skipPrevious,
    onToggleRepeat: toggleRepeat,
  };

  return isMobile ? (
    <MobilePlayerBar {...sharedProps} />
  ) : (
    <PlayerBar {...sharedProps} audio={audioRef.current} />
  );
};

export default AppPlayer;
