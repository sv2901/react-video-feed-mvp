import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const VideoContext = createContext(null);

// Sample videos from design guidelines
const SAMPLE_VIDEOS = [
  {
    id: "sample-1",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1563297552-b1cfbe330e2a?w=400&q=80",
    description: "Nature Vibes 🌿",
    username: "eco_warrior",
    avatar:
      "https://images.unsplash.com/photo-1771295762798-b235ef842030?w=100&h=100&fit=crop",
    likes: 12400,
    comments: 234,
    shares: 89,
    duration: 15,
    uploadTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "ready",
  },
  {
    id: "sample-2",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1704644246329-55c0dcca6186?w=400&q=80",
    description: "Night City Lights ✨",
    username: "cyber_drifter",
    avatar:
      "https://images.unsplash.com/photo-1660958822033-123215ae35fe?w=100&h=100&fit=crop",
    likes: 8900,
    comments: 156,
    shares: 45,
    duration: 12,
    uploadTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: "ready",
  },
  {
    id: "sample-3",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail:
      "https://images.unsplash.com/photo-1665846233251-a2b025c8ac5d?w=400&q=80",
    description: "Abstract Ink Art 🎨",
    username: "art_daily",
    avatar:
      "https://images.unsplash.com/photo-1646773777979-8242c6ee91c7?w=100&h=100&fit=crop",
    likes: 23500,
    comments: 412,
    shares: 178,
    duration: 20,
    uploadTime: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: "ready",
  },
];

const STORAGE_KEY = "velocast_videos";

export function VideoProvider({ children }) {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState(null);

  // Load videos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge sample videos with stored (user-uploaded) videos
        const userVideos = parsed.filter((v) => !v.id.startsWith("sample-"));
        setVideos([...SAMPLE_VIDEOS, ...userVideos]);
      } catch {
        setVideos(SAMPLE_VIDEOS);
      }
    } else {
      setVideos(SAMPLE_VIDEOS);
    }
  }, []);

  // Save user videos to localStorage
  const saveToStorage = useCallback((vids) => {
    const userVideos = vids.filter((v) => !v.id.startsWith("sample-"));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...SAMPLE_VIDEOS, ...userVideos]),
    );
  }, []);

  const addVideo = useCallback(
    (video) => {
      setVideos((prev) => {
        const newVideos = [video, ...prev];
        saveToStorage(newVideos);
        return newVideos;
      });
    },
    [saveToStorage],
  );

  const likeVideo = useCallback(
    (videoId) => {
      setVideos((prev) => {
        const updated = prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                likes: v.liked ? v.likes - 1 : v.likes + 1,
                liked: !v.liked,
              }
            : v,
        );
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Simulate upload with progress
  const simulateUpload = useCallback(async (file) => {
    return new Promise((resolve) => {
      setIsUploading(true);
      setUploadProgress(0);
      setProcessingState("uploading");

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(100);
          resolve();
        } else {
          setUploadProgress(Math.min(progress, 99));
        }
      }, 200);
    });
  }, []);

  // Simulate processing pipeline
  const simulateProcessing = useCallback(async () => {
    const stages = ["compressing", "transcoding", "thumbnail", "analyzing"];

    for (const stage of stages) {
      setProcessingState(stage);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    }

    setProcessingState("complete");
    await new Promise((r) => setTimeout(r, 500));
    setProcessingState(null);
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  // Handle file upload
  const uploadVideo = useCallback(
    async (file) => {
      const objectUrl = URL.createObjectURL(file);

      // Get video duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = objectUrl;

      const duration = await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(Math.round(video.duration));
        video.onerror = () => resolve(0);
      });

      // Generate thumbnail
      let thumbnail = "";
      try {
        video.currentTime = 1;
        await new Promise((resolve) => {
          video.onseeked = resolve;
          setTimeout(resolve, 1000);
        });

        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 600;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      } catch {
        thumbnail =
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80";
      }

      // Simulate upload
      await simulateUpload(file);

      // Simulate processing
      await simulateProcessing();

      // Create video object
      const newVideo = {
        id: `user-${Date.now()}`,
        url: objectUrl,
        thumbnail,
        description: file.name.replace(/\.[^/.]+$/, ""),
        username: "you",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        likes: 0,
        comments: 0,
        shares: 0,
        duration,
        uploadTime: new Date().toISOString(),
        status: "ready",
        isUserVideo: true,
      };

      addVideo(newVideo);
      setCurrentIndex(0);

      return newVideo;
    },
    [simulateUpload, simulateProcessing, addVideo],
  );

  const value = {
    videos,
    currentIndex,
    setCurrentIndex,
    isMuted,
    toggleMute,
    setIsMuted,
    likeVideo,
    uploadVideo,
    isUploading,
    uploadProgress,
    processingState,
    addVideo,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}
