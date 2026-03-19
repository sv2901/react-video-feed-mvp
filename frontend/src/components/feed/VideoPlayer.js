import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useVideo } from '../../context/VideoContext';
import { cn } from '../../lib/utils';

export function VideoPlayer({ video, isActive, index }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { isMuted, toggleMute, likeVideo } = useVideo();

  // Handle play/pause based on active state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const attemptPlay = async () => {
      if (isActive) {
        try {
          // Ensure video is muted for autoplay to work
          videoEl.muted = true;
          await videoEl.play();
          setIsPlaying(true);
        } catch (err) {
          console.log('Autoplay prevented, waiting for user interaction');
          setIsPlaying(false);
        }
      } else {
        videoEl.pause();
        setIsPlaying(false);
      }
    };

    attemptPlay();
  }, [isActive]);

  // Update mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Progress tracking and state sync
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      const prog = (videoEl.currentTime / videoEl.duration) * 100;
      setProgress(isNaN(prog) ? 0 : prog);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    
    return () => {
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    setHasInteracted(true);

    if (videoEl.paused) {
      videoEl.muted = isMuted;
      videoEl.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log('Play failed:', err);
          setIsPlaying(false);
        });
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [isMuted]);

  // Handle double tap to like
  const handleTap = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap - like
      if (!video.liked) {
        likeVideo(video.id);
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      setLastTap(0); // Reset to prevent triple tap issues
    } else {
      // Single tap - toggle play
      togglePlay();
      setLastTap(now);
    }
  }, [lastTap, video.id, video.liked, likeVideo, togglePlay]);

  const handleProgressClick = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration || !isFinite(videoEl.duration)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * videoEl.duration;
    
    // Only set if the new time is valid
    if (isFinite(newTime) && newTime >= 0 && newTime <= videoEl.duration) {
      videoEl.currentTime = newTime;
    }
    setHasInteracted(true);
  }, []);

  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div 
      className="snap-item h-[100dvh] w-full relative flex items-center justify-center bg-zinc-900 overflow-hidden"
      data-testid={`video-item-${index}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        className="absolute inset-0 w-full h-full object-cover cursor-pointer"
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        poster={video.thumbnail}
        data-testid={`video-player-${index}`}
      />
      
      {/* Clickable overlay for play/pause */}
      <div 
        className="absolute inset-0 z-10"
        onClick={handleTap}
        data-testid={`video-overlay-${index}`}
      />

      {/* Gradient Overlay - pointer events none so clicks pass through */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20" />

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause Indicator */}
      <AnimatePresence>
        {!isPlaying && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-40">
        {/* User Avatar */}
        <div className="relative mb-2">
          <img
            src={video.avatar}
            alt={video.username}
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
            data-testid={`avatar-${index}`}
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-white">
            +
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            likeVideo(video.id);
          }}
          className="flex flex-col items-center gap-1 group"
          data-testid={`like-btn-${index}`}
        >
          <div className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
            video.liked ? "bg-rose-500/20" : "bg-white/10 group-hover:bg-white/20"
          )}>
            <Heart className={cn(
              "w-6 h-6 transition-all duration-300",
              video.liked ? "text-rose-500 fill-rose-500 scale-110" : "text-white"
            )} />
          </div>
          <span className="text-xs font-semibold text-white font-heading">
            {formatCount(video.likes)}
          </span>
        </button>

        {/* Comment Button */}
        <button className="flex flex-col items-center gap-1 group" data-testid={`comment-btn-${index}`}>
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-white font-heading">
            {formatCount(video.comments)}
          </span>
        </button>

        {/* Share Button */}
        <button className="flex flex-col items-center gap-1 group" data-testid={`share-btn-${index}`}>
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-semibold text-white font-heading">
            {formatCount(video.shares)}
          </span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute left-4 right-20 bottom-24 z-40">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-white font-heading">@{video.username}</span>
          {video.isUserVideo && (
            <span className="px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-300 text-xs">You</span>
          )}
        </div>
        <p className="text-white text-sm leading-relaxed line-clamp-2" data-testid={`video-description-${index}`}>
          {video.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 bg-white/20 cursor-pointer z-50"
        onClick={handleProgressClick}
        onTouchEnd={handleProgressClick}
        data-testid={`progress-bar-${index}`}
      >
        <div 
          className="h-full gradient-accent transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mute Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center z-40 transition-all duration-300 hover:bg-white/10"
        data-testid={`mute-btn-${index}`}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}
