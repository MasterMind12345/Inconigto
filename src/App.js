import React, { useState, useEffect } from 'react';
// IMPORT SUPPRIMÉ : import { supabase } from './supabaseClient';
import UserAuth from './components/UserAuth';
import UserDashboard from './components/UserDashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FloatingInstallButton from './components/FloatingInstallButton';
import SendMessage from './pages/SendMessage'; // AJOUTER

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
      console.error('Erreur:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      {/* Prompt d'installation PWA */}
      <PWAInstallPrompt />
      <FloatingInstallButton />

      {/* Header */}
      {user && (
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">🕵️</span>
                </div>
                <h1 className="text-white text-xl font-bold">SecretStory</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-white/80">@{user.username}</span> {/* CORRIGÉ */}
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={user ? 'py-8' : 'min-h-screen flex items-center justify-center py-8'}>
        {!user ? (
          <UserAuth setUser={setUser} />
        ) : (
          <UserDashboard user={user} />
        )}
      </main>
    </div>
  );
}

export default App;