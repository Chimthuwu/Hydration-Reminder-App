/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Droplets, 
  Settings, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2,
  BellRing,
  Monitor,
  Download,
  Info,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_INTERVAL = 40; // minutes
const SOUND_OPTIONS = [
  { id: 'hydrate', name: 'Hydrate Ping', url: 'https://www.myinstants.com/media/sounds/cute-uwu.mp3' },
  { id: 'classic', name: 'Classic Alert', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'bubble', name: 'Bubble Pop', url: 'https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3' }
];
const HYDRATION_IMAGES = [
  'https://i.ibb.co/XkJTzGND/HYDRATE.png'
];

export default function App() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_INTERVAL * 60);
  const [isActive, setIsActive] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(DEFAULT_INTERVAL);
  const [showReminder, setShowReminder] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentImage, setCurrentImage] = useState(HYDRATION_IMAGES[0]);
  const [stats, setStats] = useState({ glasses: 0, totalMl: 0 });
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const [showStartupPrompt, setShowStartupPrompt] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showStartupGuide, setShowStartupGuide] = useState(false);
  const [customSound, setCustomSound] = useState(SOUND_OPTIONS[0].url);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio and check for startup prompt
  useEffect(() => {
    // Pre-warm the audio object
    const audio = new Audio(customSound);
    audio.load();
    audioRef.current = audio;
    
    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Prevent accidental close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = 'HydroFlow needs to stay open to remind you to hydrate! Please minimize instead of closing.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check if user has seen startup prompt
    const hasSeenPrompt = localStorage.getItem('hydroflow_startup_prompt');
    if (!hasSeenPrompt) {
      setShowStartupPrompt(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Attempt to resize window for standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      try {
        window.resizeTo(400, 600);
      } catch (e) {
        console.log('Window resize not supported');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [customSound, isActive]);

  // Update Taskbar Badge
  useEffect(() => {
    if ('setAppBadge' in navigator && stats.glasses > 0) {
      try {
        (navigator as any).setAppBadge(stats.glasses);
      } catch (e) {
        console.error('Badge failed', e);
      }
    }
  }, [stats.glasses]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const playNotification = useCallback(() => {
    if (isMuted) {
      console.log('Sound is muted, skipping playback');
      return;
    }
    
    console.log('Attempting to play sound:', customSound);
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          console.log('Primary audio playback started successfully');
        })
        .catch(err => {
          console.error('Primary audio playback failed:', err);
          
          if (err.name === 'NotAllowedError') {
            console.warn('Autoplay blocked. User interaction required.');
            return;
          }

          // Fallback mechanism
          if (fallbackAudioRef.current) {
            console.log('Attempting fallback to local /HYDRATE.mp3');
            fallbackAudioRef.current.currentTime = 0;
            fallbackAudioRef.current.play().catch(fallbackErr => {
              console.error('Fallback audio also failed:', fallbackErr);
            });
          }
        });
    }
  }, [isMuted, customSound]);

  const triggerReminder = useCallback(() => {
    setIsActive(false);
    setShowReminder(true);
    setIsBackgroundMode(false); // Bring to foreground when reminder triggers
    const nextImg = HYDRATION_IMAGES[Math.floor(Math.random() * HYDRATION_IMAGES.length)];
    console.log('Triggering reminder with image:', nextImg);
    setCurrentImage(nextImg);
    playNotification();

    // System Notification
    if (notificationPermission === 'granted') {
      new Notification('Time to Hydrate!', {
        body: 'Take a sip of water to stay focused and healthy.',
        icon: '/HYDRATE.png',
        tag: 'hydration-reminder'
      });
    }
  }, [playNotification, notificationPermission]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            triggerReminder();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, triggerReminder]);

  const toggleTimer = () => {
    if (!isActive) {
      // Request notification permission when starting
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
      setIsActive(true);
      setIsBackgroundMode(true); // Dismiss to background when starting
    } else {
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBackgroundMode(false);
    setTimeLeft(intervalMinutes * 60);
  };

  const handleDrink = () => {
    setStats(prev => ({
      glasses: prev.glasses + 1,
      totalMl: prev.totalMl + 250
    }));
    setShowReminder(false);
    resetTimer();
    setIsActive(true);
    setIsBackgroundMode(true); // Go back to background after drinking
  };

  const dismissStartupPrompt = (setup: boolean) => {
    localStorage.setItem('hydroflow_startup_prompt', 'true');
    setShowStartupPrompt(false);
    if (setup) {
      // In a real PWA/Electron app, this would trigger OS-level startup registration
      console.log("Startup registration requested");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((intervalMinutes * 60 - timeLeft) / (intervalMinutes * 60)) * 100;

  if (isBackgroundMode) {
    return (
      <div className={`min-h-screen flex items-end justify-end p-4 pointer-events-none transition-colors duration-500 ${
        isDarkMode ? 'bg-slate-900/0' : 'bg-blue-50/0'
      }`}>
        {/* Hidden Audio Elements for Reliable Playback */}
        <audio ref={audioRef} src={customSound} preload="auto" />
        <audio ref={fallbackAudioRef} src="/HYDRATE.mp3" preload="auto" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`p-3 rounded-2xl flex items-center gap-3 pointer-events-auto cursor-pointer transition-all shadow-2xl border ${
            isDarkMode 
            ? 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800/90' 
            : 'bg-white/90 border-blue-100 text-slate-800 hover:bg-white'
          }`}
          onClick={() => setIsBackgroundMode(false)}
        >
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="transparent" className={isDarkMode ? 'text-slate-800' : 'text-slate-100'} />
              <circle
                cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="transparent"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * progress) / 100}
                className="text-blue-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets size={14} className="text-blue-500" />
            </div>
          </div>
          <div className="pr-2">
            <p className={`text-[10px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Next Sip</p>
            <p className="text-base font-mono font-bold leading-none">{formatTime(timeLeft)}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden ${
      isDarkMode ? 'bg-slate-950' : 'bg-blue-100/50'
    }`}>
      {/* Hidden Audio Elements for Reliable Playback */}
      <audio ref={audioRef} src={customSound} preload="auto" />
      <audio ref={fallbackAudioRef} src="/HYDRATE.mp3" preload="auto" />

      {/* Main Widget Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-[400px] h-fit flex flex-col overflow-hidden relative transition-all duration-500 sm:rounded-[2.5rem] sm:shadow-2xl sm:border ${
          isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-200' 
          : 'bg-white border-blue-50 text-slate-900'
        }`}
      >
        {/* Startup Prompt Modal */}
        <AnimatePresence>
          {showStartupPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <BellRing size={32} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Set as Startup App?</h2>
                <p className={`mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Would you like HydroFlow to open automatically every time your computer starts? You'll never miss a sip.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => dismissStartupPrompt(true)}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                  >
                    Yes, enable on startup
                  </button>
                  <button 
                    onClick={() => dismissStartupPrompt(false)}
                    className={`w-full py-4 font-bold rounded-2xl transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Maybe later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex flex-col overflow-hidden relative">
          {/* Header */}
          <div className={`p-5 pt-8 flex items-center justify-between border-b ${
            isDarkMode ? 'border-slate-800/50' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <img
                src="https://i.ibb.co/XkJTzGND/HYDRATE.png"
                alt="HydroFlow Logo"
                className="object-contain h-18 w-auto"
              />
              <h1 className="font-bold text-lg tracking-tight">iFaggot</h1>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

        {/* Timer Display */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Progress Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="104"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className={isDarkMode ? 'text-slate-800' : 'text-slate-100'}
              />
              <motion.circle
                cx="112"
                cy="112"
                r="104"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={653}
                initial={{ strokeDashoffset: 653 }}
                animate={{ strokeDashoffset: 653 - (653 * progress) / 100 }}
                className="text-blue-500"
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-xs font-medium mt-1 uppercase tracking-widest ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Next Sip
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-5 mt-8">
            <button 
              onClick={resetTimer}
              className={`p-3.5 rounded-xl transition-all active:scale-95 ${
                isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={toggleTimer}
              className={`p-5 rounded-2xl shadow-lg transition-all active:scale-95 ${
                isActive 
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-900/20' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20'
              }`}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={triggerReminder}
              className={`p-3.5 rounded-xl transition-all active:scale-95 ${
                isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BellRing size={20} />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`p-5 grid grid-cols-2 gap-3 border-t ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800/50' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <div className={`p-3.5 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Glasses</p>
            <p className="text-xl font-bold">{stats.glasses}</p>
          </div>
          <div className={`p-3.5 rounded-xl border transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Total</p>
            <p className="text-xl font-bold">{stats.totalMl}ml</p>
          </div>
        </div>

        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className={`absolute inset-0 z-20 p-6 flex flex-col ${
                isDarkMode ? 'bg-slate-900' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={() => setShowSettings(false)} className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                }`}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 pb-6">
                <div>
                  <label className={`block text-[10px] font-bold uppercase mb-3 ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Reminder Interval (Minutes)
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="120" 
                      value={intervalMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setIntervalMinutes(val);
                        setTimeLeft(val * 60);
                      }}
                      className="flex-1 h-1.5 bg-blue-900/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="w-10 text-center font-bold text-blue-500 text-sm">{intervalMinutes}m</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-blue-900/10 border-blue-900/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-700'
                }`}>
                  <p className="text-xs leading-relaxed">
                    Staying hydrated improves focus, energy levels, and overall health. We recommend 250ml every 40-60 minutes.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className={`block text-[10px] font-bold uppercase ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    System Notifications
                  </label>
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <BellRing size={16} className={notificationPermission === 'granted' ? 'text-green-500' : 'text-slate-400'} />
                      <span className="text-sm font-medium">
                        {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked' : 'Not Set'}
                      </span>
                    </div>
                    {notificationPermission !== 'granted' && (
                      <button 
                        onClick={() => {
                          if ('Notification' in window) {
                            Notification.requestPermission().then(setNotificationPermission);
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`block text-[10px] font-bold uppercase ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Notification Sound
                  </label>
                  <div className="space-y-2">
                    {SOUND_OPTIONS.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => setCustomSound(sound.url)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          customSound === sound.url
                          ? (isDarkMode ? 'bg-blue-600/20 border-blue-600 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600')
                          : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Volume2 size={16} />
                          <span className="text-sm font-medium">{sound.name}</span>
                        </div>
                        {customSound === sound.url && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800/50 bg-slate-900/30 mt-2">
                    <button 
                      onClick={playNotification}
                      className={`flex items-center gap-2 text-xs font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                    >
                      <Play size={14} />
                      Test Sound
                    </button>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isMuted 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-blue-600 text-white'
                      }`}
                    >
                      {isMuted ? 'Muted' : 'Enabled'}
                    </button>
                  </div>
                </div>

                {isInstallable && (
                  <div className="pt-4 border-t border-slate-800/50">
                    <button 
                      onClick={handleInstall}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Download size={18} />
                      Install as Desktop App
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    onClick={() => setShowStartupGuide(true)}
                    className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                      isDarkMode 
                      ? 'border-slate-800 text-slate-400 hover:bg-slate-800' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Monitor size={18} />
                    Auto-Startup Guide
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="mt-auto w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors active:scale-95"
              >
                Save Changes
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminder Popup Overlay */}
        <AnimatePresence>
          {showReminder && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-4 right-4 z-50 max-w-[calc(100%-2rem)] w-[320px] pointer-events-auto"
            >
              <div className={`rounded-3xl overflow-hidden shadow-2xl border-2 ${
                isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-blue-100'
              } backdrop-blur-xl`}>
                <div className="relative bg-slate-800/50 min-h-[200px] flex items-center justify-center overflow-hidden">
                  <img 
                    src={currentImage} 
                    alt="Hydration" 
                    className="w-full h-auto block object-cover"
                    referrerPolicy="no-referrer"
                    onLoad={() => console.log('Image loaded successfully:', currentImage)}
                    onError={(e) => {
                      console.error('Image failed to load:', currentImage);
                      const target = e.target as HTMLImageElement;
                      // Fallback to local file if the URL fails, but NO generic images
                      if (target.src !== '/HYDRATE.png') {
                        target.src = '/HYDRATE.png';
                      }
                    }}
                  />
                </div>
                
                <div className="px-6 pt-4 text-center">
                  <h3 className={`text-xl font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>💦💦💦</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Drink it all down, swallow it.</p>
                </div>
                
                <div className="p-6 flex flex-col gap-3">
                  <button 
                    onClick={handleDrink}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 size={18} />
                    I drank water
                  </button>
                  <button 
                    onClick={() => setShowReminder(false)}
                    className={`w-full py-3 font-bold rounded-xl transition-colors ${
                      isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    Snooze 5m
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Startup Guide Modal */}
      <AnimatePresence>
        {showStartupGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                      <Monitor size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Auto-Startup Guide</h2>
                  </div>
                  <button onClick={() => setShowStartupGuide(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-bold mb-1">Install the App</p>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Click the "Install" button in the settings or browser address bar to save HydroFlow to your PC.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-bold mb-1">Enable Startup</p>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Right-click the app in your Taskbar → <span className="text-blue-400">App Settings</span> → Toggle <span className="text-blue-400">"Starts at login"</span>.
                      </p>
                      <div className={`mt-3 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Pro Tip</p>
                        <p className={`text-[10px] leading-relaxed italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          "Browsers cannot automatically set startup for security, but once enabled, HydroFlow will launch every time you turn on your PC!"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex gap-3">
                    <Info size={20} className="text-blue-500 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Background Tip</p>
                      <p className="text-xs text-blue-400 leading-relaxed">
                        To keep the timer running, <strong>Minimize</strong> the app instead of closing it. PWAs live in your Taskbar rather than the System Tray!
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowStartupGuide(false)}
                  className="mt-8 w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decoration Removed for Module Look */}
    </div>
  );
}
