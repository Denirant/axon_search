import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'chrome' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isDismissed = localStorage.getItem('installPromptDismissed');
    if (isDismissed) return;

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && /google inc/.test(navigator.vendor.toLowerCase());

    if (isIOSDevice) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else if (isChrome) setPlatform('chrome');

    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });

    // Show prompt for iOS after delay
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };


  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96"
        >
          <Card className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-medium text-xl text-neutral-900 dark:text-neutral-100">
                  Install AxonAI
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
