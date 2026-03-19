import { useState } from 'react';
import { VideoProvider } from './context/VideoContext';
import { VideoFeed } from './components/feed/VideoFeed';
import { BottomNav } from './components/layout/BottomNav';
import { UploadDrawer } from './components/upload/UploadDrawer';
import './App.css';

function AppContent() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="h-[100dvh] w-full bg-zinc-950 overflow-hidden" data-testid="app-container">
      {/* Main Video Feed */}
      <VideoFeed />
      
      {/* Bottom Navigation */}
      <BottomNav onCreateClick={() => setIsUploadOpen(true)} />
      
      {/* Upload Drawer */}
      <UploadDrawer 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  );
}

function App() {
  return (
    <VideoProvider>
      <AppContent />
    </VideoProvider>
  );
}

export default App;
