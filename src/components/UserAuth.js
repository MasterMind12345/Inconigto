import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const UserAuth = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    setLoading(true);

    try {
      const formattedUsername = username.toLowerCase().trim();

      if (isLogin) {
        // Connexion
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', formattedUsername)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            alert('❌ Utilisateur non trouvé. Crée un nouveau profil.');
            return;
          }
          throw error;
        }

        localStorage.setItem('secretStory_user', JSON.stringify(user));
        setUser(user);
      } else {
        // Inscription
        const { data: user, error } = await supabase
          .from('users')
          .upsert(
            { username: formattedUsername },
            { onConflict: 'username' }
          )
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            alert('❌ Ce nom d\'utilisateur existe déjà. Connecte-toi !');
            setIsLogin(true);
            return;
          }
          throw error;
        }

        localStorage.setItem('secretStory_user', JSON.stringify(user));
        setUser(user);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🕵️‍♀️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SecretStory</h1>
          <p className="text-white/70">Reçois des messages anonymes</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
              placeholder="ton_super_pseudo"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
                Chargement...
              </div>
            ) : isLogin ? (
              'Se connecter'
            ) : (
              'Commencer'
            )}
          </button>
        </form>

        {/* Switch Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/70 hover:text-white transition-colors text-sm"
          >
            {isLogin 
              ? "Pas de compte ? Créer un nouveau profil" 
              : "Déjà un compte ? Se connecter"
            }
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="text-white/70">
            <div className="text-lg">🔒</div>
            <p className="text-xs mt-1">100% Anonyme</p>
          </div>
          <div className="text-white/70">
            <div className="text-lg">🎨</div>
            <p className="text-xs mt-1">Design Moderne</p>
          </div>
          <div className="text-white/70">
            <div className="text-lg">📱</div>
            <p className="text-xs mt-1">Responsive</p>
          </div>
          <div className="text-white/70">
            <div className="text-lg">⚡</div>
            <p className="text-xs mt-1">Rapide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;