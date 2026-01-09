import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has previously dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:max-w-sm"
      >
        <Card className="shadow-2xl border-2 border-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-1">Install TaxRelief NG</h4>
                <p className="text-sm text-slate-600 mb-3">
                  Get the full app experience - faster access, offline support, and home screen shortcut!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}