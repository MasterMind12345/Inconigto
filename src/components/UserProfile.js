import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const UserProfile = ({ setUser }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    try {
      // Créer ou récupérer l'utilisateur
      const { data: user, error } = await supabase
        .from('users')
        .upsert({ username: username.toLowerCase() })
        .select()
        .single();

      if (error) throw error;
      
      setUser(user);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du profil');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Crée ton profil SecretStory
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Nom d'utilisateur</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="ton_super_pseudo"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Commencer à recevoir des messages
        </button>
      </form>
    </div>
  );
};

export default UserProfile;