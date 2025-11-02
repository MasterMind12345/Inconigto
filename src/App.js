import React, { useState, useEffect } from 'react';
// Importation de React Router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Correction des chemins d'importation
import UserAuth from './components/UserAuth'; 
import UserDashboard from './components/UserDashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FloatingInstallButton from './components/FloatingInstallButton';
// CORRECTION : SendMessage est dans le dossier pages/
import SendMessage from './pages/SendMessage'; // ✅ Chemin corrigé

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    registerServiceWorker();
  }, []);

  const checkUser = async () => {
    try {
      const savedUser = localStorage.getItem('secretStory_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error);
    } finally {
      setLoading(false);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker enregistré avec succès');
      } catch (error) {
        console.log("L'enregistrement du Service Worker a échoué : ", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('secretStory_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-pink-600 flex items-center justify-center">
        <div className="text-white text-3xl font-bold animate-pulse">
          Chargement...
        </div>
      </div>
    );
  }

  // Composant d'affichage de l'application pour les utilisateurs connectés
  const AppLayout = () => (
    <>
      <PWAInstallPrompt />
      <FloatingInstallButton />

      {/* Header fixe en haut */}
      <header className="fixed top-0 left-0 w-full z-10 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="text-purple-600 font-bold text-lg">🕵️</span>
              </div>
              <h1 className="text-white text-xl font-bold">SecretStory</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white/80 hidden sm:inline">@{user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-md text-sm sm:text-base"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content avec padding pour le header fixe */}
      <main className="pt-20 pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Routes du tableau de bord */}
          <Routes>
            {/* Route par défaut pour l'utilisateur connecté */}
            <Route path="/" element={<UserDashboard user={user} />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </>
  );

  // Définition principale du routage
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-pink-600">
      <BrowserRouter>
        <Routes>
          {/* 1. ROUTE PUBLIQUE et DYNAMIQUE : Prioritaire pour gérer /send/:username */}
          <Route path="/send/:username" element={<SendMessage />} /> {/* ✅ Route corrigée */}

          {/* 2. ROUTE D'AUTHENTIFICATION/DASHBOARD (catch-all pour le reste) */}
          <Route 
            path="*" 
            element={user ? <AppLayout /> : <UserAuth setUser={setUser} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;