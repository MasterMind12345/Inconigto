import React from 'react';

class MessageImage {
  static async generate({ message, username, date }) {
    return new Promise((resolve) => {
      // Créer un canvas pour générer l'image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Dimensions pour les stories (9:16)
      canvas.width = 1080;
      canvas.height = 1920;
      
      // Fond gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(0.5, '#EC4899');
      gradient.addColorStop(1, '#3B82F6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Logo et titre
      ctx.fillStyle = 'white';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🕵️‍♀️ SecretStory', canvas.width / 2, 200);
      
      // Sous-titre
      ctx.font = '30px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Message anonyme pour', canvas.width / 2, 280);
      
      // Nom d'utilisateur
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`@${username}`, canvas.width / 2, 350);
      
      // Carte du message
      const cardWidth = canvas.width - 160;
      const cardHeight = 800;
      const cardX = 80;
      const cardY = 500;
      
      // Fond de la carte
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 40);
      ctx.fill();
      ctx.stroke();
      
      // Icône message
      ctx.font = '80px Arial';
      ctx.fillText('💌', canvas.width / 2, cardY + 120);
      
      // Message (avec gestion du texte trop long)
      ctx.font = 'bold 42px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      
      const maxWidth = cardWidth - 80;
      const words = message.split(' ');
      const lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      
      // Afficher le message (maximum 8 lignes)
      const displayedLines = lines.slice(0, 8);
      const lineHeight = 60;
      const startY = cardY + 220;
      
      displayedLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
      });
      
      // Si le message est tronqué
      if (lines.length > 8) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('...', canvas.width / 2, startY + (8 * lineHeight));
      }
      
      // Date
      ctx.font = '30px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`Reçu le ${date}`, canvas.width / 2, cardY + cardHeight - 60);
      
      // Pied de page
      ctx.font = '25px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText('secretstory.app', canvas.width / 2, canvas.height - 100);
      
      // Convertir en URL data
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    });
  }
}

// Composant React pour prévisualisation (optionnel)
export const MessageImagePreview = ({ message, username, date, className }) => {
  const [imageUrl, setImageUrl] = React.useState('');
  
  React.useEffect(() => {
    MessageImage.generate({ message, username, date }).then(setImageUrl);
  }, [message, username, date]);
  
  return imageUrl ? (
    <img 
      src={imageUrl} 
      alt="Message SecretStory" 
      className={className}
    />
  ) : null;
};

export default MessageImage;