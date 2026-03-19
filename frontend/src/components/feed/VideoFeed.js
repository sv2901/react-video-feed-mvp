import { useRef, useEffect, useCallback } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { useVideo } from '../../context/VideoContext';

export function VideoFeed() {
  const containerRef = useRef(null);
  const { videos, currentIndex, setCurrentIndex } = useVideo();

  // Intersection Observer for detecting active video
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = {
      root: container,
      rootMargin: '0px',
      threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index, 10);
          if (!isNaN(index)) {
            setCurrentIndex(index);
          }
        }
      });
    }, options);

    const items = container.querySelectorAll('[data-index]');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [videos.length, setCurrentIndex]);

  // Scroll to specific video
  const scrollToVideo = useCallback((index) => {
    const container = containerRef.current;
    if (!container) return;

    const item = container.querySelector(`[data-index="${index}"]`);
    if (item) {
      item.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll to first video when new video is uploaded
  useEffect(() => {
    if (currentIndex === 0 && videos.length > 0) {
      scrollToVideo(0);
    }
  }, [videos.length, currentIndex, scrollToVideo]);

  if (videos.length === 0) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white font-heading mb-2">No videos yet</h3>
          <p className="text-sm">Upload your first video to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll hide-scrollbar touch-pan-y"
      data-testid="video-feed"
    >
      {videos.map((video, index) => (
        <div key={video.id} data-index={index}>
          <VideoPlayer
            video={video}
            isActive={currentIndex === index}
            index={index}
          />
        </div>
      ))}
    </div>
  );
}
