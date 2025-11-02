import React, { useState, useEffect } from 'react';

const FloatingInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
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

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
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
        setIsVisible(false);
      }
    }
  };

  const handleIOSInstructions = () => {
    // Montrer les instructions iOS
    alert("Pour installer l'application :\n\n1. Appuyez sur le bouton Partager 📱\n2. Sélectionnez 'Sur l\'écran d'accueil'\n3. Appuyez sur 'Ajouter'");
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-bounce">
      {isIOS ? (
        <button
          onClick={handleIOSInstructions}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group"
          title="Installer l'application"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">📱</span>
            <span className="text-sm font-semibold group-hover:block hidden">
              Installer
            </span>
          </div>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:scale-110"
          title="Installer l'application"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">📥</span>
            <span className="text-sm font-semibold group-hover:block hidden">
              Installer
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default FloatingInstallButton;