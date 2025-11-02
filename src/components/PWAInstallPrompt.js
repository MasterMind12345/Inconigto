import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Détecter iOS
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIos);

    // Événement pour l'installation PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Montrer le prompt après 3 secondes
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installée');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwaPromptSeen', 'true');
    }
  };

  const handleClosePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptSeen', 'true');
  };

  const handleLaterClick = () => {
    setShowPrompt(false);
    // Remontrer dans 7 jours
    setTimeout(() => {
      localStorage.removeItem('pwaPromptSeen');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-3xl p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">📱</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">
            Installer l'application
          </h3>
          <p className="text-white/80 text-sm">
            Profitez d'une meilleure expérience avec l'app SecretStory
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {isIOS ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 text-lg">1</span>
                <p className="text-blue-800 text-sm">
                  Appuyez sur le bouton <span className="font-bold">Partager</span>
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 text-lg">2</span>
                <p className="text-blue-800 text-sm">
                  Sélectionnez <span className="font-bold">"Sur l'écran d'accueil"</span>
                </p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 text-lg">3</span>
                <p className="text-blue-800 text-sm">
                  Appuyez sur <span className="font-bold">"Ajouter"</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-green-500 text-lg">⚡</span>
                <p className="text-sm">Chargement plus rapide</p>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-green-500 text-lg">📱</span>
                <p className="text-sm">Expérience native</p>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-green-500 text-lg">🔔</span>
                <p className="text-sm">Notifications instantanées</p>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <span className="text-green-500 text-lg">🌙</span>
                <p className="text-sm">Hors ligne</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            {!isIOS && deferredPrompt && (
              <>
                <button
                  onClick={handleLaterClick}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Installer
                </button>
              </>
            )}
            {isIOS && (
              <button
                onClick={handleClosePrompt}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                Compris
              </button>
            )}
          </div>

          {isIOS && (
            <p className="text-center text-gray-500 text-xs mt-3">
              Suivez les étapes pour ajouter à l'écran d'accueil
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;