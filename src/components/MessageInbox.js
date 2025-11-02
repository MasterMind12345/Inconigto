import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MessageImage from './MessageImage';

const MessageInbox = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    const subscription = supabase
      .channel('anonymous_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'anonymous_messages',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          setMessages(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('anonymous_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="text-white/70 mt-4">Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          📥 Tes messages secrets
        </h2>
        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
          {messages.length} message{messages.length > 1 ? 's' : ''}
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-6xl mb-4">💌</div>
          <p className="text-white/80 text-lg mb-2">Aucun message pour le moment</p>
          <p className="text-white/50">
            Partage ton lien pour recevoir tes premiers messages secrets !
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <MessageCard 
              key={message.id} 
              message={message} 
              username={user.username} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour chaque message
const MessageCard = ({ message, username }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadMessageImage = async () => {
    setIsGenerating(true);
    try {
      // On utilise le composant MessageImage pour générer l'image
      const imageUrl = await MessageImage.generate({
        message: message.message,
        username: username,
        date: new Date(message.created_at).toLocaleDateString('fr-FR')
      });
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `secretstory-${message.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur génération image:', error);
      alert('Erreur lors de la génération de l\'image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-white text-lg leading-relaxed">
            {message.message}
          </p>
          <p className="text-white/50 text-sm mt-2">
            {new Date(message.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={downloadMessageImage}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Génération...</span>
            </>
          ) : (
            <>
              <span>📸</span>
              <span>Partager en story</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInbox;