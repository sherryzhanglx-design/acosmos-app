import { useState, useEffect, useRef } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check if user has seen the splash before
    const hasSeenSplash = localStorage.getItem("acosmos_splash_seen");
    if (hasSeenSplash) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);

    // Try to unmute after user interaction
    const handleInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    };

    // Listen for any click to enable audio
    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      clearTimeout(skipTimer);
      document.removeEventListener('click', handleInteraction);
    };
  }, [onComplete]);

  const handleVideoEnd = () => {
    localStorage.setItem("acosmos_splash_seen", "true");
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem("acosmos_splash_seen", "true");
    setIsVisible(false);
    onComplete();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Video container with proper aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleVideoEnd}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ maxHeight: '100vh', maxWidth: '100vw' }}
        >
          <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/oqEeFtTPazBJrEMN.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Sound toggle button */}
      {showSkip && (
        <button
          onClick={toggleMute}
          className="absolute bottom-8 left-8 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all duration-300 border border-white/20"
        >
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      )}

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all duration-300 border border-white/20"
        >
          Skip Intro →
        </button>
      )}

      {/* Logo overlay at the end */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 animate-fade-in-delayed">
        <img 
          src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/brjZCKejzRbtntrI.jpg" 
          alt="A.Cosmos" 
          className="w-32 h-32 rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}
