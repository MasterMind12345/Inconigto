import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SendMessage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [username]);

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Utilisateur non trouvé');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('anonymous_messages')
        .insert({
          user_id: user.id,
          message: message.trim()
        });

      if (error) throw error;

      setMessage('');
      alert('✅ Message envoyé anonymement !');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600">Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Message secret pour
        </h1>
        <p className="text-purple-600 font-semibold text-xl mb-6">@{username}</p>

        <form onSubmit={sendMessage}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Ton message anonyme :
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
              placeholder="Écris ton message secret ici..."
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {message.length}/500 caractères
            </p>
          </div>

          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Envoi en cours...' : '🕵️‍♀️ Envoyer anonymement'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800 text-center">
            🔒 Ton identité restera totalement secrète
          </p>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;