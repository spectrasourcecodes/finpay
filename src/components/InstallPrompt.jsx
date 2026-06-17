// frontend/src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Battery, Zap, ArrowRight, AlertCircle } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already installed on iOS
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has dismissed the prompt before
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      const installDate = localStorage.getItem('pwa-install-date');
      
      if (!hasDismissed && !installDate) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000); // Show after 2 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-date', new Date().toISOString());
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
      localStorage.setItem('pwa-install-date', new Date().toISOString());
    } else {
      console.log('User dismissed the install prompt');
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleIOSInstall = () => {
    setShowIOSInstructions(true);
    setShowPrompt(false);
  };

  const closeIOSInstructions = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isInstalled) return null;

  // iOS instructions
  if (showIOSInstructions) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      >
        <div className="glass-card p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Install FinPay on iOS</h3>
            <button onClick={closeIOSInstructions} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-300">Follow these steps to install FinPay on your iPhone/iPad:</p>
            <ol className="space-y-3 text-gray-400">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Tap the <span className="inline-flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded-lg text-sm">Share <span className="text-sm">📤</span></span> button at the bottom of the screen</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Scroll down and tap <span className="bg-gray-800 px-2 py-1 rounded-lg text-sm">Add to Home Screen</span></span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Tap <span className="bg-gray-800 px-2 py-1 rounded-lg text-sm">Add</span> in the top right corner</span>
              </li>
            </ol>
            <button
              onClick={closeIOSInstructions}
              className="btn-gradient w-full mt-4 py-3"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-md"
        >
          <div className="glass-card p-5 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Install FinPay App</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Get faster access, offline support, and a better experience
                </p>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Zap className="w-3 h-3" />
                    <span>Fast</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Battery className="w-3 h-3" />
                    <span>Efficient</span>
                  </div>
                </div>

                <button
                  onClick={isIOS ? handleIOSInstall : handleInstall}
                  className="w-full btn-gradient py-2 flex items-center justify-center space-x-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;